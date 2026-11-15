// 사이트 공통 스크립트의 진입점.
// 기능은 modules/ 아래에 파일 하나씩 두고, 여기서 불러와 실행만 합니다.
// 새 기능 추가: modules/<기능>.js 작성 → 아래에 import 한 줄 + 호출 한 줄.

import { initTheme } from "./modules/theme.js";
import { initNav } from "./modules/nav.js";

initTheme();
initNav();
