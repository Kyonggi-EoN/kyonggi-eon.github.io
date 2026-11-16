// 바람 테마의 선. 구역을 나누는 진한 1px 선(섹션 제목줄 아래, 푸터 위)이 화면에 처음 들어오면
// 그 선을 타고 바람 줄기 한두 개가 왼쪽에서 오른쪽으로 한 번 지나갑니다.
// - <body data-wind-lines>일 때만 (_config.yml의 wind.lines). '동작 줄이기'를 켠 사용자에게는 보이지 않습니다.
// - 줄기 모양·색은 wind.js의 줄기와 같습니다: 둥근 머리에 가늘어지는 꼬리, 한 줄기에 --wind-colors 한 색.
// - 선 길이 밖으로는 보이지 않습니다(_sass/components/_wind.scss의 .wind-lane).
import { windColors } from "./wind.js";

// 선이 있는 요소와 그 선이 있는 쪽
const LINES = [
  [".section__head", "bottom"],
  [".site-footer", "top"],
];
const LEN = [90, 170]; // 줄기 길이(px)
const HEAD = [1.8, 3]; // 머리 반지름(px)
const SPEED = 700; // 빠르기(px/초). 선이 길어도 이 빠르기로, 다만 1.2~2.6초 안에 지나감
const SECOND = 0.6; // 두 번째 줄기가 따라올 확률

const NS = "http://www.w3.org/2000/svg";
const rand = ([lo, hi]) => lo + Math.random() * (hi - lo);

export function initWindLines() {
  if (!document.body.hasAttribute("data-wind-lines")) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = windColors();
  if (!colors.length) return;

  const side = new Map();
  const seen = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        seen.unobserve(e.target);
        blow(e.target, side.get(e.target), colors);
      }
    },
    { rootMargin: "0px 0px -15% 0px" }, // 화면 아래쪽 끝이 아니라 조금 올라온 뒤에
  );
  for (const [selector, s] of LINES) {
    for (const el of document.querySelectorAll(selector)) {
      side.set(el, s);
      seen.observe(el);
    }
  }
}

// 선 하나를 따라 줄기 한두 개를 보냅니다. 다 지나가면 지움
function blow(line, side, colors) {
  const lane = document.createElement("span");
  lane.className = `wind-lane wind-lane--${side}`;
  lane.setAttribute("aria-hidden", "true");
  line.append(lane);
  const width = lane.clientWidth;
  const [first, second] = [...colors].sort(() => Math.random() - 0.5);

  const streaks = [{ color: first, len: rand(LEN), r: rand(HEAD), dy: 0, delay: 0, slow: 1 }];
  if (Math.random() < SECOND) {
    // 조금 작고 느린 줄기가 살짝 비켜서 뒤따름
    streaks.push({ color: second, len: rand(LEN) * 0.7, r: rand(HEAD) * 0.75, dy: rand([-2, 2]), delay: rand([120, 300]), slow: 1.12 });
  }

  let left = streaks.length;
  for (const s of streaks) {
    const svg = streak(s.len, s.r, s.color);
    svg.style.top = `calc(50% - ${s.r - s.dy}px)`;
    lane.append(svg);
    const ms = Math.min(Math.max((width + s.len) / SPEED, 1.2), 2.6) * 1000 * s.slow;
    svg
      .animate([{ transform: `translateX(${-s.len}px)` }, { transform: `translateX(${width}px)` }], {
        duration: ms,
        delay: s.delay,
        easing: "cubic-bezier(0.35, 0, 0.25, 1)", // 빠르게 들어와 끝에서 조금 늦춰짐
        fill: "both",
      })
      .finished.then(() => --left || lane.remove());
  }
}

// 길이 len, 머리 반지름 r인 줄기 하나. 오른쪽 끝이 둥근 머리, 왼쪽 끝이 뾰족한 꼬리
function streak(len, r, color) {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("width", len);
  svg.setAttribute("height", 2 * r);
  svg.setAttribute("viewBox", `0 0 ${len} ${2 * r}`);
  const path = document.createElementNS(NS, "path");
  const hx = len - r; // 머리 가운데
  path.setAttribute(
    "d",
    `M0 ${r} Q${len * 0.6} ${r * 0.2} ${hx} 0 A${r} ${r} 0 0 1 ${hx} ${2 * r} Q${len * 0.6} ${r * 1.8} 0 ${r}Z`,
  );
  path.setAttribute("fill", color);
  svg.append(path);
  return svg;
}
