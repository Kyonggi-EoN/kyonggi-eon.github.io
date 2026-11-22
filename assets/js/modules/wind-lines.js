// 바람 테마의 선. 구역을 나누는 진한 1px 선(섹션 제목줄 아래, 멤버 기수 사이, 푸터 위)이 화면에 처음 들어오면
// 그 선을 타고 바람 줄기 한두 개가 왼쪽에서 오른쪽으로(글 읽는 쪽) 작게 빠르게 한 번 지나갑니다.
// - 방향은 모든 선이 같습니다. 선마다 바꾸면 한 페이지에서 선끼리 엇갈려 보입니다
//   (_refs/2026-11-16-kyonggi-eon-github-io-line-wind-ltr).
// - 크기는 선 길이를 따릅니다. 본문 폭(1120px) 선에서 줄기 길이 90~170px, 머리 반지름 2~3px이고,
//   선이 짧은 좁은 화면에서는 줄기도 짧고 가늘어집니다.
// - <body data-wind-lines>일 때만 (_config.yml의 wind.lines). 기기의 '동작 줄이기' 설정과 상관없이 나옵니다(사용자 요청).
// - 줄기 모양·색은 wind.js의 줄기와 같습니다: 둥근 머리에 가늘어지는 꼬리, 한 줄기에 --wind-colors 한 색.
// - 선 길이 밖으로는 보이지 않습니다(_sass/components/_wind.scss의 .wind-lane).
import { windColors } from "./wind.js";

// 선이 있는 요소와 그 선이 있는 쪽
const LINES = [
  [".section__head", "bottom"],
  [".member-group", "top"],
  [".site-footer", "top"],
  [".exhibition__chapter-end", "top"],
];
const FULL = 1120; // 이 길이(px) 이상인 선에서 아래 크기 그대로. 더 짧으면 줄임
const LEN = [0.08, 0.15]; // 줄기 길이(선 길이의 배수)
const LEN_PX = [44, 190]; // 줄기 길이 한도(px)
const HEAD = [1.8, 3]; // 머리 반지름(px). 짧은 선에서는 60%까지 줄어듦
const SPEED = 700; // 빠르기(px/초). 선이 길어도 이 빠르기로, 다만 1~2.6초 안에 지나감
const SECOND = 0.6; // 두 번째 줄기가 따라올 확률

const NS = "http://www.w3.org/2000/svg";
const rand = ([lo, hi]) => lo + Math.random() * (hi - lo);
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

export function initWindLines() {
  if (!document.body.hasAttribute("data-wind-lines")) return;
  const colors = windColors();
  if (!colors.length) return;

  document.addEventListener("exhibition:wind", event => {
    blow(event.target, "bottom", colors, event.detail, 560);
  });

  const side = new Map();
  const seen = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const exhibition = e.target.closest(".exhibition");
        if (exhibition && (exhibition.hasAttribute("data-motion-paused") ||
            matchMedia("(prefers-reduced-motion: reduce)").matches)) continue;
        if (e.target.matches(".exhibition__chapter-end") && e.intersectionRatio < 0.5) continue;
        seen.unobserve(e.target);
        blow(e.target, side.get(e.target), colors);
      }
    },
    { rootMargin: "0px 0px -15% 0px", threshold: [0, 0.5] },
  );
  for (const [selector, s] of LINES) {
    for (const el of document.querySelectorAll(selector)) {
      side.set(el, s);
      seen.observe(el);
    }
  }
}

// 선 하나를 따라 줄기 한두 개를 보냅니다. 다 지나가면 지움
function blow(line, side, colors, direction = 1, duration) {
  const lane = document.createElement("span");
  lane.className = `wind-lane wind-lane--${side}`;
  lane.setAttribute("aria-hidden", "true");
  line.append(lane);
  const width = lane.clientWidth;
  const scale = clamp(width / FULL, 0.6, 1);
  const len = () => clamp(width * rand(LEN), ...LEN_PX);
  const [first, second] = [...colors].sort(() => Math.random() - 0.5);

  const streaks = [{ color: first, len: len(), r: rand(HEAD) * scale, dy: 0, delay: 0, slow: 1 }];
  if (Math.random() < SECOND) {
    // 조금 작고 느린 줄기가 살짝 비켜서 뒤따름
    streaks.push({ color: second, len: len() * 0.7, r: rand(HEAD) * scale * 0.75, dy: rand([-2, 2]), delay: rand([120, 300]), slow: 1.12 });
  }

  let left = streaks.length;
  for (const s of streaks) {
    const svg = streak(s.len, s.r, s.color);
    svg.style.top = `calc(50% - ${s.r - s.dy}px)`;
    lane.append(svg);
    const ms = (duration ?? clamp((width + s.len) / SPEED, 1, 2.6) * 1000) * s.slow;
    const start = direction === 1 ? -s.len : width;
    const end = direction === 1 ? width : -s.len;
    svg
      .animate([
        { transform: `translateX(${start}px) scaleX(${direction})` },
        { transform: `translateX(${end}px) scaleX(${direction})` },
      ], {
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
