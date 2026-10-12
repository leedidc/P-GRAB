import {
  domainRecords,
  normalizeDomain,
  normalizePrivacyList,
  storageKey,
} from "./domainUtils.js";

export async function listDomains() {
  return domainRecords(await chrome.storage.sync.get(null));
}

export async function saveDomain(value, privacyList, mode = "create") {
  const domain = normalizeDomain(value);
  const records = await listDomains();
  const previous = records.find((record) => record.url === domain);
  if (mode === "create" && previous)
    throw new Error(
      "이미 등록한 웹사이트입니다. 개인정보 추가를 이용해 주세요.",
    );
  if (mode === "append" && !previous)
    throw new Error("웹사이트를 먼저 등록해 주세요.");
  await chrome.storage.sync.set({
    [storageKey(domain)]: {
      url: domain,
      lastAccessTime: previous?.lastAccessTime ?? Date.now(),
      privacyList: normalizePrivacyList([
        ...(previous?.privacyList ?? []),
        ...privacyList,
      ]),
    },
  });
  await removeLegacyKey(domain);
}

async function removeLegacyKey(domain) {
  const legacy = domain.replaceAll(".", "-");
  const data = await chrome.storage.sync.get(legacy);
  if (data[legacy]?.url === domain) await chrome.storage.sync.remove(legacy);
}

export async function removeDomain(domain) {
  await chrome.storage.sync.remove(storageKey(domain));
  await removeLegacyKey(domain);
}

export async function clearDomains() {
  for (const record of await listDomains()) await removeDomain(record.url);
}

export async function recordVisit(url) {
  let domain;
  try {
    domain = normalizeDomain(url);
  } catch {
    return;
  }
  const record = (await listDomains()).find((value) => value.url === domain);
  if (!record) return;
  await chrome.storage.sync.set({
    [storageKey(domain)]: { ...record, lastAccessTime: Date.now() },
  });
  await removeLegacyKey(domain);
}
