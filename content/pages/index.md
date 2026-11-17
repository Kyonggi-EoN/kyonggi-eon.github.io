---
# 홈 화면. 본문 없이 sections 목록만으로 구성합니다.
# 섹션 순서를 바꾸거나 빼려면 아래 목록만 고치세요.
# 쓸 수 있는 섹션: hero, interests, projects, news, posts, history, members, contact
permalink: /
hero:
  kicker: 경기대학교 전자공학과 학술 동아리
  # title: 없으면 사이트 이름(EoN), lead: 없으면 _config.yml의 tagline
  # since: true면 제목 오른쪽에 'Since 2005'(연도는 _config.yml의 org.since). 빼려면 이 줄을 지우세요.
  since: true
  # 왼쪽 사진. 위에서부터 차례로 interval초마다 바뀌고, 첫 사진이 맨 처음 보입니다.
  #   한 사람만 크게 나온 사진은 넣지 않습니다(여럿이 함께 나온 활동 사진만).
  #   caption: 사진 아래 한 줄, url: 캡션을 누르면 갈 곳(보통 그 사진의 소식 글)
  #   position: 화면이 좁아 사진이 잘릴 때 남길 곳(가로% 세로%, 기본 50% 50%).
  #             홈 PC 화면의 사진 칸은 세로로 길어서 가로 사진은 가운데 40%쯤만 보입니다.
  interval: 6
  photos:
    - src: /content/images/news/2026-exhibition-poster.jpg
      alt: 2026 전자공학부 AI·반도체·시스템 반도체 성과전시회 포스터. 11.24(화)~11.25(수) 12:00~18:00, 경기대학교 제2공학관 1층 로비
      caption: 2026 전자공학부 성과전시회 · 2026.11.24 ~ 11.25
      url: /news/2026/ee-exhibition/
      position: 50% 0%
    - src: /content/images/home/hero-cleanroom.jpg
      alt: 클린룸의 Mask Aligner 앞에서 작업하는 부원들
      caption: hw_2026 공정 실습 · 경기대학교 6강의동 지하 연구실
      url: /news/2026/process-practice/
      position: 50% 40%
    - src: /content/images/news/2026-semicon-korea.jpg
      alt: SEMICON Korea 2026 전시장 입구 앞에 선 부원들
      caption: SEMICON Korea 2026 견학 · 2026.02.11
      url: /news/2026/semicon-korea/
    - src: /content/images/news/2026-cherry-blossom-1.jpg
      alt: 벚나무 아래에 모여 사진을 찍은 부원들
      caption: 벚꽃 피크닉 · 2026.04.08
      url: /news/2026/cherry-blossom-picnic/
    - src: /content/images/news/2026-process-practice-1.jpg
      alt: 노란 조명 아래에서 현미경이 달린 공정 장비를 다루는 부원
      caption: hw_2026 공정 실습 · 2026.08.27
      url: /news/2026/process-practice/
      position: 20% 50%
    - src: /content/images/news/2026-ai-summit.jpg
      alt: AI SUMMIT SEOUL & EXPO 2026 행사장 입구에 선 부원들
      caption: AI SUMMIT SEOUL & EXPO 2026 견학 · 2026.08.20
      url: /news/2026/ai-summit/
    - src: /content/images/news/2026-sow-seminar-2.jpg
      alt: 반도체 아이디어 공모전 세미나에서 SoW 아이디어를 발표하는 팀
      caption: 2026 교내 반도체 아이디어 공모전 세미나 · 2026.11.04
      url: /news/2026/sow-seminar/
      position: 30% 50%
    - src: /content/images/news/2026-graduation-2.jpg
      alt: 졸업 가운을 입은 부원들이 학사모를 던지는 모습
      caption: 학위수여식 · 2026.02.20
      url: /news/2026/graduation/
  # 오른쪽 칸 글자 뒤의 바람 줄기(Matching Gradient 색). 마우스를
  #   prey: 먹잇감으로 보고 쫓아옴, obstacle: 장애물로 보고 비켜 감. 끄려면 false
  wind: prey
  link:
    note: 11.24(화) ~ 25(수) · 제2공학관 1층 로비
    label: 2026 전자공학부 성과전시회
    url: /news/2026/ee-exhibition/
sections:
  - hero
  - type: news
    limit: 5
    more_url: /news/
  - type: projects
    featured: true
    limit: 3
    title: 주요 프로젝트
    more_url: /projects/
  - type: interests
    title: 활동 분야
  - type: posts
    limit: 3
    more_url: /blog/
---
