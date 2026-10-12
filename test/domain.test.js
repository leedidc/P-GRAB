import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeDomain,
  storageKey,
  domainRecords,
  sensitivityColor,
  elapsedTime,
} from "../js/domainUtils.js";
import {
  saveDomain,
  removeDomain,
  clearDomains,
  recordVisit,
} from "../js/domainStorage.js";

let data;
test.beforeEach(() => {
  data = { settings: { enabled: true } };
  globalThis.chrome = {
    storage: {
      sync: {
        get: async (key) =>
          key === null ? structuredClone(data) : { [key]: data[key] },
        set: async (values) => Object.assign(data, values),
        remove: async (key) => {
          delete data[key];
        },
      },
    },
  };
});
test("normalizes web addresses and rejects non-web or credential URLs", () => {
  assert.equal(normalizeDomain(" HTTPS://Example.COM/path "), "example.com");
  for (const value of [
    "",
    "chrome://settings",
    "https://user:pass@example.com",
    "broken address",
  ])
    assert.throws(() => normalizeDomain(value));
});
test("host keys do not collide with hyphenated hostnames", () => {
  assert.notEqual(storageKey("a.b.example"), storageKey("a-b.example"));
});
test("legacy migration preserves categories and unrelated settings", async () => {
  data["example-com"] = {
    url: "example.com",
    lastAccessTime: 100,
    privacyList: ["이름"],
  };
  await saveDomain("example.com", [" 이메일 ", "이름"], "append");
  assert.deepEqual(data["domain:example.com"].privacyList, ["이름", "이메일"]);
  assert.equal(data["domain:example.com"].lastAccessTime, 100);
  assert.equal(data["example-com"], undefined);
  await clearDomains();
  assert.deepEqual(data, { settings: { enabled: true } });
});
test("does not delete a different host with a colliding legacy key", async () => {
  data["a-b-example"] = {
    url: "a-b.example",
    lastAccessTime: 100,
    privacyList: [],
  };
  await saveDomain("a.b.example", []);
  await removeDomain("a.b.example");
  assert.equal(data["a-b-example"].url, "a-b.example");
});
test("visits update registered sites only and keep categories", async () => {
  await saveDomain("example.com", ["이름"]);
  data["domain:example.com"].lastAccessTime = 1;
  await recordVisit("https://example.com/a");
  await recordVisit("https://unregistered.example");
  assert.ok(data["domain:example.com"].lastAccessTime > 1);
  assert.deepEqual(data["domain:example.com"].privacyList, ["이름"]);
  assert.equal(domainRecords(data).length, 1);
});
test("duplicate registration and writes that fail are reported", async () => {
  await saveDomain("example.com", []);
  await assert.rejects(saveDomain("example.com", []));
  chrome.storage.sync.set = async () => {
    throw new Error("quota");
  };
  await assert.rejects(saveDomain("other.example", []), /quota/);
});
test("sensitivity uses the highest grade independent of item order", () => {
  assert.equal(sensitivityColor(["이름", "기타"]), "orange");
  assert.equal(sensitivityColor(["기타", "이름", "여권 번호"]), "red");
  assert.equal(sensitivityColor([]), "gray");
});
test("ignores malformed storage records and future times are not negative", () => {
  assert.deepEqual(domainRecords({ junk: { url: "example.com" } }), []);
  assert.equal(elapsedTime(2000, 1000), "0초 전");
});
