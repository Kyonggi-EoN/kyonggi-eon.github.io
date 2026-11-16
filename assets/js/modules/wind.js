// 바람 테마의 줄기 떼. canvas[data-wind]마다 글자 뒤 빈 곳으로 바람 줄기 떼가 지나갑니다.
//   data-wind: 그림판이 놓인 곳(아래 PRESETS).
//     hero: 홈 첫 화면 오른쪽 칸 (_includes/sections/hero.html, content/pages/index.md의 hero.wind)
//     page: 페이지 제목 칸 오른쪽 (_layouts/page.html, _config.yml의 wind.pages)
//   data-wind-mode: 마우스를 prey(먹잇감)로 볼지 obstacle(장애물)로 볼지
// 바람 테마 전체 규칙은 _sass/_tokens.scss의 --wind-colors 설명을, 선을 따라 지나가는 줄기는 wind-lines.js를 보세요.
//
// - 줄기 하나 = 날아가는 원 하나 + 지나온 자리에 남는 잔상. 잔상은 오래될수록 작아져서
//   둥근 머리에 꼬리가 가늘어지는 모양이 됩니다. 길이와 휨은 그때그때 움직임에서 저절로 나옵니다.
// - 줄기마다 --wind-colors 한 색을 그대로 칠하고, 여러 색이 섞여 날아갑니다.
// - 움직임은 보이드(boids, Craig Reynolds 1986) 규칙입니다. 참고: https://github.com/sergioabreu-g/boids
//   · 가까운 줄기끼리 너무 붙으면 떨어지고(separation), 같은 쪽으로 날고(alignment), 무리 가운데로 모입니다(cohesion).
//   · 여기에 왼쪽에서 오른쪽으로 부는 약한 바람을 더해, 무리가 대체로 오른쪽으로 흘러갑니다.
//   · 오른쪽 끝으로 나가면 왼쪽에서 다시 들어옵니다. 위아래로는 글자를 피한 빈 띠 안에서만 납니다.
//   · 방향을 바꾸는 힘에 한도(TURN)가 있어 크게 돌아 나가고, 제자리에서 휘감기지 않습니다.
// - 마우스
//   · prey(먹잇감): 마우스를 늦게, 출렁이며 따라가는 점을 쫓아 몰려듭니다
//     (_refs/2026-11-16-antigravity-google-wobbly-motion). 닿으면 그대로 지나쳐 잠깐 흩어졌다가 다시 쫓아옵니다.
//     마우스가 멈춰 있으면 느슨하게 둘레를 지나다니고, 움직이면 힘껏 따라붙습니다.
//   · obstacle(장애물): 마우스 둘레를 비켜 흘러가고, 마우스를 빠르게 휘저으면 그 방향으로 밀립니다.
// - 돌풍: 같은 구역(section·header)에 'wind:gust' 이벤트가 오면 잠깐 바람이 세져서 무리가 빨라지고 꼬리가 길어집니다.
//   홈 사진이 바뀔 때 hero-rotate.js가 보냅니다.
// - 화면 밖으로 스크롤하거나 다른 탭을 보면 멈춥니다. '동작 줄이기'를 켠 사용자에게는 멈춘 한 장면만 보여 줍니다.

