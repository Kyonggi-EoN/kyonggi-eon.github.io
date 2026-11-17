// 좁은 화면에서 상단 메뉴 열고 닫기.
// - 메뉴 단추로 열고 닫습니다.
// - 메뉴 밖을 누르거나, 메뉴 안 링크를 누르거나, Esc를 누르거나, 화면이 넓어져 메뉴가 펼쳐지면 닫힙니다.
// - main.js가 이 파일을 가장 먼저, 다른 기능과 따로 불러옵니다. 바람 같은 다른 기능이 깨져도 메뉴는 움직입니다.
const NARROW = "(max-width: 760px)"; // _sass/_layout.scss에서 메뉴 단추가 보이는 폭과 같게

export function initNav() {
  const btn = document.querySelector(".nav-toggle");
  const nav = document.getElementById(btn?.getAttribute("aria-controls"));
  if (!btn || !nav) return;

  const isOpen = () => btn.getAttribute("aria-expanded") === "true";
  const setOpen = (open) => {
    btn.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };

  btn.addEventListener("click", () => setOpen(!isOpen()));

  // 메뉴 밖을 누르면 닫음. iOS Safari는 글자·빈 곳을 누르면 click을 보내지 않아서 pointerdown을 씁니다.
  document.addEventListener("pointerdown", (e) => {
    if (isOpen() && !nav.contains(e.target) && !btn.contains(e.target)) setOpen(false);
  });

  // 메뉴 안 링크를 누르면 닫음. 뒤로 가기로 돌아왔을 때 메뉴가 열린 채로 남지 않게
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !isOpen()) return;
    setOpen(false);
    btn.focus();
  });

  matchMedia(NARROW).addEventListener("change", () => setOpen(false));
}
