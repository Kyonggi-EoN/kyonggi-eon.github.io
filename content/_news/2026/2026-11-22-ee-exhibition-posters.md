---
layout: exhibition
title: 2026 전자공학부 성과전시회 온라인 전시
date: 2026-11-22
category: event
description: 스마트폰으로 움직이는 로봇 팔, 색이 바뀌는 발광소자, 무선 신호로 위치를 찾는 기술을 비롯해 경기대학교 전자공학부의 연구와 실험을 소개합니다.
image: /content/images/news/2026-exhibition-poster.jpg
event_url: /news/2026/ee-exhibition/
demos_url: /news/2026/ee-exhibition-posters/demos/
hero:
  heading: 2026 전자공학부<br>성과전시회
  covers:
    - image: detail/krowd-2.webp
      alt: 트랙에 선 KROWD의 노란색 114번 자작차
      width: 760
      height: 380
    - image: feature-robotics.webp
      alt: 실내 바닥을 걷는 RV Lab.의 사족보행 로봇 Go2
      width: 1304
      height: 652
    - image: feature-semiconductors.webp
      alt: 노란 조명 아래 EoN이 사용한 박막 증착 장비 내부
      width: 1152
      height: 576
    - image: feature-communications.webp
      alt: I2COINS Lab.의 철도역 실내측위 시나리오
      width: 1024
      height: 512
organizations:
  - name: EoN
    logo: /assets/ui/logo.svg
    poster: eon-promo
  - name: EEI
    mark: eei
    poster: eei-1
  - name: "RO:AD"
    mark: road
    poster: road-1
  - name: KROWD
    mark: krowd
    poster: krowd-1
  - name: RV Lab.
    mark: rvlab
    poster: rvlab-1
  - name: NGSD
    mark: ngsd
    poster: ngsd-1
  - name: ASNL
    mark: asnl
    poster: asnl-1
  - name: SIDL
    poster: sidl-1
  - name: I2COINS Lab.
    mark: i2coins
    poster: i2coins-1
  - name: CSP Lab.
    mark: csp
    poster: csp-1
