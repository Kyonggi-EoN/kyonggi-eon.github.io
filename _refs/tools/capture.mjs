#!/usr/bin/env node
// 디자인 레퍼런스 캡처
// 웹페이지의 한 부분을 찍고, 브라우저가 계산한 스타일 값을 뽑아 _refs/<날짜>-<사이트>-<이름>/ 에 저장합니다.
//   shot.png  해당 부분 스크린샷 (주변 여백 포함)
//   ref.md    머리말 + 메모 칸 + 자동 수집 값
//
// 사용: node _refs/tools/capture.mjs <url> "<selector>" [이름] [--avoid] [--width 390] [--pad 32]
// 시스템 Chrome을 씁니다. 다른 브라우저를 쓰려면 CHROME=/경로/chrome 을 앞에 붙이세요.

import { chromium } from "playwright-core";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const USAGE = 'node _refs/tools/capture.mjs <url> "<selector>" [이름] [--avoid] [--width 390] [--pad 32]';

const { values: opt, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    avoid: { type: "boolean", default: false }, // 안티 레퍼런스(피할 것)로 저장
    width: { type: "string", default: "1440" }, // 화면 폭. 모바일은 390
    pad: { type: "string", default: "32" }, // 스크린샷에 함께 담을 주변 여백(px)
  },
});
const [url, selector, name] = positionals;
if (!url || !selector) {
  console.error(`사용: ${USAGE}`);
  process.exit(1);
}

const refsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }); // YYYY-MM-DD
const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
const host = slugify(new URL(url).hostname.replace(/^www\./, "")) || "local";
const base = `${today}-${host}-${slugify(name || selector) || "ref"}`;
let dir = path.join(refsDir, base);
for (let i = 2; existsSync(dir); i++) dir = path.join(refsDir, `${base}-${i}`);

const browser = await chromium.launch(
  process.env.CHROME ? { executablePath: process.env.CHROME } : { channel: "chrome" },
);
try {
  const page = await browser.newPage({
    viewport: { width: Number(opt.width), height: 900 },
    locale: "ko-KR",
    colorScheme: "light",
  });
  await page.goto(url, { waitUntil: "load", timeout: 45_000 });
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});

  const matches = page.locator(selector);
  const count = await matches.count();
  if (!count) throw new Error(`selector에 맞는 요소가 없습니다: ${selector}`);
  const el = matches.first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600); // 스크롤하면 나타나는 애니메이션을 기다림
  await page.evaluate(() => document.fonts.ready);

  const clip = await el.evaluate((e, pad) => {
    const r = e.getBoundingClientRect();
    const doc = document.documentElement;
    const x = Math.max(0, r.left + scrollX - pad);
    const y = Math.max(0, r.top + scrollY - pad);
    return {
      x,
      y,
      width: Math.min(doc.scrollWidth, r.right + scrollX + pad) - x,
      height: Math.min(doc.scrollHeight, r.bottom + scrollY + pad) - y,
    };
  }, Number(opt.pad));

  await mkdir(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, "shot.png"), fullPage: true, clip, animations: "disabled" });

  const lines = await el.evaluate(collect);
  const head = [
    `화면 폭 ${opt.width}px · selector 일치 ${count}개${count > 1 ? " 중 첫 번째" : ""}`,
    "",
  ];
  await writeFile(path.join(dir, "ref.md"), render([...head, ...lines]));
  console.log(`저장: ${path.relative(process.cwd(), dir)}/ (shot.png, ref.md)`);
} finally {
  await browser.close();
}

function render(lines) {
  const notes = opt.avoid
    ? `## 문제점
<!-- 형용사 말고 속성으로. 예) 모든 카드가 1px 테두리 + 12px 라운드 + 그림자 + hover 3px 떠오름 -->

## 우리 사이트에서 해당하는 곳

## 대신
`
    : `## 좋은 점
<!-- 형용사 말고 속성으로. 예) 카드에 테두리·그림자 없이 48px 여백으로만 구분 -->

## 우리 사이트에 쓰면
<!-- 어느 부분에, 지금의 무엇 대신 -->

## 버릴 점
`;
  return `---
url: ${url}
selector: ${JSON.stringify(selector)}
captured: ${today}
viewport: ${opt.width}
part:        # hero | header | nav | card | list | article | footer | page
axis: []     # type, color, layout, density, motion, image, copy
verdict: ${opt.avoid ? "avoid" : "like"}
---

![](shot.png)

${notes}
---

## 자동 수집 (capture.mjs)
<!-- 브라우저가 계산한 값입니다. 손으로 고치지 말고, 다시 뽑으려면 capture.mjs를 다시 실행하세요. -->

\`\`\`text
${lines.join("\n")}
\`\`\`
`;
}

