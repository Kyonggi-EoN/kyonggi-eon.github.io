# kyonggi-eon.github.io

경기대학교 전자공학과 학술 동아리 **EoN** 홈페이지 → <https://kyonggi-eon.github.io>

Jekyll로 만든 정적 사이트입니다. `main`에 push하면 GitHub Actions가 빌드해서 GitHub Pages에 배포합니다.

## 원칙: 콘텐츠와 레이아웃을 섞지 않는다

| 바꾸고 싶은 것 | 고칠 곳 | HTML/CSS 지식 |
|---|---|---|
| 블로그 글 · 소식 · 프로젝트 카드 | `content/_posts/`, `content/_news/`, `content/_projects/`에 `.md` 추가 | 필요 없음 |
| 메뉴 · 연혁 · 활동 분야 · 멤버 · 연락처 | `content/_data/*.yml` | 필요 없음 |
| 페이지 소개 문구, 섹션 순서 | `content/pages/*.md`의 머리말 `sections:` | 필요 없음 |
| 색 · 글꼴 · 간격 등 전체 톤 | `_sass/_tokens.scss` 한 파일 | CSS 변수 |
| 카드 · 목록 생김새 | `_includes/cards/`, `_includes/sections/`, `_sass/components/` | HTML/CSS |
| 사이트 동작(JS) | `assets/js/modules/`에 파일 추가 → `assets/js/main.js`에서 불러오기 | JS |

글 올리는 법은 사이트의 [홈페이지에 글 올리는 법](https://kyonggi-eon.github.io/blog/2026/how-to-publish/)에 자세히 적어 두었습니다. 글 종류별 템플릿은 `_templates/`에 있습니다.

## 폴더 구조

```
.
├── content/                 ← 콘텐츠는 전부 여기
│   ├── _posts/              블로그 글     YYYY-MM-DD-slug.md → /blog/YYYY/slug/
│   ├── _news/               소식          YYYY-MM-DD-slug.md → /news/YYYY/slug/
│   ├── _projects/           프로젝트 카드  slug.md            → /projects/slug/
│   ├── _data/               목록형 데이터 (navigation, interests, history, members, social, labels)
│   ├── pages/               독립 페이지 (홈, 소개, 목록 페이지, 404)
│   └── images/              글·카드에 쓰는 이미지 (posts/, news/, projects/, members/)
│
├── _layouts/                페이지 틀: default → page / post / project
├── _includes/
│   ├── sections/            페이지에 끼우는 섹션 (hero, projects, news, posts, history …)
│   ├── cards/               카드 한 장 (project, post, news, member)
│   └── head, header, footer, icon, link-url, section-head
├── _sass/
│   ├── _tokens.scss         디자인 토큰 (색·글꼴·간격 CSS 변수)
│   ├── _reset.scss, _base.scss, _layout.scss
│   └── components/          버튼, 배지, 카드, 히어로, 목록, 글 본문, 코드 강조
├── assets/
│   ├── css/main.scss        _sass를 묶는 진입점 (직접 고칠 일 없음)
│   ├── js/main.js           JS 진입점 + modules/
│   ├── js/eon-bar.js        다른 리포 사이트용 공통 상단 바
│   └── images/              로고·파비콘·SNS 미리보기 이미지
├── api/site.json            메뉴·프로젝트 목록 JSON (/api/site.json)
├── _templates/              새 글 템플릿 (빌드에 포함되지 않음)
└── _config.yml              사이트 설정
```

### 페이지는 섹션을 쌓아서 만든다

`content/pages/*.md`의 머리말에 섹션 이름을 적은 순서대로 화면이 구성됩니다.

```yaml
sections:
  - hero                      # 이름만 적으면 기본 설정
  - type: projects            # 옵션이 필요하면 type과 함께
    featured: true            # featured: true인 프로젝트만
    limit: 3
    more_url: /projects/
  - type: posts
    category: seminar         # 세미나 글만 모아 보기
```

쓸 수 있는 섹션: `hero`, `interests`, `projects`, `news`, `posts`, `history`, `members`, `contact`
(공통 옵션: `title`, `eyebrow`, `heading: false`)

새 페이지가 필요하면 `content/pages/`에 `.md` 파일을 만들고 `permalink`만 정해 주면 됩니다. 새 섹션 종류가 필요하면 `_includes/sections/<이름>.html`을 추가합니다.

## 다른 리포의 사이트와 연결하기

조직의 다른 리포가 GitHub Pages를 켜면 `https://kyonggi-eon.github.io/<리포>/`에 열립니다. 메인 사이트와 서로 오가게 하려면 두 가지를 합니다.

**1. 메인 → 프로젝트 사이트**: `content/_projects/`의 카드에 `site:`를 적습니다. 카드와 상세 페이지에 '사이트' 버튼이 생깁니다.

```yaml
repo: Kyonggi-EoN/hw_2026
site: /hw_2026/
```

**2. 프로젝트 사이트 → 메인**: 그 리포의 HTML `<head>`에 한 줄을 넣으면 페이지 맨 위에 EoN 상단 바가 붙습니다.

```html
<script src="https://kyonggi-eon.github.io/assets/js/eon-bar.js" defer></script>
```

상단 바는 메인 사이트의 `/api/site.json`에서 메뉴와 프로젝트 사이트 목록을 읽어 옵니다. 메인 사이트에 프로젝트를 추가하면, 이미 바를 붙여 둔 모든 프로젝트 사이트의 '프로젝트 사이트' 메뉴에도 바로 나타납니다. 바는 Shadow DOM 안에 그려지기 때문에 원래 사이트의 디자인과 서로 간섭하지 않습니다.

## 로컬에서 미리 보기

**Ruby가 있으면** (Ruby 3.3 권장)

```bash
bundle install
bundle exec jekyll serve --livereload
# → http://localhost:4000
```

**Docker만 있으면**

```bash
docker run --rm -it -p 4000:4000 -v "$PWD":/srv -w /srv ruby:3.3 \
  bash -c "bundle install && bundle exec jekyll serve --host 0.0.0.0 --livereload"
```

`_config.yml`을 고쳤을 때는 서버를 다시 켜야 반영됩니다.

## 배포

- `main`에 push → `.github/workflows/pages.yml`이 빌드 후 배포 (1~2분)
- Pull Request → 빌드만 검사하고 배포하지 않음. 머리말 오타처럼 빌드를 깨는 실수를 머지 전에 잡습니다.
