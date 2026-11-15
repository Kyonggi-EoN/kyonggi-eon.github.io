// 좁은 화면에서 상단 메뉴 열고 닫기.
export function initNav() {
  const btn = document.querySelector(".nav-toggle");
  const nav = document.getElementById(btn?.getAttribute("aria-controls"));
  if (!btn || !nav) return;

  const setOpen = (open) => {
    btn.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };

  btn.addEventListener("click", () => setOpen(btn.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}
