// 바람 테마의 줄기 떼. canvas[data-wind]마다 글자 둘레 빈 곳으로 바람 줄기 떼가 지나갑니다.
//   data-wind: 그림판이 놓인 곳(아래 PRESETS). 곳마다 바람 방향과 줄기 크기가 다릅니다.
//     hero: 홈 첫 화면 오른쪽 칸 (_includes/sections/hero.html, content/pages/index.md의 hero.wind)
//     page: 페이지 제목 칸과 글 상세 페이지 머리의 오른쪽 (_includes/page-wind.html, _config.yml의 wind.pages)
//   data-wind-mode: 마우스를 prey(먹잇감)로 볼지 obstacle(장애물)로 볼지
// 바람 테마 전체 규칙은 _sass/_tokens.scss의 --wind-colors 설명을, 선을 따라 지나가는 줄기는 wind-lines.js를 보세요.
//
// - 줄기 하나 = 날아가는 원 하나 + 지나온 자리에 남는 잔상. 잔상은 오래될수록 작아져서
//   둥근 머리에 꼬리가 가늘어지는 모양이 됩니다. 길이와 휨은 그때그때 움직임에서 저절로 나옵니다.
// - 줄기마다 --wind-colors 한 색을 그대로 칠하고, 여러 색이 섞여 날아갑니다.
// - 바람 방향은 놓인 곳의 UI를 따릅니다(PRESETS의 flow). 왼쪽에서 오른쪽으로만 불지 않습니다.
//   · hero: 아래 링크의 위 선에서 떠올라, 링크 화살표(↗)처럼 오른쪽 위로 휘어 올라갑니다.
//   · page: 화면 오른쪽 끝에서 들어와 제목·설명 쪽으로 모여듭니다.
// - 좁은 화면 홈에서는 글자 옆에 빈 곳이 없으므로 이름·구호 칸을 떠 있는 글씨로 봅니다.
//   줄기가 비켜 가지 않고 그 뒤로 지나갑니다. 링크는 그대로 비켜 갑니다. 페이지 제목은 떠 있지 않습니다.
// - 줄기 굵기는 둘레의 빈 곳을 따릅니다. 글자(PRESETS의 keep 상자)에서 멀어 넓은 곳에서는 제 굵기로,
//   글자에 다가가면 가늘어집니다. 글자 뒤로는 지나가지 않습니다: hero는 비켜 돌아가고(push),
//   page는 제목에 닿기 전에 가늘어져 사라집니다(sink).
// - 움직임은 보이드(boids, Craig Reynolds 1986) 규칙입니다. 참고: https://github.com/sergioabreu-g/boids
//   · 가까운 줄기끼리 너무 붙으면 떨어지고(separation), 같은 쪽으로 날고(alignment), 무리 가운데로 모입니다(cohesion).
//   · 여기에 곳마다 정한 약한 바람을 더해, 무리가 대체로 그 방향으로 흘러갑니다.
//   · 그림판 밖으로 나가면(page는 제목에 닿으면) 바람이 시작되는 곳(PRESETS의 from)에서 다시 생겨납니다.
//   · 방향을 바꾸는 힘에 한도(TURN)가 있어 크게 돌아 나가고, 제자리에서 휘감기지 않습니다.
// - 마우스
//   · prey(먹잇감): 마우스를 늦게, 출렁이며 따라가는 점을 쫓아 몰려듭니다
//     (_refs/2026-11-16-antigravity-google-wobbly-motion). 닿으면 그대로 지나쳐 잠깐 흩어졌다가 다시 쫓아옵니다.
//     마우스가 멈춰 있으면 느슨하게 둘레를 지나다니고, 움직이면 힘껏 따라붙습니다.
//   · obstacle(장애물): 마우스 둘레를 비켜 흘러가고, 마우스를 빠르게 휘저으면 그 방향으로 밀립니다.
// - 돌풍: 같은 구역(section·header)에 'wind:gust' 이벤트가 오면 잠깐 바람이 세져서 무리가 빨라지고 꼬리가 길어집니다.
//   홈 사진이 바뀔 때 hero-rotate.js가 보냅니다. 화면을 스크롤해도 넘기는 빠르기만큼 돌풍이 붑니다(SCROLL).
// - 화면 밖으로 스크롤하거나 다른 탭을 보면 멈춥니다. 기기의 '동작 줄이기' 설정과 상관없이 움직입니다(사용자 요청).

