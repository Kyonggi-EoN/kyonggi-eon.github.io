---
title: 홈페이지에 글 올리는 법
author: EoN 운영진
category: guide
tags: [홈페이지, GitHub]
summary: 블로그 글, 소식, 프로젝트 카드를 Markdown 파일 하나로 올리는 방법을 정리했습니다.
---

홈페이지의 콘텐츠는 모두 저장소의 `content/` 폴더에 있습니다.
HTML이나 CSS를 몰라도, 알맞은 폴더에 Markdown 파일을 하나 추가하면 목록·카드·상세 페이지가 자동으로 만들어집니다.

## 어디에 무엇을 넣나

| 올릴 것 | 폴더 | 파일 이름 |
|---|---|---|
| 블로그 글 | `content/_posts/2026/` | `2026-11-20-제목.md` |
| 소식 (공지·행사·수상) | `content/_news/2026/` | `2026-11-20-제목.md` |
| 프로젝트 카드 | `content/_projects/` | `프로젝트-이름.md` |
| 이미지 | `content/images/<종류>/` | 자유 |
| 메뉴·연혁·멤버·활동 분야 | `content/_data/*.yml` | 기존 파일 수정 |

파일 이름의 영문 부분이 주소가 됩니다. 예를 들어 `2026-11-20-yolo-seminar.md`는 `/blog/2026/yolo-seminar/`가 됩니다.

블로그 글과 소식은 연도 폴더(`2026/`, `2027/` …)에 나눠 둡니다. 찾기 쉽게 나눈 것일 뿐이라 주소에는 영향이 없고, 날짜는 파일 이름에서 읽습니다.
그해 첫 글이라 폴더가 없으면 새로 만드세요. GitHub 웹에서는 파일 이름 칸에 `2027/`을 먼저 입력하면 폴더가 생깁니다.

## 1. 템플릿 복사

저장소 루트의 `_templates/` 폴더에 글 종류별 템플릿이 있습니다.

```bash
cp _templates/post.md content/_posts/2026/2026-11-20-yolo-seminar.md
```

## 2. 머리말 채우기

파일 맨 위 `---` 사이가 머리말(front matter)입니다. 제목과 분류를 채우고, 그 아래에 본문을 Markdown으로 씁니다.

```yaml
---
title: YOLO 세미나 정리
author: 홍길동
category: seminar   # content/_data/labels.yml에 있는 코드값
tags: [Computer Vision]
summary: 목록 카드에 보일 한두 문장
---
```

## 3. 이미지 넣기

이미지는 `content/images/posts/` 같은 폴더에 넣고, 본문에서는 `/content/`로 시작하는 주소로 부릅니다.

```markdown
![실험 결과](/content/images/posts/yolo-result.png)
```

## 4. 올리기

GitHub 웹에서 **Add file → Create new file**로 바로 만들어도 되고, 브랜치를 따서 Pull Request를 보내도 됩니다.
`main` 브랜치에 합쳐지면 1~2분 뒤 사이트에 반영됩니다. Pull Request를 보내면 사이트가 문제없이 빌드되는지 자동으로 검사합니다.
