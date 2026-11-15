---
# 홈 화면. 본문 없이 sections 목록만으로 구성합니다.
# 섹션 순서를 바꾸거나 빼려면 아래 목록만 고치세요.
# 쓸 수 있는 섹션: hero, interests, projects, news, posts, history, members, contact
permalink: /
hero:
  eyebrow: Kyonggi Univ. · Electronic Engineering
  title: 꿈을 찾다,<br>아이디어를 현실로 만들다
  lead: 경기대학교 전자공학과 학술 동아리 EoN입니다. 전공 H/W 지식과 동아리 S/W 지식을 융합해 새로운 가치를 탐구합니다.
  caption: KYONGGI UNIVERSITY · DEPT. OF ELECTRONIC ENGINEERING · SINCE 2005
  actions:
    - label: 프로젝트 보기
      url: /projects/
    - label: 동아리 소개
      url: /about/
sections:
  - hero
  - type: interests
    eyebrow: What we do
    title: 하드웨어와 소프트웨어의 경계를 허뭅니다
  - type: projects
    featured: true
    limit: 3
    title: 주요 프로젝트
    more_url: /projects/
  - type: news
    limit: 5
    more_url: /news/
  - type: posts
    limit: 3
    more_url: /blog/
---