// 길이는 모두 길이 단위 u에 대한 비율입니다. u는 곳마다 다름(PRESETS): 홈은 칸 너비와 높이 중 짧은 쪽
// (1440px 화면이면 760px, 0.1u ≈ 76px), 페이지는 제목 오른쪽 빈 곳의 너비(제목 칸 높이의 3배까지).
// 그래서 화면이 넓어져도 줄기가 마냥 굵어지지 않습니다.
const TRAIL = 0.9; // 잔상이 남아 있는 시간(초). 길수록 꼬리가 김
const TAPER = 0.8; // 잔상이 작아지는 모양. 1이면 고르게, 작을수록 머리 쪽이 통통함
const ALPHA = 0.7; // 줄기가 겹치면 아래 색이 살짝 비침 (wind-lines.js와 같게)

// 빠르기
const SPEED = [0.13, 0.27]; // 최소·최대 빠르기(u/초)
const TURN = 0.9; // 방향을 바꾸는 힘의 한도(u/초²). 작을수록 크게 돌아 나감

// 보이드 규칙
const SIGHT = 0.12; // 이웃으로 보는 거리(u). 작을수록 두세 개씩 작은 무리로 흩어짐
const SPACE = 0.07; // 이보다 가까우면 서로 떨어짐(u)
const COHESION = 0.45; // 이웃 가운데로 모이는 힘
const ALIGNMENT = 1.2; // 이웃과 같은 방향·빠르기로 맞추는 힘
const SEPARATION = 1.2; // 서로 떨어지는 힘
const WANDER = 0.22; // 저마다 좌우로 조금씩 흔들리는 힘(u/초²)

// 바람
const WIND = 0.5; // 바람 빠르기(u/초)
const WIND_PULL = 0.7; // 바람 빠르기에 맞춰 가는 정도
const SWAY = 0.3; // 바람 방향이 천천히 흔들리는 폭(rad)
const EDGE = 25; // 글자 상자나 띠 밖으로 들어서면 되미는 힘
const GUST = {
  wind: 1.2, // 돌풍이 한창일 때 바람 빠르기가 이만큼 더해짐(WIND의 배수)
  speed: 0.8, // 그때 최대 빠르기도 이만큼 더해짐(SPEED[1]의 배수)
  decay: 1.2, // 잦아드는 빠르기(1/초). 1.2면 1초 뒤 30%, 2초 뒤 9%
};
// 스크롤 돌풍: 화면을 넘기는 빠르기만큼 돌풍이 붑니다. 멈추면 GUST.decay대로 잦아듦
const SCROLL = {
  full: 2000, // 이 빠르기(px/초)로 넘기면 사진이 바뀔 때 부는 돌풍(1)만큼
  max: 1.2, // 아무리 빨리 넘겨도 이 세기까지
};

// 마우스
const LURE = { lag: 7, wobble: 0.45 }; // 먹잇감 점이 마우스를 따라가는 힘(작을수록 늦게)과 출렁임(1보다 작으면 지나쳤다 돌아옴)
const PREY = {
  range: 0.45, // 이 거리 안의 줄기가 쫓아옴(u)
  pull: 2.4, // 쫓는 힘
  reach: 0.04, // 이만큼 가까워지면 닿은 것으로 봄(u)
  rest: [1.0, 2.0], // 닿은 뒤 쫓지 않고 지나쳐 가는 시간(초)
  idle: 0.35, // 마우스가 멈춰 있을 때 쫓는 세기(움직일 때를 1로). 작을수록 멈춘 마우스 둘레에 덜 엉김
};
const OBSTACLE = {
  radius: 0.13, // 이 거리 안으로는 들어오지 않음(u)
  push: 1.8, // 비켜 가는 힘(u/초²)
  gust: 2.5, // 마우스를 휘저을 때 밀리는 세기
};

