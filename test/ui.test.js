import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";
import { renderSensitivity } from "../js/domainSensitivity.js";

test("sensitivity panel toggles safely and renders all categories as text", async () => {
  const dom = new JSDOM('<main id="content"></main>');
  globalThis.document = dom.window.document;
  globalThis.chrome = {
    storage: {
      sync: {
        get: async () => ({
          "domain:example.com": {
            url: "example.com",
            lastAccessTime: 1,
            privacyList: ["<img src=x>"],
          },
        }),
      },
    },
  };
  const container = document.getElementById("content");
  await renderSensitivity(container);
  const button = container.querySelector("button");
  assert.equal(button.getAttribute("aria-expanded"), "false");
  button.click();
  assert.equal(button.getAttribute("aria-expanded"), "true");
  assert.equal(container.querySelector(".toggle-content").hidden, false);
  assert.equal(container.querySelector("img"), null);
});
test("optional detection avoids a required checkbox containing an ad substring", () => {
  const dom = new JSDOM(
    '<label><input type="checkbox" id="addressRequired">필수 주소</label><label><input type="checkbox" id="marketingAgree">선택 광고</label>',
    { runScripts: "outside-only" },
  );
  dom.window.eval(
    fs.readFileSync(
      new URL("../js/IDNameBasedBlock.js", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(
    Array.from(dom.window.IDNameBasedBlock(), (node) => node.id),
    ["marketingAgree"],
  );
});
test("declared extension scripts and popup assets exist with exact case", () => {
  const root = new URL("../", import.meta.url);
  const manifest = JSON.parse(fs.readFileSync(new URL("manifest.json", root)));
  for (const name of [
    manifest.background.service_worker,
    ...manifest.content_scripts.flatMap((item) => item.js),
  ]) {
    const url = new URL(name, root);
    assert.ok(
      fs
        .readdirSync(new URL(".", url))
        .includes(url.pathname.split("/").at(-1)),
    );
  }
  const popup = new JSDOM(
    fs.readFileSync(new URL("html/popup.html", root), "utf8"),
  );
  for (const element of popup.window.document.querySelectorAll(
    "script[src],link[href],img[src]",
  )) {
    assert.ok(
      fs.existsSync(
        new URL(
          element.getAttribute("src") || element.getAttribute("href"),
          new URL("html/popup.html", root),
        ),
      ),
    );
  }
});
