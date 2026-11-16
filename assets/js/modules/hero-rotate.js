// 홈 첫 화면 왼쪽 사진을 일정한 간격으로 바꿔 보여 주고, 직접 넘길 수도 있게 합니다. (_includes/sections/hero.html)
// - 오른쪽 아래 이전·다음 버튼, 터치 화면에서는 좌우로 밀어서 넘깁니다. 직접 넘기면 간격을 처음부터 다시 잽니다.
// - 다음 사진은 미리 받아 두고, 다 받은 뒤에 위로 서서히 겹쳐 바꿉니다.
// - 사진 위에 마우스를 올리거나 키보드로 사진 칸 안의 링크·버튼에 가 있으면 자동 넘기기를 잠시 멈춥니다.
// - 다른 탭을 보고 있으면 멈춥니다.
// - '동작 줄이기'를 켠 사용자에게는 자동 넘기기를 끈 채로 시작합니다. 멈춤 버튼으로 켜고 끕니다.

const FADE_MS = 900; // _sass/components/_hero.scss의 .hero__slide transition과 같게
const SWIPE_PX = 40; // 이만큼 넘게 옆으로 밀어야 넘어감

export function initHeroRotate() {
  const root = document.querySelector("[data-hero-rotate]");
  if (!root) return;

  const slides = [...root.querySelectorAll(".hero__slide")];
  const controls = root.querySelector(".hero__controls");
  const toggle = root.querySelector("[data-hero-toggle]");
  const count = root.querySelector("[data-hero-count]");
  const status = root.querySelector("[data-hero-status]");
  const interval = Number(root.dataset.interval) || 6000;
  const total = slides.length;
  const step = (i, dir) => (i + dir + total) % total;
  const imgOf = (i) => slides[i].querySelector("img");

  let current = 0;
  let timer;
  let busy = false; // 다음 사진을 받는 중
  let paused = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let hovering = false; // 마우스가 사진 위에 있음
  let focused = false; // 키보드 초점이 사진 칸 안에 있음

  // dir 방향(1: 다음, -1: 이전)으로 한 장 넘깁니다. 못 받은 사진은 건너뜁니다.
  async function go(dir) {
    if (busy) return false;
    busy = true;
    let next = step(current, dir);
    while (next !== current) {
      const img = imgOf(next);
      img.loading = "eager";
      try {
        await img.decode();
        break;
      } catch {
        next = step(next, dir);
      }
    }
    busy = false;
    if (next === current) return false;

    const prev = slides[current];
    const slide = slides[next];
    slide.hidden = false;
    slide.getBoundingClientRect(); // 한 번 그린 뒤에 바꿔야 투명도가 서서히 바뀜
    prev.classList.replace("is-active", "is-leaving");
    slide.classList.add("is-active");
    current = next;
    count.textContent = `${current + 1} / ${total}`;

    setTimeout(() => {
      prev.classList.remove("is-leaving");
      if (!prev.classList.contains("is-active")) prev.hidden = true;
    }, FADE_MS);
    return true;
  }

  function schedule() {
    clearTimeout(timer);
    if (paused || hovering || focused || document.hidden) return;
    imgOf(step(current, 1)).loading = "eager"; // 기다리는 동안 다음 사진을 미리 받음
    timer = setTimeout(async () => {
      await go(1);
      schedule();
    }, interval);
  }

  // 사용자가 직접 넘김: 바로 넘기고, 같은 방향의 다음 사진을 미리 받고, 간격은 처음부터 다시
  async function navigate(dir) {
    clearTimeout(timer);
    if (await go(dir)) {
      status.textContent = `사진 ${current + 1}/${total}: ${imgOf(current).alt}`;
      imgOf(step(current, dir)).loading = "eager";
    }
    schedule();
  }

  function setPaused(value) {
    paused = value;
    root.toggleAttribute("data-paused", paused);
    toggle.setAttribute("aria-label", paused ? "자동 넘기기 다시 시작" : "자동 넘기기 멈춤");
    schedule();
  }

  root.querySelector("[data-hero-prev]").addEventListener("click", () => navigate(-1));
  root.querySelector("[data-hero-next]").addEventListener("click", () => navigate(1));
  toggle.addEventListener("click", () => setPaused(!paused));

  // 터치로 좌우 밀기 (왼쪽으로 밀면 다음 사진)
  let start = null;
  root.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" || e.target.closest("a, button")) return;
    start = { x: e.clientX, y: e.clientY };
  });
  root.addEventListener("pointerup", (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    start = null;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) navigate(dx < 0 ? 1 : -1);
  });
  root.addEventListener("pointercancel", () => (start = null));

  root.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "mouse") return;
    hovering = true;
    schedule();
  });
  root.addEventListener("pointerleave", () => {
    hovering = false;
    schedule();
  });
  // 마우스로 버튼을 누를 때 생기는 초점은 무시하고, 키보드로 들어온 초점만 셉니다.
  // 멈춤 버튼에 초점이 있을 때는 버튼 상태대로 움직이도록 세지 않습니다.
  root.addEventListener("focusin", (e) => {
    focused = e.target !== toggle && e.target.matches(":focus-visible");
    schedule();
  });
  root.addEventListener("focusout", () => {
    focused = false;
    schedule();
  });
  document.addEventListener("visibilitychange", schedule);

  controls.hidden = false;
  // 첫 사진을 다 그린 뒤에 시작해서, 다음 사진 받기가 첫 화면을 늦추지 않게 합니다.
  const begin = () => setPaused(paused);
  if (document.readyState === "complete") begin();
  else addEventListener("load", begin, { once: true });
}