// 놓이는 곳마다 다른 값.
//   count: 줄기 수. 색은 --wind-colors를 차례로 돌려 씀
//   size: 넓은 빈 곳에서의 머리 반지름 범위(u)
//   room: 글자 상자에서 이만큼(u) 떨어져야 제 굵기. 더 가까우면 그만큼 가늘어짐
//   pad: 글자 상자에서 이보다 가까우면 되밈(u). sink면 되밀지 않고 닿으면 사라짐
//   layout(canvas, w, h): 그림판 크기(px)를 받아 지금 배치를 돌려줍니다. 빈 곳이 좁으면 null(그리지 않음)
//     u: 길이 단위(px)
//     keep: 글자 상자 목록 { l, t, r, b } (그림판 기준 px). 줄기가 들어가지 않는 곳. 마우스도 여기서는 없는 것으로 봄
//     from: 줄기가 생겨나는 선분 목록 [x0, y0, x1, y1]. 길이에 비례해 고름
//     flow(x, y): 그 자리의 바람 방향(rad). 0이면 →, π/2면 ↓, -π/2면 ↑ (그림판은 y가 아래로 커짐)
//     band: [위, 아래] (px, 없어도 됨). 이 띠 밖으로 나가면 되밈
//     count, room: (없어도 됨) 이 배치에서만 줄기 수를 줄이거나 room을 바꿈
const PRESETS = {
  // 홈 첫 화면 오른쪽 칸. 아래 링크의 위 선(과 사진 쪽 왼쪽 끝 아래)에서 생겨나 오른쪽 위로 휘어 올라갑니다.
  // 링크 화살표(↗)와 같은 쪽입니다. 왼쪽에서는 눕게(→) 불어 제목·구호 아래를 지나고,
  // 오른쪽으로 갈수록 서게(↑) 불어 제목 오른쪽 빈 곳으로 올라가 위·오른쪽 끝으로 나갑니다.
  // 링크 선 가까이에서 막 생겨난 줄기는 가늘고, 넓은 위쪽으로 올라갈수록 굵어집니다.
  // 좁은 화면(사진 아래로 글자 칸이 내려옴)에서는 글자 옆 빈 곳이 좁으므로, 이름·구호를 떠 있는 글씨로 봐서
  // 비켜 가지 않고 그 뒤로 지나갑니다. _hero.scss가 좁은 화면에서 그림판에 --wind-text: float를 줍니다.
  hero: {
    count: 17,
    size: [0.005, 0.026], // u가 760px이면 4~20px
    room: 0.14,
    pad: 0.04,
    layout(canvas, w, h) {
      const area = canvas.parentElement;
      const text = textBox(area.querySelector(":scope > div"), canvas);
      const link = box(area.querySelector(".hero__link"), canvas);
      const floor = link ? link.t : h;
      const float = floats(canvas);
      const keep = [];
      if (text && !float) keep.push({ ...text, l: -w, t: -h }); // 글자 왼쪽(사진 옆 여백)·위쪽 여백까지
      if (link) keep.push({ ...link, l: -w, r: 2 * w, b: 2 * h }); // 링크 선 아래 전부
      // 왼쪽 끝에서 생겨나는 높이: 링크 위 빈 띠의 아래쪽. 떠 있는 글씨면 이름 아래부터
      const left = float && text ? (text.t + text.b) / 2 : floor - 0.45 * (floor - (text ? text.b : 0));
      return {
        u: Math.min(w, h),
        keep,
        from: [
          [0.02 * w, floor - 6, 0.7 * w, floor - 6], // 링크 위 선 바로 위
          [-8, left, -8, floor - 6], // 사진 쪽 왼쪽 끝 아래쪽
        ],
        flow: (x) => -(0.3 + 0.95 * smooth(x / w)), // 왼쪽 끝 -17°(→), 오른쪽 끝 -71°(↑)
      };
    },
  },
  // 페이지 제목 칸. 화면 오른쪽 끝에서 들어와 왼쪽(←)으로 불며 제목·설명 오른쪽 끝 가운데로 조금씩 모여듭니다.
  // 넓은 오른쪽에서는 제 굵기로 오다가, 제목에 다가가며 가늘어져 닿기 전에 사라집니다.
  // 좁은 화면(설명이 화면 폭을 다 채워 오른쪽 빈 곳이 288px보다 좁을 때)에서는 제목 마지막 줄 오른쪽 빈 곳만 써서
  // 그 줄 끝으로 모여듭니다. 글자 뒤로는 지나가지 않습니다(떠 있는 글씨는 홈만). 빈 곳이 120px보다 좁으면 그리지 않습니다.
  // 페이지 제목 칸(_layouts/page.html)과 글 상세 페이지 머리(_layouts/post.html, project.html)가 함께 씁니다.
  page: {
    count: 9,
    size: [0.003, 0.01], // 제목 칸은 낮으므로(약 240px) 홈보다 가늘게. 빈 곳 700px이면 2~7px
    room: 0.3,
    pad: 0,
    sink: true,
    layout(canvas, w, h) {
      const head = canvas.parentElement.querySelector(".container");
      const text = textBox(head, canvas);
      if (!text) return null;
      if (w - text.r >= 288) {
        const top = Math.max(0.12 * h, text.t - 0.1 * h);
        const bottom = Math.min(0.9 * h, text.b + 0.1 * h);
        return {
          ...sinkInto(w, h, text.r, (text.t + text.b) / 2, [top, bottom]),
          u: Math.min(w - text.r, 3 * h),
        };
      }
      const title = lastLine(head.querySelector("h1"), canvas);
      if (!title || w - title.r < 120) return null;
      const next = textBox(head.querySelector("h1 ~ *"), canvas); // 설명·날짜·버튼 줄
      const lh = title.b - title.t;
      const whole = textBox(head.querySelector("h1"), canvas);
      // 한 줄 제목은 제목 위로 제목 높이의 반만큼, 여러 줄이면 윗줄에 걸치지 않게 마지막 줄 위 끝부터
      const top = whole.t < title.t - 2 ? title.t : Math.max(0.1 * h, title.t - 0.5 * lh);
      const bottom = next ? (title.b + next.t) / 2 : Math.min(0.9 * h, title.b + 0.1 * h);
      const L = sinkInto(w, h, title.r, (title.t + title.b) / 2, [top, bottom]);
      L.keep.push({ l: -w, t: -h, r: 2 * w, b: top }); // 제목 윗줄·'← 소식' 줄에 걸치지 않게
      if (next) L.keep.push({ l: -w, t: next.t, r: 2 * w, b: 2 * h }); // 설명 줄 위로 넘어가지 않게
      return {
        ...L,
        u: Math.min(Math.max(w - title.r, 360), 3 * h), // 빈 곳이 좁아도 360px로 봄: 390px 화면이면 머리 반지름 1~4px
        room: 0.12, // 띠가 낮으므로(약 70px) 설명 줄 가까이만 가늘어지게
        count: 5,
      };
    },
  },
};

