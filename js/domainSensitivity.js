import { sensitivityColor } from "./domainUtils.js";
import { listDomains } from "./domainStorage.js";

export async function renderSensitivity(container) {
  const records = await listDomains();
  const list = document.createElement("ul");
  list.className = "toggle-list";
  if (!records.length) list.textContent = "등록한 웹사이트가 없습니다.";
  for (const record of records) {
    const row = document.createElement("li");
    row.className = "toggle-item toggle-closed";
    const title = document.createElement("button");
    title.className = "toggle-title";
    title.setAttribute("aria-expanded", "false");
    const indicator = document.createElement("span");
    indicator.textContent = "■ ";
    indicator.style.color = sensitivityColor(record.privacyList);
    title.append(indicator, document.createTextNode(record.url));
    const content = document.createElement("div");
    content.className = "toggle-content";
    content.hidden = true;
    content.textContent =
      record.privacyList.join(", ") || "제공한 개인정보 항목 없음";
    title.addEventListener("click", () => {
      content.hidden = !content.hidden;
      title.setAttribute("aria-expanded", String(!content.hidden));
      row.classList.toggle("toggle-open", !content.hidden);
      row.classList.toggle("toggle-closed", content.hidden);
    });
    row.append(title, content);
    list.append(row);
  }
  container.append(list);
}
