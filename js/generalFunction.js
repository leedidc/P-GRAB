const watchedAllAgree = new WeakSet();

function disableOptionalCheckbox() {
  const checkboxes = [...new Set([...IDNameBasedBlock(), ...TextBasedBlock()])];
  for (const checkbox of checkboxes) {
    checkbox.disabled = true;
    checkbox.checked = false;
  }
  return checkboxes;
}

function allclick(disabledCheckboxes) {
  const optional = new Set(disabledCheckboxes);
  for (const checkbox of findAllAgreeCheckboxes(
    document.querySelectorAll('input[type="checkbox"]'),
  )) {
    if (optional.has(checkbox) || watchedAllAgree.has(checkbox)) continue;
    watchedAllAgree.add(checkbox);
    checkbox.addEventListener("change", () =>
      setTimeout(disableOptionalCheckbox, 0),
    );
  }
}

function findAllAgreeCheckboxes(checkboxes) {
  const ALL_AGREE_STRING_LIST = ["모두", "전체", "모든"];
  const EXCLUDE_STRING_LIST = ["선택", "멤버쉽"];

  let allAgreeCheckboxes = [];

  // 텍스트 기반 필터링 방식
  // EXCLUDE_STRING_LIST에 포함되는 문자가 있는 경우, 해당 checkbox는 제외한다.
  for (let i = 0; i < checkboxes.length; i++) {
    if (
      ALL_AGREE_STRING_LIST.some((str) =>
        (checkboxes[i].parentNode?.innerText || "").includes(str),
      ) &&
      !EXCLUDE_STRING_LIST.some((str) =>
        (checkboxes[i].parentNode?.innerText || "").includes(str),
      )
    ) {
      allAgreeCheckboxes.push(checkboxes[i]);
    }

    if (
      checkboxes[i].nextElementSibling &&
      ALL_AGREE_STRING_LIST.some((str) =>
        (checkboxes[i].nextElementSibling.innerText || "").includes(str),
      ) &&
      !EXCLUDE_STRING_LIST.some((str) =>
        (checkboxes[i].nextElementSibling.innerText || "").includes(str),
      )
    ) {
      allAgreeCheckboxes.push(checkboxes[i]);
    }
  }

  // Id, name 기반 필터링 방식
  // 추가 문자열 있을 경우 ALL_STRING 변수 타입을 리스트로 변환
  const ALL_STRING = "all";
  for (let i = 0; i < checkboxes.length; i++) {
    let checkbox = checkboxes[i];
    if (
      checkbox.id.toLowerCase().includes(ALL_STRING) ||
      checkbox.name.toLowerCase().includes(ALL_STRING)
    ) {
      allAgreeCheckboxes.push(checkbox);
    }
  }

  // allagree 배열의 중복 제거 후 리턴(2가지 방식을 사용하기 때문에 중복 요소 있을 수 있음)
  return Array.from(new Set(allAgreeCheckboxes));
}

function change_color(checkboxes) {
  for (const checkbox of checkboxes) {
    if (checkbox.parentElement) checkbox.parentElement.style.color = "red";
  }
}
