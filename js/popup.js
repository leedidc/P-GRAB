import { renderRegister } from "./domainRegister.js";
import { renderList } from "./domainList.js";
import { renderSensitivity } from "./domainSensitivity.js";

const pages = {
  navDomainRegister: { file: "domainRegister", render: renderRegister },
  navDomainList: { file: "domainList", render: renderList },
  navDomainSensitivity: {
    file: "domainSensitivity",
    render: renderSensitivity,
  },
};
let navigation = 0;
async function navigate(id) {
  const request = ++navigation;
  const page = pages[id];
  const container = document.getElementById("content");
  try {
    const response = await fetch(`../html/${page.file}.html`);
    if (!response.ok) throw new Error("Page unavailable");
    const markup = await response.text();
    if (request !== navigation) return;
    const parsed = new DOMParser().parseFromString(markup, "text/html");
    const view = document.createElement("section");
    view.append(...parsed.body.childNodes);
    container.replaceChildren(view);
    document
      .querySelectorAll("#navigation-bar button")
      .forEach((button) => button.classList.toggle("active", button.id === id));
    await page.render(view);
  } catch {
    if (request === navigation)
      container.textContent =
        "화면을 불러오지 못했습니다. 팝업을 다시 열어 주세요.";
  }
}
document
  .querySelectorAll("#navigation-bar button")
  .forEach((button) =>
    button.addEventListener("click", () => navigate(button.id)),
  );
navigate("navDomainRegister");
