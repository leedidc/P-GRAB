import { recordVisit } from "./domainStorage.js";

async function updateVisit(url) {
  if (!url || !/^https?:\/\//i.test(url)) return;
  try {
    await recordVisit(url);
  } catch {
    console.warn("웹사이트 방문 시간을 저장하지 못했습니다.");
  }
}
chrome.tabs.onUpdated.addListener((_id, change, tab) => {
  if (change.status === "complete" || change.url) updateVisit(tab.url);
});
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    await updateVisit((await chrome.tabs.get(tabId)).url);
  } catch {
    /* Tab may have closed. */
  }
});