sections:
  - id: robotics
    title: 로봇·자율주행
    intro: 스마트폰으로 팔을 직접 움직이고, 말로 큐브를 놓을 자리를 지시하고, 네 발 로봇에 경로를 맡깁니다. 사람이 정하는 것과 로봇이 계산하는 것이 단계마다 어떻게 바뀌는지 살펴보세요.
    feature:
      alt: 실내 바닥을 걷는 네 발 로봇 Go2
      credit: RV Lab. · 길을 찾고, 시약을 붓는 로봇
      title: 로봇에게 움직임을 어떻게 맡길까?
    story:
      title: 로봇에게 어디까지 맡길 수 있을까?
      works:
        - id: eon-robot-1
          title: 손의 움직임을 팔로 전달하기
          text: 버튼을 누른 상태에서 스마트폰을 기울이면 로봇 팔의 집게도 기울어집니다. 집게를 어느 쪽으로 돌릴지는 사람이 계속 정합니다.
        - id: road-1
          title: 문장으로 놓을 자리를 알려 주기
          text: “큐브를 세모 위에 놓아”라고 지시하면, 팔이 큐브와 목표 위치를 영상에서 찾아 움직입니다. 더 잘 작동한 설정에서도 30번 중 11번 성공했습니다.
        - id: rvlab-2
          title: 목적지까지의 움직임을 맡기기
          text: Go2는 지도에서 정한 경유점을 받아 길을 따라갑니다. 주행 속도를 정하는 계산과, 열두 관절을 움직이는 계산은 서로 다른 속도로 반복합니다.
          alt: 지도에 표시된 주행 경로와 목표 지점, 실내를 이동하는 Go2의 주행 화면
    posters:
      - id: eon-robot-1
        team: EoN
        file: EoN_robot_1
        title: 스마트폰으로 원격 조작하는 SO-101 로봇 팔
        keywords: SO-ARM101 SO-101
        summary: 스마트폰의 6자유도 움직임을 5자유도 로봇 팔 SO-101의 동작으로 바꿔 원격으로 조작하는 시스템입니다. 버튼을 누르는 동안에만 동작을 전달하고, 팔이 움직이는 범위와 속도에 제한을 뒀습니다.
        look: "가운데 시뮬레이션 그림에서 스마트폰을 옆으로 돌리면 팔 전체가 회전합니다. 스마트폰을 앞으로 숙이면 그리퍼가 아래로 기울고, 옆으로 기울이면 그리퍼가 제자리에서 비틀립니다."
        crop: "스마트폰 기본 자세와 세 방향 회전에 대응하는 시뮬레이션 속 SO-101의 자세"
      - id: eon-robot-2
        team: EoN
        file: EoN_robot_2
        title: LeRobot 기반 SO-101 로봇팔 프로젝트
        keywords: SO-ARM101 SO-101 ACT 모방학습 리더암 팔로워암
        summary: 사람이 리더 팔로 물체를 상자에 넣는 동작을 시연하고, 카메라 영상과 관절 정보를 기록했습니다. 이 데이터로 ACT 정책을 학습시켜 팔로워 팔이 같은 작업을 스스로 수행하게 했습니다. 포스터의 비교 실험에서는 시연 기록을 30회에서 40회로 늘리자 성공률이 45%에서 80%로 올랐습니다.
        look: "왼쪽 사진은 학습한 로봇 팔이 물체를 상자에 옮기는 장면이고, 오른쪽은 실물 로봇으로 성공률을 평가하는 작업대입니다. 원본의 바로 아래 그래프에서는 시연 횟수와 학습 단계에 따른 성공률을 비교할 수 있습니다."
        crop: "보라색 SO-101 로봇 팔의 자율 실행 장면과 실물 로봇 평가 작업대"
      - id: road-1
        team: "RO:AD"
        file: ROAD_1
        title: 자연어 명령을 따르는 로봇 팔
        keywords: SO-ARM101 SO-101
        summary: 말로 지시한 도형 위에 큐브를 놓도록 실물 로봇 팔 SO-ARM101을 학습시켰습니다. SmolVLA의 두 학습 설정에서 각각 30번을 시험해 11번(36.7%)과 3번(10.0%) 성공했습니다. 사람이 팔을 조종할 때의 영상·관절 상태·동작·명령을 LeRobot으로 기록해 학습에 썼습니다.
        look: "11번 성공한 설정에서도 네모는 10번 중 5번, 원과 세모는 각각 3번 성공했습니다. 원본의 실패 유형 표에는 두 설정 모두 팔이 제자리에서 제한 시간을 넘긴 경우가 가장 많았습니다."
        crop: "두 SmolVLA 학습 설정의 원·세모·네모별 실물 로봇 시험 성공 횟수와 전체 성공률"
      - id: rvlab-2
        team: RV Lab.
        file: RVLab_2
        title: 길을 찾고, 시약을 붓는 로봇
        summary: 사족보행 로봇 Go2는 지도의 경유점을 따라 초당 5번 전진·회전 속도를 정하고, 초당 50번 관절 12개의 목표 각도를 계산합니다. 휴머노이드 G1 연구에서는 Isaac Lab의 가상 로봇으로 지시한 양만큼 시약을 붓는 전문가 시연을 기록합니다.
        look: "연속 장면에서 가상 G1이 비커를 집고 시약을 부은 뒤 내려놓습니다. 원본 왼쪽에는 Go2가 지도상의 경유점을 따라가는 별도 실험이 나옵니다."
        crop: "가상 휴머노이드 G1이 비커를 집고 시약을 붓고 내려놓는 연속 장면"
      - id: krowd-1
        team: KROWD
        file: KROWD_1
        reports:
          - file: krowd-2026-results
            label: 보고서 보기
        title: K-City 실도로를 달린 자작 자율주행차
        summary: KROWD는 자작차로 K-City에서 전역 경로 주행, 신호등 인식, 어린이 보호구역 장애물 회피 과제를 완수했습니다. 대회에서는 특별상인 국토교통과학기술진흥원장상을 받았습니다. 차량은 카메라와 라이다로 차선·신호등·장애물을 인식하고, 라이다 SLAM에 GPS와 IMU를 결합해 위치를 추정합니다.
        look: "카메라로 본 차선과 신호등, 라이다로 만든 지도와 장애물 감지 화면을 한 줄에 놓았습니다. 원본 위쪽의 구성도는 이렇게 얻은 정보가 차량의 제어로 이어지는 과정을 보여 줍니다."
        crop: "KROWD 자율주행차의 차선 인식, SLAM 지도, 신호등 인식, 장애물 회피 화면"
      - id: krowd-2
        team: KROWD
        file: KROWD_2
        title: P.B.Mebastion-26
        summary: P.B.Mebastion-26은 2026 대학생 AI·SW 모빌리티 경진대회에 출전한 KROWD의 114번 자작차입니다. 후륜에 10 kW 브러시형 직류 모터를 쓰고 58.8 V·78 Ah 배터리를 장착했습니다. 포스터에 적힌 최고 속도는 약 80 km/h이며, 자율주행 시스템은 ROS 2 기반입니다.
        look: "왼쪽 위 제원표의 출전 번호는 차체 앞면에서도 확인할 수 있습니다."
        crop: "트랙에 선 KROWD의 노란색 114번 자작차"
      - id: eei-1
        team: EEI
        file: EEI_1
        reports:
          - file: eei-musemap-drone-report
            label: MuseMAP 드론 개발 보고서 보기
        title: MuseMAP · 재난 현장 구조 지원
        summary: MuseMAP은 재난 현장의 구조대원과 지휘부가 정보를 공유하도록 돕는 프로젝트입니다. 드론 영상, 초광대역 무선통신(UWB)으로 추정한 실내 위치, 환경 센서 정보를 관제 화면과 증강현실 표시 장치(AR HUD)에 연결합니다. 팀은 기능별 시제품을 만들어 시험했습니다.
        look: "개념도에는 바깥에서 건물을 살피는 드론과 내부에 들어가는 드론이 따로 나옵니다. 원본에는 두 영상과 구조대원의 위치를 한 화면에서 공유하는 구성도 함께 실려 있습니다."
        crop: "건물 안팎에서 운용하는 두 드론을 나타낸 MuseMAP 구조 지원 개념도"
      - id: road-2
        team: "RO:AD"
        file: ROAD_2
        title: 로봇·자율주행 동아리 RO:AD
        summary: RO:AD는 2021년에 창립한 경기대학교 학술 중앙동아리입니다. 신입 부원은 Linux·ROS 2·Python 등을 익히고, 자율주행·로봇 팔 모방학습·드론 프로젝트에 참여합니다. 포스터에는 교외 7건과 교내 11건의 수상 기록이 실려 있습니다.
        look: "아래 활동 사진에서 스터디와 대회 성과를 나누는 정기 세미나, 졸업생 특강과 진로 멘토링을 여는 ‘로드인의 밤’을 찾아보세요."
        crop: "RO:AD 부원 단체 사진"
      - id: rvlab-1
        team: RV Lab.
        file: RVLab_1
        title: 로보틱스·비전 연구실
        summary: RV Lab.은 가상 환경에서 VR로 휴머노이드 조작 시연을 모아 모방학습에 활용하고, 조작 입력의 떨림을 줄이는 방법을 연구합니다. 자율주행 분야에서는 번호판 영상과 4D 레이더로 주변 차량의 자세를 추정하고, 카메라와 레이더를 함께 써 주행 중 위치를 파악하고 지도를 만듭니다.
        look: "도로 영상의 빨간색 영역은 지도에서 제외할 움직이는 물체입니다. 오른쪽 도식은 위치를 추적하고 지도를 만드는 과정에서 이 정보를 어디에 쓰는지 보여 줍니다."
        crop: "도로 영상에서 움직이는 물체를 가린 빨간색 마스크와 위치 추적·지도 작성 구조도"
  - id: semiconductors
    title: 반도체·소재
    intro: 전기 신호를 바꾸면 빛의 색이 달라집니다. 게이트 위치를 바꾼 트랜지스터에서는 켜졌을 때 흐르는 전류가 달라집니다. 사진과 측정값을 따라 재료와 구조가 소자의 동작을 어떻게 바꾸는지 살펴보세요.
    feature:
      alt: 노란 조명 아래 박막을 입히는 RF 스퍼터링 장비 내부
      credit: EoN · IGZO 박막 트랜지스터 제작 공정
      title: 재료와 구조를 바꾸면 빛과 전기는 어떻게 달라질까?
    story:
      title: 소자에서 한 가지를 바꾸면 무엇이 달라질까?
      works:
        - id: asnl-3
          title: 주파수를 높여 빛의 색 바꾸기
          text: 같은 배합의 소자에 가하는 교류의 주파수를 100 Hz에서 50 kHz까지 높였습니다. 파랗던 빛이 흰빛을 거쳐 주황색 계열로 바뀌었습니다.
        - id: eon-2
          title: 게이트를 옮겨 전류 비교하기
          text: 유리 위에 만든 박막 트랜지스터에서 전류를 조절하는 게이트의 위치를 달리했습니다. 같은 조건에서 시뮬레이션했을 때 게이트가 중앙인 구조의 ON 전류가 14.85 nA로 가장 컸습니다.
          alt: 게이트 위치가 다른 다섯 소자의 ON 전류를 비교한 그래프. 가운데 배치에서 14.85 nA로 가장 높다.
    posters:
      - id: asnl-3
        team: ASNL
        file: ASNL_3
        title: 전압과 주파수로 색을 바꾸는 발광소자
        summary: 같은 배합의 소자에서 교류 주파수를 100 Hz에서 50 kHz로 높이자 파란빛이 따뜻한 흰빛을 거쳐 주황색 계열로 바뀌었습니다. 연구팀은 서로 다른 색의 형광체(ZnS:Cu와 ZnS:Mn)를 각각 PDMS에 섞어 두 층으로 쌓았습니다. 발광색은 두 층의 배합과 인가 전압에 따라서도 달라졌습니다.
        look: "같은 배합으로 찍은 사진에서 5 kHz의 흰빛과 10 kHz의 따뜻한 색을 비교해 보세요. 오른쪽의 50 kHz 사진에서는 주황색이 더 뚜렷합니다."
        crop: "100 Hz, 1 kHz, 5 kHz, 10 kHz, 50 kHz에서 촬영한 발광색 사진"
      - id: eon-1
        team: EoN
        file: EoN_1
        reports:
          - file: eon-igzo-tft-report
            label: IGZO TFT 보고서 보기
        title: IGZO 박막 트랜지스터와 포토마스크 설계
        summary: 게이트와 접점을 위쪽에 둔 IGZO 박막 트랜지스터(TFT)와 인버터, 게이트 오정렬 시험 구조, 1 μm급 소자를 KLayout에서 설계했습니다. 25 × 25 mm 포토마스크 한 장에 소자 셀 672개를 배치하고, 설계대로 게이트 위치가 바뀌는지 3D 모델에서 확인했습니다.
        look: "가운데 포토마스크 그림은 소자 유형별로 네 구역으로 나뉩니다. 구역 사이를 가르는 십자 모양을 따라 정렬 표식이 배치돼 있습니다."
        crop: "여러 소자 유형을 네 구역으로 나눈 25 × 25 mm 포토마스크 배치도"
      - id: eon-2
        team: EoN
        file: EoN_2
        reports:
          - file: eon-igzo-tft-report
            label: IGZO TFT 보고서 보기
          - file: eon-igzo-hw-report
            label: 시행착오 보고서 보기
        title: IGZO 박막 트랜지스터 제작 공정
        summary: IGZO 박막 트랜지스터를 만드는 데 쓴 재료와 두께, 노광·증착·식각 과정을 정리했습니다. 시뮬레이션에서는 게이트 전압 5 V, 드레인 전압 1 V에서 게이트를 중앙에 둔 구조의 ON 전류가 14.85 nA로 가장 높았습니다.
        look: "노란 조명 아래에서 포토마스크의 정렬 표식과 유리 위 패턴을 맞춥니다. 원본 하단의 그래프에는 게이트 위치를 달리한 소자에서 측정한 ON 전류가 나옵니다."
        crop: "노란 조명의 공정실에서 마스크를 정렬하는 두 작업 장면"
      - id: eon-promo
        team: EoN
        file: EoN_promo
        title: "EoN 동아리 소개 · 실리콘을 그리고, 로봇을 움직인다"
        keywords: 홍보포스터 학술동아리 Top-Gate IGZO TFT SO-ARM101 SO-101 스터디 세미나
        summary: EoN의 2026년 반도체·로봇 프로젝트와 동아리 활동을 한 장에 담았습니다. 25 mm 마스크에 소자 672개를 배치한 IGZO 박막 트랜지스터 프로젝트와, 시연 데이터로 물체를 옮기는 동작을 학습한 SO-101 로봇 팔을 소개합니다. 전시회 기획·운영과 스터디, 세미나, 견학 기록도 볼 수 있습니다.
        look: "왼쪽은 KLayout에서 설계한 마스크 배치입니다. 오른쪽 위는 프로브로 소자를 측정하는 모습이고, 아래는 기판에 감광액(PR)을 바르는 장면입니다. 원본에서는 바로 아래의 로봇 팔 시연과 학습 과정도 볼 수 있습니다."
        crop: "KLayout 마스크 배치와 프로브 측정, 감광액 도포 장면"
      - id: asnl-2
        team: ASNL
        file: ASNL_2
        title: 물과 셀룰로오스·탄소 복합재로 전기 만들기
        summary: 셀룰로오스 나노섬유에 대나무로 만든 바이오차나 입자 크기가 다른 활성탄을 섞어, 수분으로 전기를 만드는 소자를 제작했습니다. 셀룰로오스는 물과 이온이 이동하도록 돕고, 탄소는 전하를 모읍니다. 시료 간 전압 차이는 작았고, 입자가 가장 고운 활성탄 시료에서 전류가 가장 낮았습니다.
        look: "오른쪽의 두 막대그래프에서 같은 시료의 전압과 전류를 비교해 보세요. 가운데 재료 그림에는 바이오차와 크기별 활성탄 시료가 나와 있습니다."
        crop: "활성탄 입도별 전압과 전류를 비교한 두 막대그래프"
      - id: asnl-1
        team: ASNL
        file: ASNL_1
        papers:
          - title: 'Multifunctional MXene-Based Nanomaterials in Optoelectronics: From Interfacial Engineering to Device'
            doi: 10.3390/mi17080970
        title: MXene 나노소재를 활용한 광전자 소자
        summary: 전기가 잘 통하는 2차원 소재 MXene을 광전자 소자에 활용한 연구를 정리했습니다. 소재의 표면과 접합부를 조절해 전하 이동을 돕고, 산화와 접합부 결함을 줄이는 방법을 살펴봅니다. 응용 사례로 투명전극, 태양전지, 적외선 광검출기, 유연 발광소자가 나옵니다.
        look: "왼쪽의 적외선 광검출기와 오른쪽의 유연 발광소자를 비교해 보세요. 같은 MXene 계열 소재가 빛을 감지하는 소자와 빛을 내는 소자에 쓰인 사례입니다."
        crop: "MXene 광검출기와 유연 발광소자의 응용 사례"
      - id: ngsd-1
        team: NGSD
        file: NGSD_1
        papers:
          - title: Wired 1T-XNOR Logic Gate Using Reconfigurable Silicon Feedback Transistor
            doi: 10.1109/TED.2026.3751618
        title: 차세대반도체소자 연구실
        summary: NGSD는 기존 CMOS 공정과 호환되는 차세대 메모리 소자를 설계하고 제작합니다. TCAD 시뮬레이션으로 소자 구조와 공정 조건을 살피고, CAD로 제작에 쓸 포토마스크를 설계합니다. 만든 소자는 실제로 측정해 동작 특성을 확인합니다.
        look: "오른쪽에서 색으로 표시한 소자 단면은 TCAD 시뮬레이션 화면입니다. 바로 아래 포토마스크 그림에는 소자 패턴을 배치한 모습이 나옵니다."
        crop: "초록색으로 표시한 소자 단면 TCAD 시뮬레이션"
  - id: communications
    title: 통신·실내측위
    intro: 철도역 실내측위에서 시작해 신호가 도착한 시간으로 위치를 추정하는 법을 봅니다. 이어 여러 안테나에서 들어오는 데이터를 나누어 처리하는 방법과, 높은 주파수의 신호를 받는 회로를 살펴봅니다.
    feature:
      alt: 철도역 실내 공간에서 무선 신호로 위치를 추정하는 시나리오 그림
      credit: I2COINS Lab. · 스마트 철도역에서 위치 오차 줄이기
      title: 무선 신호가 늦게 오면 위치를 어떻게 찾을까?
    story:
      title: 도착한 무선 신호에서 어떤 정보를 얻을까?
      works:
        - id: sidl-1
          title: 약한 신호를 키우기
          text: 높은 주파수에서 약하게 들어온 신호를 키울 증폭기를 설계했습니다. 회로 시뮬레이션에서 11–40 GHz 구간의 평균 이득은 18 dB였습니다.
          alt: 저잡음 증폭기의 주파수별 이득과 잡음 지수 등 회로 시뮬레이션 결과
        - id: csp-1
          title: 여러 안테나의 계산을 나누기
          text: 여러 안테나가 받은 신호를 한곳에 모으면 전송량이 커집니다. 각 안테나 그룹 가까이에서 계산한 뒤 어떤 값을 중앙에 보낼지 세 가지 방식으로 비교했습니다.
          alt: 부분 분산, 완전 분산, 데이지 체인에서 현장 처리 장치와 중앙 장치 사이에 오가는 정보를 비교한 도식
        - id: i2coins-2
          title: 신호가 도착한 시간으로 위치 찾기
          text: 신호의 도착 시간을 거리로 바꿀 때 생기는 오차를 보정했습니다. 철도역을 가정한 시뮬레이션에서 평균 위치 오차가 비교 모델의 1.35 m에서 0.62 m로 줄었습니다.
    posters:
      - id: i2coins-2
        team: I2COINS Lab.
        file: I2COINSLAB_2
        title: 스마트 철도역에서 위치 오차 줄이기
        summary: 철도역 실내측위를 가정한 시뮬레이션에서 평균 위치 오차는 비교 모델 DNN1-PF가 1.3537 m, PGRNet이 0.6185 m였습니다. 연구팀은 무선 신호의 도착 시간(ToA)으로 거리를 잴 때 생기는 오차를 딥러닝으로 보정했습니다. 함께 소개한 다른 연구에서는 잡음 수준에 따라 가장 정확한 추정기 조합이 달라졌습니다.
        look: "표 맨 오른쪽 평균 열에서 두 모델을 비교해 보세요. 잡음 분산을 바꾼 다섯 조건에서 모두 PGRNet의 평균 위치 오차가 더 작았습니다."
        crop: "가우시안 거리 잡음 수준별 평균 위치 오차의 비교 그래프와 표"
      - id: i2coins-1
        team: I2COINS Lab.
        file: I2COINSLAB_1
        title: 지능 통신 및 지능 정보 시스템 연구실
        summary: I2COINS Lab.은 무선 채널의 상태를 추정·예측하고, 단말이 기지국으로 보내는 채널 상태 정보(CSI)를 압축하고 복원하는 기술을 연구합니다. 신호의 도착 시간과 도착 시간 차이로 위치를 추정하는 방법, 3GPP 국제표준과 관련 특허 연구도 소개합니다.
        look: "왼쪽 그림은 CSI를 압축해 보내는 과정을 보여 줍니다. 오른쪽에서는 여러 기준국에서 얻은 측정값으로 위치를 계산하는 방법을 볼 수 있습니다."
        crop: "기준국과 단말 사이의 거리 측정과 칼만 필터 예측·보정을 그린 도식"
      - id: csp-1
        team: CSP Lab.
        file: CSP_1
        papers:
          - title: Decentralized Equalization With Feedforward Architectures for Massive MU-MIMO
            doi: 10.1109/TSP.2019.2928947
        title: Massive MIMO 수신기의 분산 기저대역 처리
        summary: 대규모 다중 안테나(Massive MIMO) 수신기에서는 안테나 그룹과 중앙 장치를 잇는 프론트홀에 데이터가 몰릴 수 있습니다. 전송량을 줄이기 위해 안테나 그룹마다 현장 처리 장치(LU)를 두고 일부 계산을 맡깁니다. 포스터는 계산 중간값을 보내는 부분 분산, 검출 결과와 신뢰도를 보내는 완전 분산, 장치를 잇고 결과를 차례로 갱신하는 데이지 체인을 비교합니다.
        look: "데이지 체인에서는 계산 결과가 장치 사이를 한 방향으로 이동하며 갱신됩니다. 원본에서는 각 장치가 중앙 장치로 직접 보내는 두 방식과 비교합니다."
        crop: "현장 처리 장치를 차례로 연결한 데이지 체인 구성도"
      - id: csp-2
        team: CSP Lab.
        file: CSP_1
        page: 2
        title: 프론트홀 전송량을 줄이는 분산 MIMO 검출
        summary: 검출 성능을 유지하면서 프론트홀 전송량을 줄이는 방법을 살펴봤습니다. 부분 분산에서는 QR 분해로 얻은 삼각 행렬을 보내고, 완전 분산에서는 검출값을 더 적은 비트로 표현해 보냅니다. Schur 근사로 신뢰도를 구해 현장 장치나 사용자별로 보낼 결과를 고르는 방법도 제안합니다.
        look: "왼쪽 아래 완전 분산 도식에서 내부 계산은 64비트로 유지하고, 중앙 장치에는 검출값 4비트와 신뢰도 2비트를 보냅니다. 아래 비트 오류율(BER) 그래프에서 내부 계산도 4비트로 줄였을 때와 전송값만 줄였을 때를 비교해 보세요."
        crop: "분산 검출 방식에 따른 비트 오류율 비교 그래프"
      - id: sidl-1
        team: SIDL
        file: SIDL_1
        title: 10–40 GHz 광대역 저잡음 증폭기
        summary: 10–40 GHz 대역용 저잡음 증폭기(LNA)를 28 nm SOI CMOS 공정으로 설계했습니다. 증폭기 시뮬레이션에서 11–40 GHz 구간의 평균 이득은 18 dB였습니다.
        look: "오른쪽 위 측정 그래프에서 전송선 구조 CPW·FCPW·GCPW의 특성을 비교해 보세요. 오른쪽 아래 그래프는 증폭기의 주파수별 이득과 잡음 지수를 시뮬레이션한 결과입니다."
        crop: "전송선 구조 CPW·FCPW·GCPW의 주파수별 MAG/MSG 측정 비교"
      - id: sidl-2
        team: SIDL
        file: SIDL_2
        title: SOI CMOS 광대역 하향변환기
        summary: 높은 무선 주파수(RF)를 낮은 중간 주파수(IF)로 바꾸는 SOI CMOS 하향변환기를 설계했습니다. RF 입력을 40 GHz로 설정한 시뮬레이션에서 10 × 10 μm 게이트-소스 커패시터를 쓰자 2 GHz IF 출력이 −9.2 dBm에서 −6.13 dBm으로 높아졌습니다.
        look: "오른쪽 위 시뮬레이션 표의 40 GHz 행에서 ‘No cap’과 ‘10 × 10 μm’ 열을 비교해 보세요. 아래 실측 그래프에는 커패시터가 있을 때와 없을 때의 변환 이득이 나와 있습니다."
        crop: "입력 주파수와 커패시터 크기에 따른 2 GHz 출력 전력 시뮬레이션 표"
      - id: sidl-fpga
        team: SIDL
        file: reports/sidl-fpga-board-report
        title: FPGA 개발 보드 설계 보고서
        image_alt: SIDL FPGA Board V1 보고서 첫 페이지
        image_height: 849
        summary: SIDL은 혼합 신호 회로를 설계하고 시험할 수 있도록 Kintex-7 FPGA와 STM32H745 마이크로컨트롤러를 한 보드에 배치했습니다. 보고서에는 부품 배치, 전원 구성, DisplayPort와 USB 3.0 연결, 전체 회로도가 담겨 있습니다.
        look: "초록색 보드 윗면 배치도에서 가운데 오른쪽의 FPGA 자리(XC7K160T)와 그 왼쪽의 마이크로컨트롤러 자리(STM32H745)를 찾아보세요. 금색 점은 칩을 보드에 연결하는 접점입니다."
        crop: "SIDL FPGA 개발 보드 윗면에 칩과 커넥터 위치를 표시한 배치도"
---

직접 만든 자율주행차, 전기 신호로 색을 바꾸는 소자, 실내에서 위치를 찾는 무선 기술을 만나 보세요.
