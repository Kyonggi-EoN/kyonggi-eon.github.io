const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const origin = process.env.EXHIBITION_TEST_ORIGIN || "http://127.0.0.1:8137";
const gallery = new URL("/news/2026/ee-exhibition-posters/", origin).href;

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.EXHIBITION_TEST_BROWSER });
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    page.setDefaultTimeout(8000);
    const settled = id => page.waitForFunction(id => {
      const panel = document.getElementById(id);
      const { left, right } = panel.getBoundingClientRect();
      const track = panel.parentElement.getBoundingClientRect();
      return location.hash === "#" + id && !panel.inert && Math.abs(left + right - track.left - track.right) < 1;
    }, id, { timeout: 6000 });

    await page.clock.install();
    await page.goto(gallery);
    const activeCover = page.locator('.exhibition__cover img:not([aria-hidden="true"])');
    await page.waitForFunction(() => [...document.querySelectorAll(".exhibition__cover img")]
      .every(img => img.complete && img.naturalWidth > 0));
    const coverSources = await page.locator(".exhibition__cover img").evaluateAll(images => images.map(img => img.src));
    const start = page.getByRole("link", { name: "전시 둘러보기" });
    const startBox = await start.boundingBox();
    assert.equal(await activeCover.evaluate(img => img.src), coverSources[0]);
    assert.ok(startBox.y + startBox.height <= 844, "The exhibition entrance fits on the first mobile screen");
    const wind = page.getByRole("button", { name: "바람 효과", exact: true });
    const animation = page.getByRole("button", { name: "로고·표지 애니메이션", exact: true });
    const canvas = page.locator(".exhibition__wind");
    const cover = page.locator(".exhibition__stage-card").first();
    await wind.tap();
    assert.equal(await wind.getAttribute("aria-pressed"), "false");
    assert.equal(await canvas.isVisible(), false);
    assert.equal(await animation.getAttribute("aria-pressed"), "true");
    assert.notEqual(await cover.evaluate(el => getComputedStyle(el).transitionDuration), "0s");
    await animation.tap();
    assert.equal(await cover.evaluate(el => getComputedStyle(el).transitionDuration), "0s");
    await page.clock.fastForward(6000);
    assert.equal(await activeCover.evaluate(img => img.src), coverSources[0], "Pausing animation also pauses the entrance cover");
    await wind.tap();
    assert.equal(await canvas.isVisible(), true);
    assert.equal(await animation.getAttribute("aria-pressed"), "false");
    await animation.tap();

    for (const src of [...coverSources.slice(1), coverSources[0]]) {
      await page.clock.fastForward(6000);
      assert.equal(await activeCover.evaluate(img => img.src), src, "The entrance cover rotates in order");
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.clock.fastForward(6000);
    assert.equal(await activeCover.evaluate(img => img.src), coverSources[0], "Reduced motion keeps the cover still");
    await page.emulateMedia({ reducedMotion: "no-preference" });

    await start.tap();
    await page.waitForURL(gallery + "#story-overview");
    await page.waitForFunction(() => {
      const heading = document.getElementById("exhibition-stories-title").getBoundingClientRect();
      return heading.top >= document.querySelector(".exhibition__topics").getBoundingClientRect().bottom
        && heading.bottom <= innerHeight;
    });
    await cover.tap();
    await settled("robotics");
    const firstPoster = await page.locator("#eon-robot-1").boundingBox();
    assert.ok(firstPoster.y + firstPoster.height <= 844, "The first poster fits on the screen");

    assert.equal(await page.getByRole("button", { name: "이전 주제" }).isEnabled(), false);
    const rightCover = page.locator('.exhibition__stage-card[data-position="right"]');
    await rightCover.tap();
    await settled("semiconductors");
    await rightCover.tap();
    await settled("communications");
    assert.equal(await rightCover.count(), 0);
    assert.equal(await page.getByRole("button", { name: "다음 주제" }).isEnabled(), false);
    assert.equal(await page.locator("#communications .exhibition__chapter-next").count(), 0);
    await page.getByRole("region", { name: "전시 챕터" }).focus();
    await page.keyboard.press("ArrowRight");
    await settled("communications");

    const touch = await page.context().newCDPSession(page);
    async function swipe(target, dx, dy = 0) {
      const box = await target.boundingBox();
      const x = Math.round(box.x + box.width / 2);
      const y = Math.round(box.y + Math.min(box.height / 2, 220));
      await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
      for (const step of [0.25, 0.5, 0.75, 1]) {
        await touch.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: x + dx * step, y: y + dy * step }],
        });
      }
      await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    }

    await swipe(page.locator("#communications .exhibition__poster-link").first(), -105);
    await settled("communications");
    await swipe(page.locator("#communications .exhibition__poster-link").first(), 105);
    await settled("semiconductors");
    await swipe(page.locator("#semiconductors .exhibition__poster-link").first(), 105);
    await settled("robotics");
    const beforePan = await page.evaluate(() => scrollY);
    await swipe(page.locator("#robotics .exhibition__poster-link").first(), 0, -100);
    await page.waitForFunction(before => scrollY > before + 30, beforePan);
    assert.equal(new URL(page.url()).hash, "#robotics");
    await page.goBack();
    await settled("semiconductors");
    await swipe(page.locator('.exhibition__stage-card[data-position="center"]'), 105);
    await settled("robotics");

    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(gallery + "#asnl-1");
    await page.reload();
    await page.waitForFunction(() => {
      const poster = document.querySelector("#asnl-1");
      const top = poster.getBoundingClientRect().top;
      return location.hash === "#asnl-1" && !poster.closest("section").inert &&
        top >= document.querySelector(".exhibition__topics").getBoundingClientRect().bottom && top < innerHeight;
    });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 320);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "이전 주제" }).tap();
    await settled("robotics");

    const stories = page.locator("[data-exhibition-chapters] + #story-overview:has(+ #poster-index)");
    assert.equal(await stories.locator(".exhibition__story-cover img").count(), 3);
    const sceneImages = stories.locator('.exhibition__scene img[alt]:not([alt=""])');
    const sources = await sceneImages.evaluateAll(images => images.map(image => image.src));
    assert.equal(sources.length, 8);
    for (const source of sources) {
      assert.match(new URL(source).pathname, /\/2026\/story\/[^/]+\.webp$/);
      assert.ok((await page.request.head(source)).ok(), source);
    }
    await page.getByRole("link", { name: "로봇·자율주행 이야기 보기" }).tap();
    await page.waitForURL(gallery + "#story-robotics");
    await page.reload();
    await page.waitForURL(gallery + "#story-robotics");
    const story = stories.locator("#story-robotics");
    await page.waitForFunction(() => {
      const top = document.querySelector("#story-robotics").getBoundingClientRect().top;
      return top >= document.querySelector(".exhibition__topics").getBoundingClientRect().bottom && top < innerHeight;
    });
    assert.deepEqual(await story.locator("li .exhibition__team").allTextContents(), ["EoN", "RO:AD", "RV Lab."]);
    await story.getByRole("link", { name: /자연어 명령을 따르는 로봇 팔.*포스터 보기/ }).tap();
    await page.waitForURL(gallery + "road-1/");

    await page.goto(gallery + "#poster-index");
    const index = page.locator("#poster-index .exhibition__index-list a");
    const hrefs = await index.evaluateAll(links => links.map(link => link.href));
    assert.equal(hrefs.length, 21);
    assert.equal(new Set(hrefs).size, hrefs.length);
    for (const href of hrefs) {
      const response = await page.request.get(href);
      assert.ok(response.ok(), href);
      const html = await response.text();
      assert.match(html, /<h1>[^<]+<\/h1>/, href);
      assert.match(html, /class="poster-detail__image"/, href);
      const crop = html.match(/<img src="([^"]+\/detail\/[^"]+\.webp)"/);
      assert.ok(crop, href);
      assert.ok((await page.request.head(new URL(crop[1], gallery).href)).ok(), crop[1]);
    }

    const search = page.getByRole("searchbox", { name: "포스터 검색" });
    await search.fill("Go2");
    await page.reload();
    await page.waitForFunction(() => {
      const index = document.querySelector("#poster-index");
      const top = index.getBoundingClientRect().top;
      return location.hash === "#poster-index" && document.querySelector("#poster-search").value === "Go2" &&
        top >= document.querySelector(".exhibition__topics").getBoundingClientRect().bottom && top < innerHeight;
    });
    assert.ok(await index.filter({ visible: true }).getByText("길을 찾고, 시약을 붓는 로봇").isVisible());
    await search.fill("박막트랜지스터");
    assert.equal(await index.filter({ visible: true }).count(), 2);
    for (const term of ["SO-ARM101", "SO-101"]) {
      await search.fill(term);
      const matches = await index.filter({ visible: true }).evaluateAll(links => links.map(link => new URL(link.href).pathname.split("/").at(-2)));
      assert.deepEqual(matches, ["eon-robot-1", "road-1"], term);
    }
    await search.fill("sidl 통신");
    assert.equal(await index.filter({ visible: true }).count(), 3);
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
    assert.equal(await index.filter({ visible: true }).count(), 3);
    await search.fill("sidl fpga");
    assert.deepEqual(await index.filter({ visible: true }).evaluateAll(links => links.map(link => new URL(link.href).pathname)), [new URL("sidl-fpga/", gallery).pathname]);

    await page.goto(gallery + "rvlab-1/");
    await page.locator(".exhibition__chapter-next").tap();
    await page.waitForURL(gallery + "asnl-3/");
    assert.match(await page.getByRole("navigation", { name: "이전·다음 포스터" }).getByRole("link").first().getAttribute("href"), /\/rvlab-1\/$/);
    await page.goto(gallery + "sidl-2/");
    await page.locator(".exhibition__chapter-next").tap();
    await page.waitForURL(gallery + "sidl-fpga/");
    assert.ok(await page.getByRole("heading", { name: "FPGA 개발 보드 설계 보고서" }).isVisible());
    const reportPreview = page.getByRole("img", { name: "SIDL FPGA Board V1 보고서 첫 페이지" });
    await reportPreview.scrollIntoViewIfNeeded();
    await reportPreview.evaluate(image => image.decode());
    const reportPdf = await page.getByRole("link", { name: /PDF 원본 보기/ }).getAttribute("href");
    assert.match(reportPdf, /\/reports\/sidl-fpga-board-report\.pdf$/);
    assert.ok((await page.request.head(new URL(reportPdf, gallery).href)).ok(), reportPdf);
    await page.locator(".exhibition__chapter-next").tap();
    await page.waitForURL(gallery + "#poster-index");

    await page.goto(new URL("/news/2026/ee-exhibition/", origin).href);
    const logistics = page.locator(".article__event");
    assert.match(await logistics.innerText(), /11월 24일.*25일/);
    assert.match(await logistics.innerText(), /제2공학관 1층 로비/);
    assert.match(await logistics.innerText(), /12:00–12:30, 17:00–17:30/);
    const schedule = await logistics.boundingBox();
    assert.ok(schedule.y + schedule.height <= 844, "The event schedule fits on the first mobile screen");
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
