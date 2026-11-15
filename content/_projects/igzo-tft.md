---
title: IGZO TFT 설계·시뮬레이션·공정
summary: 1 µm급 IGZO TFT의 W/L과 게이트 오정렬 변화에 따른 공정 허용오차와 전기적 특성을 분석했습니다. 레이아웃부터 공정 레시피, DEVSIM/TCAD 시뮬레이션까지 직접 수행한 EoN 22기 프로젝트입니다.
repo: Kyonggi-EoN/hw_2026
site: /hw_2026/
image: /content/images/projects/igzo-tft.png   # 원본: hw_2026 사이트의 master_gds.png
tags: [Semiconductor, IGZO TFT, KLayout, TCAD]
status: active
year: 2026
featured: true
order: 2
---

25 × 25 mm 마스크에 TFT 128셀, 인버터 90셀, 게이트 오정렬 TFT 160셀, 1 µm급 소자 252셀을 배치하고
공정 레시피 설계와 DEVSIM/TCAD 시뮬레이션까지 진행했습니다.

팀원이 담당 블록을 각자 `.oas`/`.gds` 파일로 작업하면, 통합 담당자가 `master.oas`에서 블록을 배치·배선해 최종 tapeout 파일을 관리합니다.

자세한 설계·시뮬레이션 결과는 [프로젝트 사이트](/hw_2026/)에 정리되어 있습니다.
