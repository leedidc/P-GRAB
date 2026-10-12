function TextBasedBlock() {
  const FILTER_URL_LIST = ["samsung"];
  const domain = window.location.hostname;
  if (FILTER_URL_LIST.some((url) => domain.includes(url))) {
    return textBasedBlockFromParentAndNextSibling();
  } else {
    return textBasedBlockFromAncestor();
  }
}

function textBasedBlockFromParentAndNextSibling() {
  // 웹사이트의 모든 checkbox 요소를 불러옴
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');

  // 필터링할 문자열
  const FILTER_STRING_LIST = [
    "선택",
    "마케팅",
    "광고",
    "홍보",
    "프로모션",
    "SMS",
  ];

  // TextBasedBlock에서 반환하는 disable 배열
  let T_notagree = [];

  for (let i = 0; i < checkboxes.length; i++) {
    const checkbox = checkboxes[i];
    // 1. checkbox의 부모 요소가 포함된 텍스트에 필터링할 문자열이 있는지 확인
    // 읽은 텍스트가 500자가 넘어가면 보통 이용약관 같은 걸 잘못 읽어오는 경우이므로 아예 필터하지 않도록 함
    const targetParentText = checkbox.parentNode?.innerText || "";
    if (
      targetParentText.length < 500 &&
      FILTER_STRING_LIST.some((filterStr) =>
        targetParentText.includes(filterStr),
      )
    ) {
      T_notagree.push(checkbox);
      continue;
    }

    // 2. checkbox의 다음 요소가 존재하고, 그 다음 요소의 텍스트에 필터링할 문자열이 있는지 확인
    if (
      checkbox.nextElementSibling &&
      FILTER_STRING_LIST.some((filterStr) =>
        (checkbox.nextElementSibling.innerText || "").includes(filterStr),
      )
    ) {
      T_notagree.push(checkbox);
      continue;
    }
  }

  return T_notagree;
}

function textBasedBlockFromAncestor() {
  // 웹사이트의 모든 checkbox 요소를 불러옴
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');

  // 필터링할 문자열
  const FILTER_STRING_LIST = [
    "선택",
    "마케팅",
    "광고",
    "홍보",
    "프로모션",
    "SMS",
  ];
  const REQUIRED_AGREE_STRING_LIST = ["필수"];

  // TextBasedBlock에서 반환하는 disable 배열
  let T_notagree = [];

  for (let i = 0; i < checkboxes.length; i++) {
    const checkbox = checkboxes[i];

    // 최대 3대까지의 조상 노드 범위 탐색
    let ancestorNode = checkbox.parentNode;
    let flag = 0;
    while (ancestorNode && ancestorNode.tagName !== "BODY" && flag < 3) {
      const ancestorNodeText = ancestorNode.innerText || "";

      // 필수 동의 항목으로 판단되는 경우 disabledCheckbox로 판단하지 않음 => break
      if (
        REQUIRED_AGREE_STRING_LIST.some((filterStr) =>
          ancestorNodeText.includes(filterStr),
        )
      ) {
        break;
      } else if (
        FILTER_STRING_LIST.some((filterStr) =>
          ancestorNodeText.includes(filterStr),
        )
      ) {
        T_notagree.push(checkbox);
        break;
      }

      ancestorNode = ancestorNode.parentNode;
      flag++;
    }
  }

  return T_notagree;
}
