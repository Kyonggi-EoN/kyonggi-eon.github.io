// 밝은/어두운 화면 전환 버튼. 첫 테마 결정은 _includes/head.html의 인라인 스크립트가 합니다.
export function initTheme() {
  const root = document.documentElement;
  for (const btn of document.querySelectorAll("[data-theme-toggle]")) {
    btn.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch {
        // 저장이 막힌 브라우저(사생활 보호 모드 등)에서는 이번 방문에만 적용
      }
    });
  }
}
