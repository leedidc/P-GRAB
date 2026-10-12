import { elapsedTime } from "./domainUtils.js";
import { listDomains, removeDomain, clearDomains } from "./domainStorage.js";

export async function renderList(container) {
  const list = document.createElement("div");
  const clear = document.createElement("button");
  clear.id = "clearDomainAllButton";
  clear.textContent = "등록한 웹사이트 전체 삭제";
  clear.addEventListener("click", async () => {
    if (!confirm("등록한 웹사이트 정보를 모두 삭제하시겠습니까?")) return;
    try {
      await clearDomains();
      await refresh();
    } catch {
      alert("삭제하지 못했습니다. 다시 시도해 주세요.");
    }
  });
  container.append(clear, list);
  async function refresh() {
    const records = await listDomains();
    list.replaceChildren();
    clear.disabled = records.length === 0;
    if (!records.length) list.textContent = "등록한 웹사이트가 없습니다.";
    for (const record of records) {
      const row = document.createElement("ul");
      if (Date.now() - record.lastAccessTime > 180 * 86400000)
        row.classList.add("withdralRecommended");
      const name = document.createElement("li");
      name.className = "url";
      name.textContent = record.url;
      const elapsed = document.createElement("li");
      elapsed.className = "elapsedTimeStr";
      elapsed.textContent = elapsedTime(record.lastAccessTime);
      const remove = document.createElement("button");
      remove.className = "deleteButton";
      remove.textContent = "삭제";
      remove.addEventListener("click", async () => {
        if (!confirm("이 웹사이트의 등록 정보를 삭제하시겠습니까?")) return;
        try {
          await removeDomain(record.url);
          await refresh();
        } catch {
          alert("삭제하지 못했습니다. 다시 시도해 주세요.");
        }
      });
      row.append(name, elapsed, remove);
      list.append(row);
    }
  }
  await refresh();
}