// ── 아래는 브라우저 안에서 실행됩니다 ──────────────────────────────
function collect(root) {
  const px = (v) => parseFloat(v) || 0;
  const round = (n) => Math.round(n * 10) / 10;
  const hex = (c) => {
    // rgb(20, 20, 24) / rgba(…) / color(srgb 0.07 0.54 0.26 / 0.12) → #rrggbb [투명도%]
    let m = c.match(/^rgba?\(([^)]+)\)$/);
    let scale = 1;
    if (!m) {
      m = c.match(/^color\(srgb ([^)]+)\)$/);
      scale = 255;
    }
    if (!m) return c; // oklch() 같은 값은 그대로
    const nums = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    const [r, g, b] = nums.slice(0, 3).map((n) => n * scale);
    const a = nums[3] ?? 1;
    if (a === 0) return null;
    const h = "#" + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, "0")).join("");
    return a < 1 ? `${h} ${Math.round(a * 100)}%` : h;
  };
  const label = (e) =>
    e.tagName.toLowerCase() +
    (e.id ? `#${e.id}` : "") +
    [...e.classList].slice(0, 2).map((c) => `.${c}`).join("");
  const size = (e) => {
    const r = e.getBoundingClientRect();
    return `${Math.round(r.width)}×${Math.round(r.height)}`;
  };
  const visible = (e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden";
  };
  const ownText = (e) =>
    [...e.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent.trim())
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  // "0.18s, 0.18s, 0.18s" → "0.18s"
  const once = (v) => {
    const parts = v.split(/,\s*(?![^(]*\))/);
    return parts.every((x) => x === parts[0]) ? parts[0] : v;
  };
  const intPx = (v) => v.replace(/(\d+\.\d+)px/g, (_, n) => `${Math.round(n)}px`);
  const squeeze = (list) => {
    // "262px 262px 262px" → "262px×3"
    const out = [];
    for (const v of list) {
      const last = out[out.length - 1];
      if (last && last.v === v) last.n++;
      else out.push({ v, n: 1 });
    }
    return out.map(({ v, n }) => (n > 1 ? `${v}×${n}` : v)).join(" ");
  };

  const type = (s) => {
    const fs = px(s.fontSize);
    const lh = s.lineHeight === "normal" ? "normal" : (px(s.lineHeight) / fs).toFixed(2);
    const ls =
      s.letterSpacing === "normal" ? "0" : `${+(px(s.letterSpacing) / fs).toFixed(3)}em`;
    const fam = s.fontFamily.split(",")[0].replace(/["']/g, "").trim();
    const tt = s.textTransform !== "none" ? ` ${s.textTransform}` : "";
    return `${round(fs)}px w${s.fontWeight} lh ${lh} ls ${ls} ${fam}${tt}`;
  };
  const layout = (s) => {
    const d = s.display;
    const out = [`display ${d}`];
    if (d.includes("grid")) {
      out.push(`cols ${squeeze(intPx(s.gridTemplateColumns).split(" "))}`);
      if (s.gridTemplateRows !== "none") out.push(`rows ${squeeze(intPx(s.gridTemplateRows).split(" "))}`);
    }
    if (d.includes("flex")) {
      out.push(s.flexDirection, `align ${s.alignItems}`, `justify ${s.justifyContent}`);
      if (s.flexWrap !== "nowrap") out.push(s.flexWrap);
    }
    if (d.includes("grid") || d.includes("flex")) {
      const g = s.rowGap === s.columnGap ? s.rowGap : `${s.rowGap} ${s.columnGap}`;
      if (g !== "normal" && g !== "0px") out.push(`gap ${g}`);
    }
    if (s.maxWidth !== "none") out.push(`max-width ${s.maxWidth}`);
    return out.join(" · ");
  };
  const borders = (s) => {
    const sides = ["Top", "Right", "Bottom", "Left"]
      .filter((k) => px(s[`border${k}Width`]) > 0 && s[`border${k}Style`] !== "none")
      .map((k) => ({
        k: k.toLowerCase(),
        v: `${s[`border${k}Width`]} ${s[`border${k}Style`]} ${hex(s[`border${k}Color`])}`,
      }));
    if (!sides.length) return "";
    if (sides.length === 4 && sides.every((x) => x.v === sides[0].v)) return `border ${sides[0].v}`;
    return sides.map((x) => `border-${x.k} ${x.v}`).join(" · ");
  };
  const box = (s) =>
    [
      s.padding !== "0px" && `padding ${s.padding}`,
      s.margin !== "0px" && `margin ${s.margin}`,
      borders(s),
      s.borderRadius !== "0px" && `radius ${s.borderRadius}`,
      s.boxShadow !== "none" && `shadow ${s.boxShadow}`,
    ]
      .filter(Boolean)
      .join(" · ");
  const paint = (s) =>
    [
      `color ${hex(s.color)}`,
      hex(s.backgroundColor) && `bg ${hex(s.backgroundColor)}`,
      s.backgroundImage !== "none" && `bg-image ${s.backgroundImage.slice(0, 320)}`,
      +s.opacity < 1 && `opacity ${s.opacity}`,
      s.backdropFilter && s.backdropFilter !== "none" && `backdrop ${s.backdropFilter}`,
    ]
      .filter(Boolean)
      .join(" · ");
  const motion = (s) =>
    [
      s.transitionDuration.split(",").some((d) => px(d) > 0) &&
        `transition ${s.transitionProperty} ${once(s.transitionDuration)} ${once(s.transitionTimingFunction)}`,
      s.animationName !== "none" && `animation ${s.animationName} ${s.animationDuration}`,
    ]
      .filter(Boolean)
      .join(" · ");
  const describe = (e, title) => {
    const s = getComputedStyle(e);
    const out = [`${title}  ${label(e)}  ${size(e)}`];
    if (ownText(e)) out.push(`  글자    ${type(s)}`);
    out.push(`  색      ${paint(s)}`, `  배치    ${layout(s)}`);
    if (box(s)) out.push(`  상자    ${box(s)}`);
    if (motion(s)) out.push(`  움직임  ${motion(s)}`);
    return out;
  };

  const lines = [];
  lines.push(...describe(root, "대상"));
  if (root.parentElement) {
    const p = root.parentElement;
    lines.push(`부모  ${label(p)}  ${size(p)}`, `  배치    ${layout(getComputedStyle(p))}`);
  }
  const kids = [...root.children].filter(visible);
  if (kids.length) {
    lines.push(`자식  ${kids.length}개: ${squeeze(kids.map((k) => `${label(k)} ${size(k)}`)).slice(0, 400)}`);
  }

  // 하위 요소 전체를 훑어 쓰인 값들을 모읍니다.
  const all = [root, ...root.querySelectorAll("*")].slice(0, 4000).filter(visible);
  const texts = new Map();
  const colors = new Map();
  const spaces = new Map();
  const radii = new Map();
  const shadows = new Map();
  const motions = new Map();
  const bump = (map, key, extra) => {
    const v = map.get(key) || { n: 0, ...extra };
    v.n++;
    map.set(key, v);
    return v;
  };
  const addColor = (c, role) => {
    const h = hex(c);
    if (h) bump(colors, h, { roles: new Set() }).roles.add(role);
  };
  for (const e of all) {
    const s = getComputedStyle(e);
    const t = ownText(e);
    if (t) {
      bump(texts, `${type(s)} · ${hex(s.color)}`, {
        sample: t.slice(0, 28),
        fs: px(s.fontSize),
        w: +s.fontWeight,
      });
      addColor(s.color, "글자");
    }
    addColor(s.backgroundColor, "배경");
    for (const k of ["Top", "Right", "Bottom", "Left"]) {
      if (px(s[`border${k}Width`]) > 0 && s[`border${k}Style`] !== "none") {
        addColor(s[`border${k}Color`], "선");
        break;
      }
    }
    for (const prop of ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "marginTop", "marginBottom", "rowGap", "columnGap"]) {
      const v = Math.round(px(s[prop]));
      if (v > 0) bump(spaces, v);
    }
    if (s.borderRadius !== "0px") bump(radii, s.borderRadius);
    if (s.boxShadow !== "none") bump(shadows, s.boxShadow);
    if (e !== root && motion(s)) bump(motions, `${label(e)}  ${motion(s)}`);
  }

  const top = (map, n, fmt) => [...map].sort((a, b) => b[1].n - a[1].n).slice(0, n).map(fmt);

  lines.push("", "글자 스타일 (큰 것부터)");
  [...texts]
    .sort((a, b) => b[1].fs - a[1].fs || b[1].w - a[1].w)
    .slice(0, 12)
    .forEach(([k, v]) => lines.push(`  ${k}  ×${v.n}  "${v.sample}"`));

  lines.push("", "색 (많이 쓰인 순)");
  top(colors, 10, ([h, v]) => `  ${h}  ×${v.n}  ${[...v.roles].join("/")}`).forEach((l) => lines.push(l));

  lines.push(
    "",
    `간격 값(px ×횟수)  ${[...spaces].sort((a, b) => a[0] - b[0]).map(([v, o]) => `${v}×${o.n}`).join("  ")}`,
  );
  if (radii.size) lines.push(`라운드  ${top(radii, 6, ([r, v]) => `${r}×${v.n}`).join("  ")}`);
  if (shadows.size) {
    lines.push("그림자");
    top(shadows, 3, ([sh, v]) => `  ×${v.n}  ${sh}`).forEach((l) => lines.push(l));
  }

  if (motions.size) {
    lines.push("움직임 (하위 요소)");
    top(motions, 6, ([m, v]) => `  ${m}${v.n > 1 ? `  ×${v.n}` : ""}`).forEach((l) => lines.push(l));
  }

  const media = [...root.querySelectorAll("img, picture, video, svg, canvas, iframe")].filter(
    (e) => visible(e) && !e.closest("svg svg, picture img"),
  );
  if (media.length) {
    const byTag = {};
    media.forEach((m) => (byTag[m.tagName.toLowerCase()] = (byTag[m.tagName.toLowerCase()] || 0) + 1));
    const imgs = media
      .filter((m) => m.tagName === "IMG")
      .slice(0, 5)
      .map((m) => `${size(m)} ${getComputedStyle(m).objectFit}`);
    lines.push(
      "",
      `이미지  ${Object.entries(byTag).map(([t, n]) => `${t} ${n}`).join(" · ")}${imgs.length ? `  (img: ${imgs.join(", ")})` : ""}`,
    );
  }

  const loaded = [...new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/["']/g, "")))];
  if (loaded.length) lines.push(`로드된 웹폰트  ${loaded.join(", ")}`);

  // 마크업 구조 (같은 형태의 형제는 묶음)
  lines.push("", "구조");
  const tree = (e, depth) => {
    if (lines.length > 140) return;
    const t = ownText(e);
    lines.push(`${"  ".repeat(depth + 1)}${label(e)}${t ? `  "${t.slice(0, 24)}"` : ""}`);
    if (e.tagName === "svg") return;
    const cs = [...e.children].filter(visible);
    if (depth >= 5) {
      if (cs.length) lines.push(`${"  ".repeat(depth + 2)}… ${cs.length}개`);
      return;
    }
    for (let i = 0; i < cs.length; ) {
      let j = i;
      while (j + 1 < cs.length && label(cs[j + 1]) === label(cs[i])) j++;
      tree(cs[i], depth + 1);
      if (j > i) lines.push(`${"  ".repeat(depth + 2)}(같은 형태 ×${j - i + 1})`);
      i = j + 1;
    }
  };
  tree(root, 0);
  return lines;
}
