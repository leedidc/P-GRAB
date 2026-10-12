import { normalizeDomain } from "./domainUtils.js";
import { saveDomain } from "./domainStorage.js";

export async function renderRegister(container) {
  const input = container.querySelector("#domainInput");
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.url && /^https?:\/\//i.test(tab.url))
      input.value = normalizeDomain(tab.url);
  } catch {
    /* A restricted tab may not expose its URL. */
  }
  async function save(mode, button) {
    button.disabled = true;
    try {
      const items = [
        ...container.querySelectorAll(".privacy-item input:checked"),
      ].map((node) => node.parentElement.textContent.trim());
      await saveDomain(input.value, items, mode);
      alert(
        mode === "create"
          ? "웹사이트를 등록했습니다."
          : "제공한 개인정보 항목을 추가했습니다.",
      );
    } catch (error) {
      alert(error.message || "저장하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      button.disabled = false;
    }
  }
  container
    .querySelector("#storeDomainButton")
    .addEventListener("click", (event) => save("create", event.currentTarget));
  container
    .querySelector("#registerPrivacyListButton")
    .addEventListener("click", (event) => save("append", event.currentTarget));
}
