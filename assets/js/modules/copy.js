// 누르면 data-copy 값을 클립보드에 복사하고, 잠깐 "복사됨"을 보여 줍니다. (UI 자료 페이지의 색 칸)
// 글자를 바꿀 곳: 버튼 안의 .swatch__hex. 화면 낭독기에는 [data-copy-status]로 알립니다.
export function initCopy() {
  const status = document.querySelector("[data-copy-status]");

  for (const btn of document.querySelectorAll("[data-copy]")) {
    const label = btn.querySelector(".swatch__hex");
    let timer;

    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        return; // 클립보드를 쓸 수 없는 환경: 색 코드는 화면에 그대로 보이므로 직접 복사
      }
      btn.classList.add("is-copied");
      if (label) label.textContent = "복사됨";
      if (status) status.textContent = `${value} 복사됨`;

      clearTimeout(timer);
      timer = setTimeout(() => {
        btn.classList.remove("is-copied");
        if (label) label.textContent = value;
      }, 1200);
    });
  }
}