// page의 배치: 오른쪽 끝(띠 band 안)에서 들어와 글자 오른쪽 끝 r의 가운데 높이 cy 쪽으로 모여들고,
// r보다 왼쪽은 모두 글자 상자로 봐서 제목 위아래로 새어 나가지 않게 합니다.
function sinkInto(w, h, r, cy, band) {
  return {
    keep: [{ l: -w, t: -h, r, b: 2 * h }],
    from: [[w + 8, band[0], w + 8, band[1]]],
    flow(x, y) {
      // 왼쪽(←) 60%에 제목 오른쪽 끝 가운데 쪽 40%를 섞음. 멀리서는 거의 가로로, 가까이 오면 모여듦
      const dx = r - x;
      const dy = cy - y;
      const d = Math.hypot(dx, dy) || 1;
      return Math.atan2((0.4 * dy) / d, -0.6 + (0.4 * dx) / d);
    },
    band,
  };
}

const TICK = 1 / 60; // 움직임을 계산하는 간격(초). 잔상도 이 간격마다 하나씩 남김
const N = Math.round(TRAIL / TICK); // 줄기 하나에 남는 잔상 수
const GROW = 0.6; // 새로 생겨난 머리가 0에서 제 크기까지 커지는 시간(초)
const rand = ([lo, hi]) => lo + Math.random() * (hi - lo);
const ease = (rate, dt) => 1 - Math.exp(-rate * dt);
const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

// 바람 색 목록 (_sass/_tokens.scss의 --wind-colors)
export const windColors = (el = document.documentElement) =>
  getComputedStyle(el)
    .getPropertyValue("--wind-colors")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

// 글자를 떠 있는 글씨로 볼지(비켜 가지 않고 뒤로 지나감). CSS에서 그림판에 --wind-text: float를 줌
const floats = (canvas) => getComputedStyle(canvas).getPropertyValue("--wind-text").trim() === "float";

// el 글자의 마지막 줄 상자(canvas 기준 px). 여러 줄로 꺾인 제목은 마지막 줄 오른쪽만 비어 있음
function lastLine(el, canvas) {
  if (!el) return null;
  const range = document.createRange();
  range.selectNodeContents(el);
  const rects = [...range.getClientRects()].filter((r) => r.width && r.height);
  if (!rects.length) return null;
  const c = canvas.getBoundingClientRect();
  const bottom = Math.max(...rects.map((r) => r.bottom));
  const line = rects.filter((r) => r.bottom > bottom - 2); // 마지막 줄에 놓인 조각들
  return {
    l: Math.min(...line.map((r) => r.left)) - c.left,
    t: Math.min(...line.map((r) => r.top)) - c.top,
    r: Math.max(...line.map((r) => r.right)) - c.left,
    b: bottom - c.top,
  };
}

// el의 상자(canvas 기준 px)
function box(el, canvas) {
  if (!el) return null;
  const c = canvas.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { l: r.left - c.left, t: r.top - c.top, r: r.right - c.left, b: r.bottom - c.top };
}

// el 안 글자들이 실제로 차지하는 상자(canvas 기준 px). 제목 같은 블록 요소는 칸 너비만큼 넓으므로
// 글자 자체를 잽니다. 버튼은 버튼 상자 전체
function textBox(el, canvas) {
  if (!el) return null;
  const c = canvas.getBoundingClientRect();
  let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
  const add = (rect) => {
    if (!rect.width || !rect.height) return;
    l = Math.min(l, rect.left);
    t = Math.min(t, rect.top);
    r = Math.max(r, rect.right);
    b = Math.max(b, rect.bottom);
  };
  const range = document.createRange();
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) {
    if (!walk.currentNode.data.trim()) continue;
    range.selectNodeContents(walk.currentNode);
    add(range.getBoundingClientRect());
  }
  el.querySelectorAll(".btn").forEach((btn) => add(btn.getBoundingClientRect()));
  if (l === Infinity) return null;
  return { l: l - c.left, t: t - c.top, r: r - c.left, b: b - c.top };
}

