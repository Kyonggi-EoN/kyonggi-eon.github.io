const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const gallery = "http://127.0.0.1:8137/news/2026/ee-exhibition-posters/";

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.EXHIBITION_TEST_BROWSER });
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    page.setDefaultTimeout(8000);
    await page.addInitScript(() => {
      // Exercise the fallback even when Chromium supports scrollend.
      const addEventListener = HTMLElement.prototype.addEventListener;
      HTMLElement.prototype.addEventListener = function (type, ...args) {
        if (type !== "scrollend") addEventListener.call(this, type, ...args);
      };
    });
    const settled = id => page.waitForFunction(id => {
      const panel = document.getElementById(id);
      return location.hash === "#" + id && !panel.inert && panel.style.order === "2";
    }, id, { timeout: 6000 });

    await page.goto(gallery);
    await page.getByRole("link", { name: "전시 둘러보기" }).tap();
    await settled("robotics");
    const firstPoster = await page.locator("#road-1").boundingBox();
    assert.ok(firstPoster.y + firstPoster.height <= 844, "The first poster fits on the screen");

    await page.getByRole("button", { name: "이전 주제" }).tap();
    await settled("communications");
    await page.locator("#communications .exhibition__chapter-next").tap();
    await settled("robotics");

    await page.goto(gallery + "#poster-index");
    const index = page.locator(".exhibition__index-list a");
    const hrefs = await index.evaluateAll(links => links.map(link => link.href));
    assert.equal(hrefs.length, 20);
    assert.equal(new Set(hrefs).size, hrefs.length);
    for (const href of hrefs) {
      const response = await page.request.get(href);
      assert.ok(response.ok(), href);
      const html = await response.text();
      assert.match(html, /<h1>[^<]+<\/h1>/, href);
      assert.match(html, /class="poster-detail__image"/, href);
    }

    const search = page.getByRole("searchbox", { name: "포스터 검색" });
    await search.fill("박막트랜지스터");
    assert.equal(await index.filter({ visible: true }).count(), 2);
    await search.fill("Go2");
    assert.ok(await index.filter({ visible: true }).getByText("길을 찾고, 시약을 붓는 로봇").isVisible());
    await search.fill("sidl 통신");
    assert.equal(await index.filter({ visible: true }).count(), 2);
    await index.filter({ visible: true }).first().tap();
    await page.waitForURL(url => url.pathname.endsWith("/sidl-1/"));
    assert.match(new URL(page.url()).pathname, /\/sidl-1\/$/);
    const image = await page.getByRole("link", { name: "이미지 크게 보기", exact: true }).getAttribute("href");
    const pdf = await page.getByRole("link", { name: /PDF 원본 보기/ }).getAttribute("href");
    for (const asset of [image, pdf]) {
      assert.ok((await page.request.head(new URL(asset, gallery).href)).ok(), asset);
    }
    assert.ok(await page.getByRole("heading", { name: "여기를 보세요" }).isVisible());
    await page.getByRole("link", { name: "전체 포스터", exact: true }).tap();
    await page.waitForURL(url => url.hash === "#poster-index" && url.searchParams.get("q") === "sidl 통신");
    assert.equal(await search.inputValue(), "sidl 통신");
    assert.equal(await index.filter({ visible: true }).count(), 2);
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
