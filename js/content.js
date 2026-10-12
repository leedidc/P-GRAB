(() => {
  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      pgrabProcess();
    });
  }
  function start() {
    pgrabProcess();
    new MutationObserver(schedule).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();

function pgrabProcess() {
  const optional = disableOptionalCheckbox();
  allclick(optional);
  change_color(optional);
}
