export function initExhibition() {
  const track = document.querySelector("[data-exhibition-chapters]");
  if (!track) {
    const query = new URLSearchParams(location.search).get("q");
    if (query) {
      document.querySelectorAll("[data-exhibition-query]").forEach(link => {
        const url = new URL(link.href);
        url.searchParams.set("q", query);
        link.href = url.href;
      });
    }
    return;
  }
  const exhibition = track.closest(".exhibition");
  const nav = exhibition.querySelector(".exhibition__topics");
  const stage = exhibition.querySelector("[data-exhibition-stage]");
  const covers = Array.from(stage.querySelectorAll(".exhibition__stage-card"));
  const panels = Array.from(track.children);
  const topics = Array.from(nav.querySelectorAll("a"));
  const buttons = Array.from(nav.querySelectorAll("[data-exhibition-step]"));
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const graph = exhibition.querySelector(".exhibition__graph");
  const motionButton = exhibition.querySelector(".exhibition__motion");
  const search = exhibition.querySelector("#poster-search");
  const searchBox = search.closest(".exhibition__search");
  const index = searchBox.closest(".exhibition__index");
  const compact = text => text.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
  const results = Array.from(exhibition.querySelectorAll(".exhibition__index-list li"), item => ({
    item,
    link: item.querySelector("a"),
    text: compact(item.textContent + " " + item.dataset.searchText),
  }));
  const searchStatus = searchBox.querySelector("[role=status]");
  let active = -1;
  let order = panels;
  let destination = null;
  let queuedChapter = null;
  let touchStart;
  let trackTouchStart;
  let swipeWind = false;
  let scrollTimer;

  motionButton.hidden = false;
  motionButton.addEventListener("click", () => {
    const paused = exhibition.toggleAttribute("data-motion-paused");
    motionButton.setAttribute("aria-pressed", String(paused));
  });
  const graphObserver = new IntersectionObserver(([entry]) => {
    graph.toggleAttribute("data-offscreen", !entry.isIntersecting);
  });
  graphObserver.observe(graph);

  function showResults() {
    const query = search.value.trim();
    const tokens = query.split(/\s+/).map(compact).filter(Boolean);
    let count = 0;
    for (const { item, link, text } of results) {
      item.hidden = !tokens.every(token => text.includes(token));
      if (!item.hidden) count++;
      const url = new URL(link.href);
      if (query) url.searchParams.set("q", query);
      else url.searchParams.delete("q");
      link.href = url.href;
    }
    searchStatus.textContent = query ? `${count}개 포스터` : "";
  }

  function restoreSearch() {
    search.value = new URLSearchParams(location.search).get("q") ?? "";
    showResults();
  }

  searchBox.hidden = false;
  restoreSearch();
  search.addEventListener("input", () => {
    const url = new URL(location.href);
    const query = search.value.trim();
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    history.replaceState(history.state, "", url);
    showResults();
  });
  window.addEventListener("popstate", restoreSearch);

  function playTransitionWind(line, direction) {
    if (exhibition.hasAttribute("data-motion-paused")) return;
    line.dispatchEvent(new CustomEvent("exhibition:wind", { bubbles: true, detail: direction }));
  }

  function offset(panel) {
    return panel.offsetLeft - order[0].offsetLeft;
  }

  function recenter(index) {
    // Keep both neighbors available for the next swipe without duplicating chapter IDs.
    order = [-1, 0, 1].map(step => panels[(index + step + panels.length) % panels.length]);
    track.style.scrollSnapType = "none";
    order.forEach((panel, position) => { panel.style.order = position + 1; });
    track.scrollTo({ left: offset(panels[index]), behavior: "instant" });
    track.style.removeProperty("scroll-snap-type");
  }

  function sizeTrack() {
    if (destination === null) track.style.height = `${panels[active].offsetHeight}px`;
  }

  function visibleIndex() {
    const position = Math.max(0, Math.min(order.length - 1, Math.round(track.scrollLeft / offset(order[1]))));
    return panels.indexOf(order[position]);
  }

  function activate(index) {
    if (index === active) return;
    active = index;
    panels.forEach((panel, i) => { panel.inert = i !== active; });
    topics.forEach((topic, i) => {
      if (i === active) topic.setAttribute("aria-current", "location");
      else topic.removeAttribute("aria-current");
    });
    covers.forEach((cover, i) => {
      const position = (i - active + covers.length) % covers.length;
      const next = ["center", "right", "left"][position];
      const previous = cover.dataset.position;
      cover.dataset.position = next;
      if (!reducedMotion.matches && previous && previous !== "center" && next !== "center" && previous !== next) {
        const direction = next === "left" ? 1 : -1;
        cover.getAnimations().filter(animation => animation.id === "chapter-return").forEach(animation => animation.cancel());
        const back = cover.animate([
          { transform: `translateX(${71 * direction}%) rotateY(${-14 * direction}deg) scale(0.61)` },
          { transform: "translateY(14%) translateZ(-11rem) scale(0.52)", offset: 0.5 },
          { transform: `translateX(${-71 * direction}%) rotateY(${14 * direction}deg) scale(0.61)` },
        ], { duration: 560, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" });
        back.id = "chapter-return";
      }
      if (position === 0) cover.setAttribute("aria-current", "location");
      else cover.removeAttribute("aria-current");
    });
    sizeTrack();
  }

  function scrollPage(target, onlyIfBelow = false) {
    const inset = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const top = window.scrollY + target.getBoundingClientRect().top - inset;
    if (!onlyIfBelow || window.scrollY > top) window.scrollTo({ top, behavior: "instant" });
  }

  function navigate(target, animate = true, chapterStart = false) {
    const panel = target?.closest(".exhibition__section");
    const index = panels.indexOf(panel);
    if (index === -1) return;
    if (destination !== null) {
      destination = null;
      queuedChapter = null;
      recenter(active);
    }
    const left = offset(panel);
    const slide = animate && target === panel && !reducedMotion.matches && Math.abs(track.scrollLeft - left) > 1;
    if (slide) {
      scrollPage(chapterStart ? panel : stage);
      track.style.height = `${Math.max(panels[active].offsetHeight, panel.offsetHeight)}px`;
    }
    destination = slide ? index : null;
    activate(index);
    if (slide) {
      playTransitionWind(stage, Math.sign(left - track.scrollLeft));
      track.scrollTo({ left, behavior: "smooth" });
    } else {
      recenter(index);
      sizeTrack();
      scrollPage(target === panel && !chapterStart ? stage : target);
    }
  }

  function hashTarget() {
    return document.getElementById(location.hash.slice(1));
  }

  function restoreLocation() {
    const target = hashTarget();
    if (target === index) scrollPage(index);
    else if (target) navigate(target, false);
    else {
      destination = null;
      activate(0);
      recenter(0);
    }
  }

  function open(target, chapterStart = false) {
    if (destination !== null && panels.includes(target)) {
      queuedChapter = target;
      return;
    }
    if (location.hash !== `#${target.id}`) history.pushState(null, "", `#${target.id}`);
    navigate(target, true, chapterStart);
  }

  function turn(step) {
    const from = queuedChapter ? panels.indexOf(queuedChapter) : active;
    open(panels[(from + step + panels.length) % panels.length]);
  }

  track.classList.add("is-carousel");
  stage.classList.add("is-carousel");
  track.tabIndex = 0;
  track.setAttribute("aria-label", "전시 챕터");
  buttons.forEach(button => { button.hidden = false; });
  activate(0);
  recenter(0);
  if (location.hash) restoreLocation();

  const resize = new ResizeObserver(sizeTrack);
  panels.forEach(panel => resize.observe(panel));

  track.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(finishScroll, 180);
    if (destination !== null || swipeWind || reducedMotion.matches) return;
    const delta = track.scrollLeft - offset(order[1]);
    if (Math.abs(delta) < 24) return;
    swipeWind = true;
    const line = stage.getBoundingClientRect().bottom > nav.getBoundingClientRect().bottom ? stage : nav;
    playTransitionWind(line, Math.sign(delta));
  }, { passive: true });

  function finishScroll() {
    clearTimeout(scrollTimer);
    swipeWind = false;
    const index = visibleIndex();
    if (destination !== null && index !== destination) return;
    const changed = index !== active;
    destination = null;
    activate(index);
    if (panels[index] !== order[1]) recenter(index);
    sizeTrack();
    const panel = panels[active];
    if (changed && !panel.contains(hashTarget())) {
      history.replaceState(null, "", `#${panel.id}`);
      scrollPage(stage, true);
    }
    const queued = queuedChapter;
    queuedChapter = null;
    if (queued && queued !== panel) requestAnimationFrame(() => {
      if (destination === null && panels[active] === panel) open(queued);
    });
  }
  track.addEventListener("scrollend", finishScroll);

  function allowSwipe(event) {
    if (event.type === "wheel" && Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    destination = null;
    queuedChapter = null;
  }

  track.addEventListener("touchstart", event => {
    trackTouchStart = event.touches.length === 1 ? event.touches[0] : null;
  }, { passive: true });
  track.addEventListener("touchmove", event => {
    if (!trackTouchStart || event.touches.length !== 1) return;
    const touch = event.touches[0];
    const dx = Math.abs(touch.clientX - trackTouchStart.clientX);
    const dy = Math.abs(touch.clientY - trackTouchStart.clientY);
    if (dx > Math.max(10, dy)) allowSwipe(event);
  }, { passive: true });
  track.addEventListener("wheel", allowSwipe, { passive: true });

  stage.addEventListener("touchstart", event => {
    touchStart = event.touches.length === 1 ? event.touches[0] : null;
  }, { passive: true });
  stage.addEventListener("touchend", event => {
    if (!touchStart || event.touches.length) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.clientX;
    const dy = touch.clientY - touchStart.clientY;
    touchStart = null;
    if (Math.abs(dx) > Math.max(40, Math.abs(dy))) turn(dx < 0 ? 1 : -1);
  }, { passive: true });

  exhibition.addEventListener("click", event => {
    const control = event.target.closest("[data-exhibition-step]");
    if (control) {
      turn(Number(control.dataset.exhibitionStep));
      return;
    }
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (target === index) {
      event.preventDefault();
      if (location.hash !== link.hash) history.pushState(null, "", link.hash);
      scrollPage(index);
      search.focus({ preventScroll: true });
      return;
    }
    if (!track.contains(target)) return;
    event.preventDefault();
    if (stage.contains(link) && target === panels[active]) {
      if (location.hash !== link.hash) history.pushState(null, "", link.hash);
      scrollPage(target);
      track.focus({ preventScroll: true });
      return;
    }
    const chapterStart = link.classList.contains("exhibition__start");
    open(target, chapterStart);
    if (chapterStart || (track.contains(link) && panels.includes(target))) {
      track.focus({ preventScroll: true });
    } else if (target !== target.closest(".exhibition__section")) {
      target.querySelector("a").focus({ preventScroll: true });
    }
  });

  track.addEventListener("keydown", event => {
    if (event.target !== track || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    turn(event.key === "ArrowLeft" ? -1 : 1);
  });

  window.addEventListener("hashchange", () => {
    queuedChapter = null;
    restoreLocation();
  });
}