// 점 (x, y)에서 상자 k까지의 거리(px, 상자 안이면 0)와 상자 밖으로 나가는 방향(nx, ny).
// 상자 안이면 depth에 가장 가까운 변까지의 거리
function away(k, x, y) {
  const dx = x < k.l ? x - k.l : x > k.r ? x - k.r : 0;
  const dy = y < k.t ? y - k.t : y > k.b ? y - k.b : 0;
  if (dx || dy) {
    const d = Math.hypot(dx, dy);
    return { d, depth: 0, nx: dx / d, ny: dy / d };
  }
  const l = x - k.l, r = k.r - x, t = y - k.t, b = k.b - y;
  const m = Math.min(l, r, t, b);
  return { d: 0, depth: m, nx: m === l ? -1 : m === r ? 1 : 0, ny: m === l || m === r ? 0 : m === t ? -1 : 1 };
}

export function initWind() {
  document.querySelectorAll("canvas[data-wind]").forEach(start);
}

function start(canvas) {
  const preset = PRESETS[canvas.dataset.wind] ?? PRESETS.hero;
  const ctx = canvas.getContext("2d");
  const area = canvas.parentElement;
  const scope = canvas.closest("section, header") ?? area;
  const mode = canvas.dataset.windMode === "obstacle" ? "obstacle" : "prey";
  const colors = windColors(canvas);
  if (!colors.length) return;

  let w = 0; // 그림판 너비·높이(px). 0이면 그리지 않음
  let h = 0;
  let u = 0; // 길이 단위(px)
  let L = null; // 지금 배치 (PRESETS의 layout)
  let prev = null; // 마지막으로 그린 크기 { w, h, u }. 크기가 바뀌면 자리를 늘이고 줄이는 데 씀
  let dpr = 1;
  let raf = 0;
  let last = 0;
  let acc = 0; // 아직 계산하지 않은 시간(초)
  let tick = 0;
  let time = 0;
  let gust = 0; // 돌풍 세기. 1에서 시작해 잦아듦
  let onScreen = true;
  let ready = false;

  const pointer = { x: 0, y: 0, vx: 0, vy: 0, t: 0, active: false };
  // 마우스 점. prey면 마우스를 늦게 따라가는 먹잇감, obstacle이면 마우스 자리 그대로. on: 0~1로 서서히 켜지고 꺼짐
  const lure = { x: 0, y: 0, vx: 0, vy: 0, on: 0 };
  const boids = Array.from({ length: preset.count }, (_, i) => ({
    color: colors[i % colors.length],
    r: rand(preset.size),
    phase: Math.random() * Math.PI * 2,
    born: 0, // 머리가 커지기 시작한 때(초)
    x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0,
    rest: 0, // 먹잇감에 닿은 뒤 쫓지 않는 남은 시간(초)
    // 잔상: 고리 버퍼. 위치, 반지름, 남긴 때(tick)
    xs: new Float32Array(N),
    ys: new Float32Array(N),
    rs: new Float32Array(N),
    ts: new Float64Array(N),
    head: 0,
    count: 0,
  }));
  let flock = boids; // 지금 배치에서 날리는 줄기 (배치의 count만큼 앞에서부터)

  // 글자 상자까지 가장 가까운 거리(px)
  function room(x, y) {
    let d = Infinity;
    for (const k of L.keep) d = Math.min(d, away(k, x, y).d);
    return d;
  }

  // 줄기 b를 바람이 시작되는 곳(from) 아무 데나 놓고 그 자리 바람 방향으로 날려 보냅니다. 머리는 0에서 커지고 잔상은 지움
  function enter(b) {
    const total = L.from.reduce((s, [x0, y0, x1, y1]) => s + Math.hypot(x1 - x0, y1 - y0), 0);
    let pick = Math.random() * total;
    let seg = L.from[0];
    for (const s of L.from) {
      seg = s;
      pick -= Math.hypot(s[2] - s[0], s[3] - s[1]);
      if (pick <= 0) break;
    }
    const k = Math.random();
    b.x = seg[0] + (seg[2] - seg[0]) * k;
    b.y = seg[1] + (seg[3] - seg[1]) * k;
    aim(b, rand([-0.25, 0.25]));
    b.born = time;
    b.count = 0;
  }

  // b를 그 자리 바람 방향에서 da(rad)만큼 비틀어, 아무 빠르기로 날림
  function aim(b, da) {
    const a = L.flow(b.x, b.y) + da;
    const v = rand(SPEED) * u;
    b.vx = Math.cos(a) * v;
    b.vy = Math.sin(a) * v;
  }

  // 처음에는 바람길 여기저기에 흩어 놓음: 생겨나는 곳에서 바람을 따라 아무 거리나 미리 보내 둠. 머리는 제자리에서 커짐
  function place() {
    for (const b of flock) {
      for (let tries = 0; tries < 8; tries++) {
        enter(b);
        const go = rand([0, 0.9]) * u;
        for (let s = 0; s < go; s += 0.02 * u) {
          const a = L.flow(b.x, b.y);
          b.x += Math.cos(a) * 0.02 * u;
          b.y += Math.sin(a) * 0.02 * u;
        }
        if (b.x > 0 && b.x < w && b.y > 0 && b.y < h && room(b.x, b.y) > preset.pad * u) break;
      }
      aim(b, rand([-0.25, 0.25]));
      b.born = Math.random() * 0.6;
    }
  }

  function moveLure() {
    lure.on += ((pointer.active ? 1 : 0) - lure.on) * ease(pointer.active ? 4 : 2, TICK);
    if (mode === "obstacle") {
      lure.x = pointer.x;
      lure.y = pointer.y;
      return;
    }
    if (pointer.active) {
      const c = 2 * LURE.wobble * Math.sqrt(LURE.lag);
      lure.vx += (LURE.lag * (pointer.x - lure.x) - c * lure.vx) * TICK;
      lure.vy += (LURE.lag * (pointer.y - lure.y) - c * lure.vy) * TICK;
    } else {
      lure.vx *= 1 - ease(4, TICK);
      lure.vy *= 1 - ease(4, TICK);
    }
    lure.x += lure.vx * TICK;
    lure.y += lure.vy * TICK;
  }

  // 줄기 하나가 이번에 받는 힘(가속도)을 b.ax, b.ay에 적습니다. sway: 지금 바람 방향이 흔들린 정도(rad)
  function steer(b, sway) {
    const sight = SIGHT * u;
    const space = SPACE * u;
    const vmax = SPEED[1] * u;

    // 보이드: 이웃 찾기
    let n = 0;
    let cx = 0, cy = 0, avx = 0, avy = 0, sx = 0, sy = 0;
    for (const o of flock) {
      if (o === b) continue;
      const dx = o.x - b.x;
      const dy = o.y - b.y;
      const d = Math.hypot(dx, dy);
      if (!d || d > sight) continue;
      n++;
      cx += o.x;
      cy += o.y;
      avx += o.vx;
      avy += o.vy;
      if (d < space) {
        const f = (1 - d / space) / d;
        sx -= dx * f;
        sy -= dy * f;
      }
    }

    // 먹잇감을 쫓는 세기(0~PREY.pull). 가까울수록 세고, 닿은 뒤 잠깐은 0
    let chase = 0;
    let px = 0, py = 0;
    if (mode === "prey" && lure.on > 0.01 && b.rest <= 0) {
      px = lure.x - b.x;
      py = lure.y - b.y;
      const d = Math.max(Math.hypot(px, py), 1);
      px /= d;
      py /= d;
      // 마우스가 움직이면 힘껏 쫓고, 멈춰 있으면 느슨하게 둘레를 지나다님
      const moving = PREY.idle + (1 - PREY.idle) * smooth(Math.hypot(lure.vx, lure.vy) / (0.3 * u));
      if (d < PREY.reach * u) b.rest = rand(PREY.rest);
      else if (d < PREY.range * u) chase = Math.sqrt(1 - d / (PREY.range * u)) * lure.on * PREY.pull * moving;
    }

    // 그 자리 바람(쫓는 동안은 약해지고, 돌풍 때는 세짐) + 보이드 세 규칙 + 좌우 흔들림
    const wa = L.flow(b.x, b.y) + sway;
    const ws = WIND * u * (1 + GUST.wind * gust);
    const wind = WIND_PULL * (1 + gust) * (1 - 0.8 * Math.min(chase, 1));
    let ax = (Math.cos(wa) * ws - b.vx) * wind + sx * SEPARATION * u;
    let ay = (Math.sin(wa) * ws - b.vy) * wind + sy * SEPARATION * u;
    if (n) {
      ax += (cx / n - b.x) * COHESION + (avx / n - b.vx) * ALIGNMENT;
      ay += (cy / n - b.y) * COHESION + (avy / n - b.vy) * ALIGNMENT;
    }
    const speed = Math.hypot(b.vx, b.vy) || 1;
    const wander = Math.sin(time * 1.7 + b.phase) * WANDER * u;
    ax -= (b.vy / speed) * wander;
    ay += (b.vx / speed) * wander;

    // 먹잇감: 그쪽으로 최대 빠르기로 날아가려 함. 닿으면 잠깐 쫓지 않고 지나쳐 감
    if (chase) {
      ax += (px * vmax - b.vx) * chase;
      ay += (py * vmax - b.vy) * chase;
    }

    // 방향을 바꾸는 힘의 한도(돌풍 때는 넉넉하게). 아래 장애물·글자 상자·띠는 한도 밖에서 따로 더해 꼭 지키게 함
    const a = Math.hypot(ax, ay);
    const max = TURN * u * (1 + gust);
    if (a > max) {
      ax *= max / a;
      ay *= max / a;
    }

    // 장애물: 마우스 둘레를 비켜 가고, 마우스를 휘저으면 그 방향으로 밀림
    if (mode === "obstacle" && lure.on > 0.01) {
      const dx = b.x - lure.x;
      const dy = b.y - lure.y;
      const d = Math.max(Math.hypot(dx, dy), 1);
      const radius = OBSTACLE.radius * u;
      if (d < radius) {
        const f = smooth(1 - d / radius) * OBSTACLE.push * u * lure.on;
        ax += (dx / d) * f;
        ay += (dy / d) * f;
      }
      const g = Math.exp(-(d * d) / (4 * radius * radius)) * OBSTACLE.gust;
      ax += pointer.vx * g;
      ay += pointer.vy * g;
    }

    // 글자 상자 둘레(pad)로 들어서면 바깥으로 되밀고, 들어가는 쪽 속도를 줄임 (sink면 되밀지 않음)
    if (!preset.sink) {
      for (const k of L.keep) {
        const { d, depth, nx, ny } = away(k, b.x, b.y);
        const p = preset.pad * u - d + depth;
        if (p <= 0) continue;
        const vn = Math.min(b.vx * nx + b.vy * ny, 0);
        ax += nx * (p * EDGE - vn * 3);
        ay += ny * (p * EDGE - vn * 3);
      }
    }

    // 띠 밖으로 나가면 되밀고, 나가는 쪽 속도를 줄임
    if (L.band) {
      const [top, bottom] = L.band;
      if (b.y < top) ay += (top - b.y) * EDGE - Math.min(b.vy, 0) * 3;
      if (b.y > bottom) ay -= (b.y - bottom) * EDGE + Math.max(b.vy, 0) * 3;
    }

    b.ax = ax;
    b.ay = ay;
  }

  function step() {
    tick++;
    time += TICK;
    const decay = Math.exp(-TICK * 8);
    pointer.vx *= decay;
    pointer.vy *= decay;
    gust *= Math.exp(-TICK * GUST.decay);
    moveLure();

    const sway = SWAY * Math.sin(time * 0.31) + SWAY * 0.55 * Math.sin(time * 0.77 + 1);
    for (const b of flock) steer(b, sway); // 모두 같은 순간의 자리를 보고 힘을 정한 뒤에 움직임

    const vmin = SPEED[0] * u;
    const vmax = SPEED[1] * u * (1 + GUST.speed * gust);
    const out = 0.3 * u; // 그림판 밖으로 이만큼 나가면(꼬리까지 다 빠지면) 다시 생겨남
    const full = (L.room ?? preset.room) * u;
    for (const b of flock) {
      // 오래된 잔상 버리기
      while (b.count && tick - b.ts[(b.head - b.count + N) % N] >= N) b.count--;

      b.rest -= TICK;
      b.vx += b.ax * TICK;
      b.vy += b.ay * TICK;
      const v = Math.hypot(b.vx, b.vy) || 1;
      const k = Math.min(Math.max(v, vmin), vmax) / v;
      b.vx *= k;
      b.vy *= k;
      b.x += b.vx * TICK;
      b.y += b.vy * TICK;
      let space = room(b.x, b.y);
      if (b.x < -out || b.x > w + out || b.y < -out || b.y > h + out || (preset.sink && space <= 0)) {
        enter(b);
        space = room(b.x, b.y);
      }

      // 머리는 생겨날 때 서서히 커지고, 글자 상자에 가까울수록 가늘어짐. 남긴 잔상은 그때 크기 그대로 작아져 감
      b.xs[b.head] = b.x;
      b.ys[b.head] = b.y;
      b.rs[b.head] = b.r * u * smooth((time - b.born) / GROW) * smooth(space / full);
      b.ts[b.head] = tick;
      b.head = (b.head + 1) % N;
      b.count = Math.min(b.count + 1, N);
    }
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = ALPHA;
    for (const b of flock) {
      if (!b.count) continue;
      // 한 줄기의 원을 한 경로로 모아 한 번에 칠해야 겹친 잔상끼리 진해지지 않습니다.
      // 빠를 때(돌풍) 잔상 사이가 벌어져 구슬처럼 끊겨 보이지 않게, 이웃한 두 원 사이를 사다리꼴로 메웁니다.
      // 원과 사다리꼴을 같은 돌림 방향으로 그려야 겹친 곳이 비지 않습니다(nonzero 칠하기).
      ctx.beginPath();
      let px = 0, py = 0, pr = 0; // 바로 앞(머리 쪽) 잔상
      for (let j = 0; j < b.count; j++) {
        const k = (b.head - 1 - j + N) % N;
        const r = b.rs[k] * (1 - (tick - b.ts[k]) / N) ** TAPER;
        if (r < 0.4) {
          pr = 0;
          continue;
        }
        const x = b.xs[k];
        const y = b.ys[k];
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
        const d = Math.hypot(x - px, y - py);
        if (pr && d > 0.5) {
          const nx = -(y - py) / d;
          const ny = (x - px) / d;
          ctx.moveTo(px + nx * pr, py + ny * pr);
          ctx.lineTo(px - nx * pr, py - ny * pr);
          ctx.lineTo(x - nx * r, y - ny * r);
          ctx.lineTo(x + nx * r, y + ny * r);
          ctx.closePath();
        }
        px = x;
        py = y;
        pr = r;
      }
      ctx.fillStyle = b.color;
      ctx.fill();
    }
  }

  function frame(now) {
    raf = 0;
    acc += Math.min(Math.max((now - last) / 1000, 0), 0.1);
    last = now;
    for (let n = 0; acc >= TICK && n < 6; n++) {
      step();
      acc -= TICK;
    }
    acc = Math.min(acc, TICK);
    draw();
    if (w && onScreen) raf = requestAnimationFrame(frame);
  }

  function wake() {
    if (raf || !w || !onScreen) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const layout = rect.width && rect.height ? preset.layout(canvas, rect.width, rect.height) : null;
    if (!layout) {
      // 그림판이 숨겨져 있거나, 글자가 길어 빈 곳이 좁음
      if (w) canvas.width = canvas.width; // 그림 지우기
      w = h = 0;
      return;
    }
    L = layout;
    w = rect.width;
    h = rect.height;
    u = L.u;
    if (prev && (prev.w !== w || prev.h !== h || prev.u !== u)) {
      const sx = w / prev.w;
      const sy = h / prev.h;
      const su = u / prev.u;
      for (const b of boids) {
        b.x *= sx;
        b.y *= sy;
        b.vx *= su;
        b.vy *= su;
        for (let k = 0; k < N; k++) {
          b.xs[k] *= sx;
          b.ys[k] *= sy;
          b.rs[k] *= su;
        }
      }
    }
    prev = { w, h, u };
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const before = flock.length;
    flock = boids.slice(0, L.count ?? boids.length);
    if (!ready) {
      place();
      ready = true;
    } else {
      flock.slice(before).forEach(enter); // 화면이 넓어져 늘어난 줄기는 바람이 시작되는 곳에서
    }
    draw();
    wake();
  }

  new ResizeObserver(resize).observe(canvas);
  document.fonts?.ready.then(resize); // 글꼴을 받으면 글자 상자가 바뀜

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    wake();
  }).observe(canvas);

  scope.addEventListener("wind:gust", () => {
    gust = Math.min(gust + 1, 1.5);
    wake();
  });

  // 스크롤 돌풍. 잠깐 멈췄다 다시 넘기기 시작한 첫 순간은 빠르기를 잴 수 없어 건너뜀
  let scrollY = window.scrollY;
  let scrollT = 0;
  let scrollV = 0;
  addEventListener(
    "scroll",
    (e) => {
      const dt = (e.timeStamp - scrollT) / 1000;
      const v = Math.abs(window.scrollY - scrollY) / dt;
      scrollY = window.scrollY;
      scrollT = e.timeStamp;
      if (!(dt > 0 && dt < 0.2)) {
        scrollV = 0;
        return;
      }
      scrollV = scrollV * 0.5 + v * 0.5; // 손가락 떨림에 들쭉날쭉하지 않게
      gust = Math.max(gust, Math.min(scrollV / SCROLL.full, SCROLL.max));
      wake();
    },
    { passive: true },
  );

  area.addEventListener("pointermove", (e) => {
    if (!L) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const inside = room(x, y) > 0; // 글자 상자 안에 있으면 없는 것으로 봄
    const dt = (e.timeStamp - pointer.t) / 1000;
    if (pointer.active && dt > 0 && dt < 0.2) {
      pointer.vx = pointer.vx * 0.5 + ((x - pointer.x) / dt) * 0.5;
      pointer.vy = pointer.vy * 0.5 + ((y - pointer.y) / dt) * 0.5;
    }
    if (inside && !pointer.active && lure.on < 0.05) {
      // 꺼져 있었으면 마우스 자리에서 시작
      lure.x = x;
      lure.y = y;
      lure.vx = lure.vy = 0;
    }
    pointer.x = x;
    pointer.y = y;
    pointer.t = e.timeStamp;
    pointer.active = inside;
  });
  area.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
}
