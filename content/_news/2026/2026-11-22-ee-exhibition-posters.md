---
layout: exhibition
title: 2026 전자공학부 성과전시회 온라인 전시
date: 2026-11-22
category: event
description: 전시장에 오기 어려운 분을 위해 경기대학교 전자공학부 동아리와 연구실의 포스터 20장을 한곳에 모았습니다. 주제별 요약을 읽고 PDF 원본을 열어 보세요.
image: /content/images/news/2026-exhibition-poster.jpg
event_url: /news/2026/ee-exhibition/
demos_url: /news/2026/ee-exhibition-posters/demos/
hero:
  heading: 2026 전자공학부<br>성과전시회
organizations:
  - name: EoN
    logo: /assets/ui/logo.svg
    poster: eon-1
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
    intro: 네 발 로봇 Go2는 갈 길을 고르는 일과 다리를 움직이는 일을 나눠서 처리합니다. 로봇 팔에 큐브를 옮기라고 말하는 실험부터 직접 만든 자동차로 실도로를 달린 이야기까지, 기계가 움직이기까지 필요한 판단을 따라가 봅니다.
    feature:
      alt: 실내 바닥을 걷는 네 발 로봇 Go2
      credit: RV Lab. · 길을 찾고, 시약을 붓는 로봇
      title: 로봇은 스스로 길을 어떻게 찾을까?
    posters:
      - id: road-1
        team: "RO:AD"
        file: ROAD_1
        title: 자연어 명령을 따르는 로봇 팔
        summary: 사람이 조작한 동작을 SO-ARM101에 학습시키고, 명령에 따라 큐브를 원·세모·네모 위치에 놓을 수 있는지 실물 로봇으로 평가했습니다. 어떤 동작에서 실패가 잦았는지도 볼 수 있습니다.
        look: "아래쪽 실물 로봇 평가 표에서 같은 큐브 옮기기 과제를 두 모델이 도형별로 얼마나 성공했는지 비교해 보세요."
        crop: "원·세모·네모별 실물 로봇 성공 횟수를 비교한 표"
      - id: eon-robot-1
        team: EoN
        file: EoN_robot_1
        title: 스마트폰으로 원격 조작하는 SO-101 로봇 팔
        summary: 스마트폰을 돌리거나 기울이면 시뮬레이션 속 SO-101 로봇 팔이 따라 움직입니다. 스마트폰의 위치와 방향을 5자유도 로봇 팔이 구현할 수 있는 움직임으로 바꾸고, 작업 범위와 속도를 제한하는 기능을 검증했습니다.
        look: "오른쪽의 네 로봇 자세를 나란히 보면 스마트폰을 돌리거나 숙이거나 기울일 때 로봇 팔의 어느 부분이 움직이는지 알 수 있습니다."
        crop: "휴대전화 기본 자세와 세 방향 회전에 대응하는 SO-101 자세 그림"
      - id: rvlab-2
        team: RV Lab.
        file: RVLab_2
        title: 길을 찾고, 시약을 붓는 로봇
        summary: 네 발 로봇 Go2가 길을 고르고 장애물을 피하는 연구와, 휴머노이드 G1이 언어 지시에 따라 병을 집어 시약을 붓는 동작을 배우는 과정을 소개합니다.
        look: "왼쪽의 5 Hz와 50 Hz를 비교해 보세요. Go2는 갈 방향을 정하는 일보다 다리 관절을 제어하는 일을 더 자주 반복합니다."
      - id: krowd-1
        team: KROWD
        file: KROWD_1
        title: K-City 실도로를 달린 자작 자율주행차
        summary: 카메라와 라이다로 차선, 신호등, 장애물을 인식하고 위치를 추정한 뒤, 경로 계산부터 조향·제동까지 이어지는 차량 제어 과정을 보여 줍니다.
        look: "위쪽의 시스템 구성에서 카메라·라이다가 본 정보가 경로 판단을 거쳐 조향과 제동으로 이어지는 순서를 따라가 보세요."
      - id: krowd-2
        team: KROWD
        file: KROWD_2
        title: P.B.Mebastion-26
        summary: 2026 대학생 AI·SW 모빌리티 경진대회에 출전한 114번 차량의 모습과 모터, 배터리, ROS 2 자율주행 시스템 등 주요 제원을 담았습니다.
        look: "차량 번호 114를 찾아보세요. 옆 포스터의 실도로 사진에서도 같은 번호가 달린 차를 볼 수 있습니다."
      - id: eei-1
        team: EEI
        file: EEI_1
        title: MuseMAP · 재난 현장 구조 지원
        summary: GPS가 닿기 어려운 실내에서 UWB로 위치를 추정하고, 드론과 센서가 모은 정보를 현장 3D 모델과 AR 화면에 연결하는 구조 지원 플랫폼입니다.
        look: "오른쪽의 최종 수행 결과에서 드론과 3D 건물 모형, AR 화면을 차례로 보면 현장 정보가 구조대원에게 전달되는 모습을 그려 볼 수 있습니다."
      - id: road-2
        team: "RO:AD"
        file: ROAD_2
        title: 로봇·자율주행 동아리 RO:AD
        summary: 기초 스터디에서 자율주행, 로봇 팔, 드론 프로젝트로 이어지는 활동과 정기 세미나, 대회 참가 기록을 소개합니다.
        look: "아래쪽의 활동 사진을 보면 스터디, 세미나, 로드인의 밤이 각각 어떤 자리인지 한눈에 볼 수 있습니다."
      - id: rvlab-1
        team: RV Lab.
        file: RVLab_1
        title: 로보틱스·비전 연구실
        summary: 휴머노이드의 보행과 전신 제어부터 카메라·라이다·레이더를 활용한 자율주행 위치 추정과 주변 인식까지, 연구실의 주요 과제와 성과를 소개합니다.
        look: "휴머노이드 연구와 자율주행 인지 연구를 나란히 보세요. 한쪽은 몸의 균형과 움직임을, 다른 쪽은 주변을 보고 위치를 파악하는 일을 다룹니다."
  - id: semiconductors
    title: 반도체·소재
    intro: 유리 위에 재료를 얇게 입히고, 빛을 써서 회로 무늬를 옮기면 트랜지스터의 형태가 드러납니다. 소자를 만드는 과정부터 재료의 배합과 회로 구조를 바꿔 빛과 전기 신호를 다루는 연구까지 볼 수 있습니다.
    feature:
      alt: 노란 조명 아래 박막을 입히는 RF 스퍼터링 장비 내부
      credit: EoN · IGZO 박막 트랜지스터 제작 공정
      title: 유리 위에 트랜지스터는 어떻게 만들까?
    posters:
      - id: eon-1
        team: EoN
        file: EoN_1
        title: IGZO 박막 트랜지스터와 포토마스크 설계
        summary: 산화물 반도체 IGZO를 쓰는 박막 트랜지스터, 인버터, 1 μm급 소자 등의 패턴을 KLayout으로 설계하고, 25 × 25 mm 포토마스크 한 장에 배치했습니다.
        look: "포토마스크 레이아웃의 25 × 25 mm 배치를 보면 서로 다른 소자 패턴이 작은 판 한 장에 어떻게 배열됐는지 알 수 있습니다."
      - id: eon-2
        team: EoN
        file: EoN_2
        title: IGZO 박막 트랜지스터 제작 공정
        summary: 앞 포스터의 설계가 소자로 만들어지는 과정을 따라갑니다. 재료와 두께를 고른 이유, 노광·증착 과정에서 겪은 문제와 대응, 게이트 위치에 따른 시뮬레이션을 담았습니다.
        look: "공정 중 문제와 대응 칸에서 식각 전후의 정렬 표식 사진을 비교해 보세요. 설계한 무늬가 공정 결과에 어떻게 남았는지 보여 줍니다."
      - id: ngsd-1
        team: NGSD
        file: NGSD_1
        title: 차세대반도체소자 연구실
        summary: 반도체 소자를 설계하고 제작·측정하는 과정과 TCAD 시뮬레이션, 포토마스크 제작, HBM·DRAM 등 차세대 메모리 연구를 소개합니다.
        look: "오른쪽 활동란에서 TCAD 화면과 포토마스크 사진을 찾아보세요. 컴퓨터에서 소자를 검토하는 단계와 실제 제작에 쓰이는 무늬를 비교할 수 있습니다."
      - id: asnl-1
        team: ASNL
        file: ASNL_1
        title: MXene 나노소재를 활용한 광전자 소자
        summary: 전기가 잘 통하는 2차원 소재 MXene의 표면과 접합부를 조절해 전하 이동을 개선하는 방법을 살펴보고, 태양전지·광검출기·발광소자 응용 사례를 정리했습니다.
        look: "왼쪽 아래 응용 사례에서 같은 MXene 계열 소재가 태양전지, 광검출기, 발광소자에서 맡는 역할을 비교해 보세요."
      - id: asnl-2
        team: ASNL
        file: ASNL_2
        title: 물과 셀룰로오스·탄소 복합재로 전기 만들기
        summary: 셀룰로오스 나노섬유에 탄소를 섞어 수분과 재료가 만날 때 전기가 생기는 소자를 만들고, 탄소 재료의 종류와 입자 크기에 따른 전압과 전류를 비교했습니다.
        look: "오른쪽 막대그래프 두 개를 나란히 보면 탄소를 바꿨을 때 전압과 전류가 어떻게 달라지는지 비교할 수 있습니다."
      - id: asnl-3
        team: ASNL
        file: ASNL_3
        title: 전압과 주파수로 색을 바꾸는 발광소자
        summary: 서로 다른 색을 내는 황화아연 복합재 두 층을 쌓고, 교류 전압과 주파수, 형광체 배합을 바꿨을 때 발광색이 어떻게 달라지는지 측정했습니다.
        look: "오른쪽 아래 발광 사진을 왼쪽부터 보세요. 교류 주파수가 달라지면서 빛이 푸른색에서 따뜻한 색 쪽으로 변합니다."
        crop: "교류 주파수에 따라 발광색이 달라지는 소자 사진 다섯 장"
  - id: communications
    title: 통신·실내측위
    intro: 무선 신호가 도착하는 시간으로 거리를 잴 수 있지만, 신호가 장애물에 가로막히면 실제보다 멀게 계산될 수 있습니다. 이 오차를 줄이는 방법과, 수많은 안테나에서 들어오는 데이터를 효율적으로 처리하는 방법을 살펴봅니다.
    feature:
      alt: 철도역 실내 공간에서 무선 신호로 위치를 추정하는 시나리오 그림
      credit: I2COINS Lab. · 스마트 철도역에서 위치 오차 줄이기
      title: 무선 신호가 늦게 오면 위치를 어떻게 찾을까?
    posters:
      - id: sidl-1
        team: SIDL
        file: SIDL_1
        title: 10–40 GHz 광대역 저잡음 증폭기
        summary: 약한 수신 신호를 잡음을 적게 더하면서 넓은 주파수 대역에서 증폭할 수 있도록 28 nm SOI CMOS 회로를 설계했습니다. 칩 배치와 측정 결과를 함께 볼 수 있습니다.
        look: "오른쪽 위 그래프의 세 곡선은 서로 다른 전송선 구조에서 나온 결과입니다. 높은 주파수에서 곡선의 차이가 어떻게 달라지는지 보세요."
        crop: "전송선 구조 세 가지의 주파수별 측정값을 비교한 그래프"
      - id: sidl-2
        team: SIDL
        file: SIDL_2
        title: SOI CMOS 광대역 하향변환기
        summary: 높은 주파수의 수신 신호를 처리하기 쉬운 낮은 주파수로 바꾸는 회로를 설계하고, 커패시터가 변환 이득과 회로 내부 신호 간 간섭에 미치는 영향을 비교했습니다.
        look: "오른쪽의 표에서 커패시터 크기별 변환 성능을 비교해 보세요. 같은 회로에서도 크기를 바꾸면 주파수별 결과가 달라집니다."
      - id: csp-1
        team: CSP Lab.
        file: CSP_1
        title: Massive MIMO 수신기의 분산 기저대역 처리
        summary: 많은 안테나가 받은 데이터를 중앙 장치에 한꺼번에 보내면 통신량이 몰립니다. 안테나를 묶어 현장에서 일부 계산을 맡기는 세 가지 분산 구조를 비교했습니다.
        look: "아래쪽 분산 구조 그림 세 개를 비교해 보세요. 안테나를 묶은 장치가 무엇을 계산하고 중앙 장치에 무엇을 보내는지가 달라집니다."
      - id: csp-2
        team: CSP Lab.
        file: CSP_1
        page: 2
        title: 프론트홀 전송량을 줄이는 분산 MIMO 검출
        summary: 안테나 쪽 장치가 보내는 데이터의 비트 수를 줄이고, 신뢰도가 높은 정보만 골라 보내는 방법을 검토했습니다. 전송량을 줄일 때 신호 검출 성능이 어떻게 달라지는지 확인할 수 있습니다.
        look: "왼쪽 아래 그림에서 현장 장치 안의 계산과 중앙 장치로 보내는 값을 구분해 보세요. 보내는 값의 비트 수를 줄인 뒤에도 수신 오류율을 비교했습니다."
      - id: i2coins-1
        team: I2COINS Lab.
        file: I2COINSLAB_1
        title: 지능 통신 및 지능 정보 시스템 연구실
        summary: 무선 채널 상태를 추정하고 전송에 필요한 정보를 압축하는 기술, 신호 측정값으로 위치를 찾는 방법, 3GPP 통신 표준과 특허 연구를 소개합니다.
        look: "가운데 오른쪽에서 도착 시간과 도착 시간 차이를 쓰는 위치 추정 그림을 비교해 보세요. 같은 무선 신호에서도 거리의 단서가 달라집니다."
      - id: i2coins-2
        team: I2COINS Lab.
        file: I2COINSLAB_2
        title: 스마트 철도역에서 위치 오차 줄이기
        summary: 철도역 실내에서 장애물 때문에 무선 신호가 늦게 도착하면 거리 추정에 오차가 생깁니다. 기존 위치 추정 모델에 딥러닝 오차 보정을 결합한 두 가지 방법을 비교했습니다.
        look: "아래쪽 실험 그래프에서 잡음이 커질수록 위치 오차가 어떻게 바뀌는지 보세요. 기존 추정 방식에 딥러닝 보정을 더한 결과도 함께 나옵니다."
---

전시장에 오기 어려운 분을 위해 포스터 20장을 모았습니다. 주제별로 전시를 둘러보거나, 그래프에서 단체를 골라 포스터로 바로 이동할 수 있습니다.