// 길이는 모두 바람이 부는 띠의 너비(u)에 대한 비율입니다. 홈 첫 화면은 칸 너비 864px이면 0.1u ≈ 86px.
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
const SWAY = 0.3; // 바람 방향이 위아래로 천천히 흔들리는 폭(rad)
const EDGE = 25; // 띠 밖으로 나가면 되미는 힘
const GUST = {
  wind: 1.2, // 돌풍이 한창일 때 바람 빠르기가 이만큼 더해짐(WIND의 배수)
  speed: 0.8, // 그때 최대 빠르기도 이만큼 더해짐(SPEED[1]의 배수)
  decay: 1.2, // 잦아드는 빠르기(1/초). 1.2면 1초 뒤 30%, 2초 뒤 9%
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

// 놓이는 곳마다 다른 값. region은 그림판 크기(w, h, px)를 받아 바람이 부는 띠를 px로 돌려줍니다.
//   left·right: 띠의 왼쪽·오른쪽 끝. 그 너비가 길이 단위 u
//   top·bottom: 날 수 있는 위·아래 끝. x < nearRight인 곳은 위쪽을 nearTop까지 더 낮게 막음
//   null이면 빈 곳이 좁아서 그리지 않음
const PRESETS = {
  // 홈 첫 화면 오른쪽 칸. 위로는 제목·구호, 아래로는 링크를 피한 사이 띠. 제목·구호가 있는 왼쪽은 위를 더 낮게 막음.
  // 오른쪽 끝으로 나가면 왼쪽 끝(사진 뒤)에서 다시 들어옵니다.
  hero: {
    count: 17, // 줄기 수. 색은 --wind-colors를 차례로 돌려 씀
    size: [0.005, 0.03], // 머리 반지름 범위(u)
    spread: [-0.3, 1.1], // 처음에 흩어 놓는 가로 범위(u, 띠 왼쪽 끝 기준)
    enter: [-0.15, -0.02], // 다시 들어오는 가로 위치(u)
    wall: -0.15, // 이보다 왼쪽으로는 못 감(u)
    grow: false, // 다시 들어올 때 머리가 0에서 커지는지
    region: (canvas, w, h) => ({ left: 0, right: w, top: 0.2 * h, bottom: 0.78 * h, nearTop: 0.44 * h, nearRight: 0.62 * w }),
  },
  // 페이지 제목 칸. 제목·설명 글자의 오른쪽 끝에서 조금 띄운 곳부터 화면 오른쪽 끝까지.
  // 글자 옆 빈 곳에서 생겨나 오른쪽으로 흘러 나갑니다.
  page: {
    count: 9,
    size: [0.004, 0.016],
    spread: [0, 1],
    enter: [0, 0.08],
    wall: 0,
    grow: true,
    region(canvas, w, h) {
      const left = textRight(canvas.parentElement.querySelector(".container"), canvas) + 48;
      if (w - left < 240) return null;
      return { left, right: w, top: 0.2 * h, bottom: 0.85 * h, nearTop: 0.2 * h, nearRight: left };
    },
  },
};

const TICK = 1 / 60; // 움직임을 계산하는 간격(초). 잔상도 이 간격마다 하나씩 남김
const N = Math.round(TRAIL / TICK); // 줄기 하나에 남는 잔상 수
const GROW = 0.6; // 머리가 0에서 제 크기까지 커지는 시간(초)
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

// el 안 글자들의 오른쪽 끝(canvas 왼쪽 기준 px). 제목 같은 블록 요소는 칸 너비만큼 넓으므로 글자 자체를 잽니다.
function textRight(el, canvas) {
  const left = canvas.getBoundingClientRect().left;
  let right = left;
  if (!el) return 0;
  const range = document.createRange();
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) {
    if (!walk.currentNode.data.trim()) continue;
    range.selectNodeContents(walk.currentNode);
    right = Math.max(right, range.getBoundingClientRect().right);
  }
  return right - left;
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
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const colors = windColors(canvas);
  if (!colors.length) return;

  let w = 0; // 그림판 너비·높이(px). 0이면 그리지 않음
  let h = 0;
  let u = 0; // 길이 단위 = 띠 너비(px)
  let R = null; // 바람이 부는 띠 (PRESETS의 region)
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
  const boids = Array.from({ length: preset.count }, (_, i) => {
    const delay = Math.random() * 0.6; // 처음 커지기 시작하는 때(초)
    return {
      color: colors[i % colors.length],
      r: rand(preset.size),
      phase: Math.random() * Math.PI * 2,
      born: delay, // 머리가 커지기 시작한 때(초)
      x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0,
      rest: 0, // 먹잇감에 닿은 뒤 쫓지 않는 남은 시간(초)
      // 잔상: 고리 버퍼. 위치, 반지름, 남긴 때(tick)
      xs: new Float32Array(N),
      ys: new Float32Array(N),
      rs: new Float32Array(N),
      ts: new Float64Array(N),
      head: 0,
      count: 0,
    };
  });

  // 줄기 b를 띠 왼쪽 끝에서 x(u)만큼 떨어진 곳에 놓고 오른쪽으로 날아가게 합니다. 잔상은 지움
  function enter(b, x) {
    const a = rand([-0.3, 0.3]);
    const v = rand(SPEED) * u;
    b.x = R.left + x * u;
    b.y = rand([R.nearTop + 0.04 * h, R.bottom - 0.04 * h]);
    b.vx = Math.cos(a) * v;
    b.vy = Math.sin(a) * v;
    b.count = 0;
  }

  // 처음에는 띠 너비 전체에 고르게 흩어 놓음
  function place() {
    const [lo, hi] = preset.spread;
    boids.forEach((b, i) => enter(b, lo + ((i + Math.random()) / preset.count) * (hi - lo)));
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

  // 줄기 하나가 이번에 받는 힘(가속도)을 b.ax, b.ay에 적습니다.
  function steer(b, wx, wy) {
    const sight = SIGHT * u;
    const space = SPACE * u;
    const vmax = SPEED[1] * u;

    // 보이드: 이웃 찾기
    let n = 0;
    let cx = 0, cy = 0, avx = 0, avy = 0, sx = 0, sy = 0;
    for (const o of boids) {
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

    // 바람(쫓는 동안은 약해지고, 돌풍 때는 세짐) + 보이드 세 규칙 + 좌우 흔들림
    const wind = WIND_PULL * (1 + gust) * (1 - 0.8 * Math.min(chase, 1));
    let ax = (wx - b.vx) * wind + sx * SEPARATION * u;
    let ay = (wy - b.vy) * wind + sy * SEPARATION * u;
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

    // 방향을 바꾸는 힘의 한도(돌풍 때는 넉넉하게). 아래 장애물과 띠는 한도 밖에서 따로 더해 꼭 지키게 함
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

    // 띠 밖으로 나가면 되밀고, 나가는 쪽 속도를 줄임
    const top = b.x < R.nearRight ? R.nearTop : R.top;
    if (b.y < top) ay += (top - b.y) * EDGE - Math.min(b.vy, 0) * 3;
    if (b.y > R.bottom) ay -= (b.y - R.bottom) * EDGE + Math.max(b.vy, 0) * 3;
    const wall = R.left + preset.wall * u;
    if (b.x < wall) ax += (wall - b.x) * EDGE;

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

    const wa = SWAY * Math.sin(time * 0.31) + SWAY * 0.55 * Math.sin(time * 0.77 + 1);
    const wind = WIND * u * (1 + GUST.wind * gust);
    const wx = Math.cos(wa) * wind;
    const wy = Math.sin(wa) * wind;
    for (const b of boids) steer(b, wx, wy); // 모두 같은 순간의 자리를 보고 힘을 정한 뒤에 움직임

    const vmin = SPEED[0] * u;
    const vmax = SPEED[1] * u * (1 + GUST.speed * gust);
    for (const b of boids) {
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
      if (b.x > R.right + 0.3 * u) {
        enter(b, rand(preset.enter));
        if (preset.grow) b.born = time;
      }

      // 머리는 처음(grow면 다시 들어올 때마다) 서서히 커짐. 남긴 잔상은 그때 크기 그대로 작아져 감
      b.xs[b.head] = b.x;
      b.ys[b.head] = b.y;
      b.rs[b.head] = b.r * u * smooth((time - b.born) / GROW);
      b.ts[b.head] = tick;
      b.head = (b.head + 1) % N;
      b.count = Math.min(b.count + 1, N);
    }
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = ALPHA;
    for (const b of boids) {
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
    if (still || raf || !w || !onScreen) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const region = rect.width && rect.height ? preset.region(canvas, rect.width, rect.height) : null;
    if (!region) {
      // 좁은 화면에서는 숨겨져 있거나, 글자가 길어 빈 곳이 좁음
      if (w) canvas.width = canvas.width; // 그림 지우기
      w = h = 0;
      return;
    }
    R = region;
    w = rect.width;
    h = rect.height;
    u = R.right - R.left;
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
    if (!ready) {
      place();
      // 동작 줄이기: 처음 3초를 미리 계산해 무리가 한창 지나가는 한 장면만 그림
      if (still) for (let n = 0; n < 3 / TICK; n++) step();
      ready = true;
    }
    draw();
    wake();
  }

  new ResizeObserver(resize).observe(canvas);
  document.fonts?.ready.then(resize); // 글꼴을 받으면 글자 폭이 바뀜 (page의 띠 왼쪽 끝)
  if (still) return;

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    wake();
  }).observe(canvas);

  scope.addEventListener("wind:gust", () => {
    gust = Math.min(gust + 1, 1.5);
    wake();
  });

  area.addEventListener("pointermove", (e) => {
    if (!R) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const inside = x >= R.left - 0.05 * u; // 띠 왼쪽 글자 위에 있으면 없는 것으로 봄
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
