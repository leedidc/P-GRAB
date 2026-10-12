function IDNameBasedBlock() {
  return [...document.querySelectorAll('input[type="checkbox"]')].filter(
    (checkbox) => {
      const label = [...(checkbox.labels || [])]
        .map((node) => node.innerText || node.textContent || "")
        .join(" ");
      if (label.includes("필수")) return false;
      const tokens = `${checkbox.id} ${checkbox.name}`
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .toLowerCase()
        .split(/[^a-z]+/);
      return tokens.some((token) =>
        [
          "marketing",
          "market",
          "ad",
          "advertisement",
          "opt",
          "optional",
          "event",
        ].includes(token),
      );
    },
  );
}
