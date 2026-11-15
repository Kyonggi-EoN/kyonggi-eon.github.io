/*
 * EoN 공통 상단 바
 * 조직의 다른 리포가 GitHub Pages(https://kyonggi-eon.github.io/<리포>/)로 사이트를 열 때,
 * 아래 한 줄을 그 사이트 HTML의 <head>나 <body> 끝에 넣으면 페이지 맨 위에 EoN 바가 붙습니다.
 *
 *   <script src="https://kyonggi-eon.github.io/assets/js/eon-bar.js" defer></script>
 *
 * 메뉴와 프로젝트 목록은 메인 사이트의 /api/site.json에서 읽습니다.
 * 그래서 메인 사이트의 content/_data/navigation.yml이나 content/_projects/를 고치면
 * 모든 프로젝트 사이트의 바가 다시 배포하지 않아도 함께 바뀝니다.
 * 바는 Shadow DOM 안에 그려서 원래 사이트의 CSS와 서로 간섭하지 않습니다.
 */
(() => {
  const script = document.currentScript;
  if (!script || document.getElementById("eon-bar")) return;
  const base = new URL("../../", script.src).href; // assets/js/의 두 단계 위 = 메인 사이트 루트

  const css = `
    :host { all: initial; display: block; position: relative; z-index: 2147483000; }
    * { box-sizing: border-box; }
    .bar { display: flex; align-items: center; gap: 14px; height: 44px; padding: 0 16px;
      background: #111114; color: #e9e9ee; border-bottom: 2px solid #dc0000;
      font: 500 14px/1 system-ui, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; }
    a { color: inherit; text-decoration: none; }
    a:hover, summary:hover { color: #fff; }
    .brand { display: flex; align-items: center; gap: 8px; font-weight: 800; letter-spacing: .02em; }
    .brand img { width: 24px; height: 24px; }
    .here { color: #a0a0ab; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
    .here:empty { display: none; }
    .links { display: flex; gap: 14px; margin-left: auto; }
    .links a { color: #b9b9c3; }
    details { position: relative; }
    summary { list-style: none; cursor: pointer; color: #b9b9c3; }
    summary::-webkit-details-marker { display: none; }
    summary::after { content: " ▾"; font-size: 11px; }
    ul { position: absolute; right: 0; top: calc(100% + 12px); min-width: 240px; margin: 0; padding: 6px;
      list-style: none; background: #18181c; border: 1px solid #2c2c33; border-radius: 10px;
      box-shadow: 0 12px 32px rgb(0 0 0 / .4); }
    li a { display: block; padding: 9px 10px; border-radius: 6px; line-height: 1.3; }
    li a:hover, li a[aria-current] { background: #24242a; }
    li a[aria-current] { color: #ff5a5a; }
    @media (max-width: 560px) { .links { display: none; } }
  `;

  const el = (tag, props = {}, children = []) => {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...children);
    return node;
  };

  const mount = () => {
    const host = el("div", { id: "eon-bar" });
    const root = host.attachShadow({ mode: "open" });
    const here = el("span", { className: "here" });
    const links = el("div", { className: "links" });
    const menuList = el("ul");
    const menu = el("details", {}, [el("summary", { textContent: "프로젝트 사이트" }), menuList]);
    menu.hidden = true;

    root.append(
      el("style", { textContent: css }),
      el("nav", { className: "bar" }, [
        el("a", { className: "brand", href: base }, [
          el("img", { src: new URL("assets/images/logo.svg", base).href, alt: "" }),
          "EoN",
        ]),
        here,
        links,
        menu,
      ]),
    );
    root.querySelector("nav").setAttribute("aria-label", "EoN");
    document.body.prepend(host);

    fetch(new URL("api/site.json", base))
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        for (const item of data.nav) links.append(el("a", { href: item.url, textContent: item.title }));

        const sites = data.projects.filter((p) => p.site);
        // 같은 조직 사이트는 주소 경로(/hw_2026/ 등)로 비교합니다. 로컬 미리보기에서도 동작하도록 호스트는 보지 않습니다.
        const pathOf = (u) => new URL(u, base).pathname;
        const current = sites.find((p) => pathOf(p.site).length > 1 && location.pathname.startsWith(pathOf(p.site)));
        if (current) here.textContent = `/ ${current.title}`;
        for (const p of sites) {
          const a = el("a", { href: p.site, textContent: p.title });
          if (p === current) a.setAttribute("aria-current", "page");
          menuList.append(el("li", {}, [a]));
        }
        menu.hidden = sites.length === 0;
      })
      .catch(() => {
        // 목록을 못 불러와도 홈으로 가는 로고 링크는 남습니다.
      });
  };

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
