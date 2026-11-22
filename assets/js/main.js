// 사이트 공통 스크립트의 진입점.
// 기능은 modules/ 아래에 파일 하나씩 두고, 여기서 불러와 실행만 합니다.
// - 메뉴는 가장 먼저 불러옵니다. 나머지는 파일마다 따로 불러와서, 하나가 받아지지 않거나
//   오래된 브라우저에서 깨져도 메뉴와 다른 기능은 그대로 움직입니다.
// - 새 기능 추가: modules/<기능>.js 작성 → 아래 FEATURES에 [파일, 실행할 함수] 한 줄.

import { initNav } from "./modules/nav.js";

initNav();

const FEATURES = [
  ["copy.js", "initCopy"],
  ["hero-rotate.js", "initHeroRotate"],
  ["wind.js", "initWind"],
  ["wind-lines.js", "initWindLines"],
  ["news-filter.js", "initNewsFilter"],
];

if (document.querySelector("[data-exhibition-chapters], .poster-detail")) {
  FEATURES.push(["exhibition.js", "initExhibition"]);
}

for (const [file, init] of FEATURES) {
  import(`./modules/${file}`)
    .then((m) => m[init]())
    .catch((err) => console.error(`${file}:`, err));
}
