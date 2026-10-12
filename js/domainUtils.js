export function normalizeDomain(value) {
  const input = String(value ?? "").trim();
  if (!input || /\s/.test(input))
    throw new Error("올바른 웹사이트 주소를 입력해 주세요.");
  const url = new URL(input.includes("://") ? input : `https://${input}`);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    !url.hostname ||
    url.username ||
    url.password
  ) {
    throw new Error("http 또는 https 웹사이트 주소를 입력해 주세요.");
  }
  return url.hostname.toLowerCase().replace(/\.$/, "");
}

export function storageKey(domain) {
  return `domain:${normalizeDomain(domain)}`;
}

export function normalizePrivacyList(items) {
  return [
    ...new Set(
      (Array.isArray(items) ? items : [])
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

export function domainRecords(storage) {
  const records = new Map();
  for (const [key, value] of Object.entries(storage)) {
    if (
      !value ||
      typeof value.url !== "string" ||
      !Array.isArray(value.privacyList) ||
      !Number.isFinite(value.lastAccessTime)
    )
      continue;
    try {
      const domain = normalizeDomain(value.url);
      if (key !== storageKey(domain) && key !== domain.replaceAll(".", "-"))
        continue;
      const existing = records.get(domain);
      records.set(domain, {
        url: domain,
        lastAccessTime: Math.max(
          existing?.lastAccessTime ?? 0,
          value.lastAccessTime,
        ),
        privacyList: normalizePrivacyList([
          ...(existing?.privacyList ?? []),
          ...value.privacyList,
        ]),
      });
    } catch {
      /* Ignore unrelated or invalid storage entries. */
    }
  }
  return [...records.values()].sort(
    (a, b) => b.lastAccessTime - a.lastAccessTime,
  );
}

export function elapsedTime(timestamp, now = Date.now()) {
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (seconds < 60) return `${seconds}초 전`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  return `${Math.floor(seconds / 86400)}일 전`;
}

export function sensitivityColor(items) {
  const high = new Set([
    "여권 번호",
    "운전면허 번호",
    "신용카드 번호",
    "카드 비밀번호",
    "계좌 번호",
    "위치 정보",
    "IP 정보",
  ]);
  const medium = new Set([
    "이름",
    "주소",
    "휴대폰 번호",
    "이메일",
    "성별",
    "병역",
  ]);
  const values = normalizePrivacyList(items);
  if (values.some((value) => high.has(value))) return "red";
  if (values.some((value) => medium.has(value))) return "orange";
  return values.length ? "green" : "gray";
}
