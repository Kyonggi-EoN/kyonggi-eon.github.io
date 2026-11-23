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
  const coverPhotos = Array.from(exhibition.querySelectorAll(".exhibition__cover img"));
  const stage = exhibition.querySelector("[data-exhibition-stage]");
  const covers = Array.from(stage.querySelectorAll(".exhibition__stage-card"));
  const panels = Array.from(track.children);
  const topics = Array.from(nav.querySelectorAll("a"));
  const buttons = Array.from(nav.querySelectorAll("[data-exhibition-step]"));
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const graph = exhibition.querySelector(".exhibition__graph");
  const motionControls = exhibition.querySelector(".exhibition__motion-controls");
  const search = exhibition.querySelector("#poster-search");
  const searchBox = search.closest(".exhibition__search");
  const index = searchBox.closest(".exhibition__index");
  const compact = text => text.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
  const results = Array.from(index.querySelectorAll("[data-search-text]"), item => ({
    item,
    link: item.querySelector("a"),
    text: compact(item.textContent + " " + item.dataset.searchText),
  }));
  const searchStatus = searchBox.querySelector("[role=status]");
  let active = -1;
  let order = panels;
  let destination = null;
  let queuedChapter = null;
  let slideRaf = 0;
  let recenterRaf1 = 0;
  let recenterRaf2 = 0;
  let recentering = false;
  let trackTouching = false;
  let trackTouchStart = null;
  let stageTouch = null;
  let suppressStageClick = false;
  let suppressStageClickTimer = 0;
  let swipeWind = false;
  let scrollTimer = 0;

  motionControls.hidden = false;
  motionControls.querySelectorAll("[data-exhibition-motion]").forEach(button => {
    button.addEventListener("click", () => {
      const paused = exhibition.toggleAttribute(`data-${button.dataset.exhibitionMotion}-paused`);
      button.setAttribute("aria-pressed", String(!paused));
    });
  });

  if (coverPhotos.length > 1) {
    let current = coverPhotos[0];
    setInterval(() => {
      if (document.hidden || reducedMotion.matches || exhibition.hasAttribute("data-animation-paused")) return;
      const loaded = coverPhotos.filter(photo => photo.complete && photo.naturalWidth > 0);
      if (!loaded.length) return;
      const next = loaded[(loaded.indexOf(current) + 1) % loaded.length];
      if (next === current) return;
      current.setAttribute("aria-hidden", "true");
      next.removeAttribute("aria-hidden");
      current = next;
    }, 6000);
  }

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
    if (exhibition.hasAttribute("data-wind-paused")) return;
    line.dispatchEvent(new CustomEvent("exhibition:wind", { bubbles: true, detail: direction }));
  }

  function scrollWindowInstant(top) {
    try {
      window.scrollTo({ top, behavior: "instant" });
    } catch {
      const root = document.documentElement;
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, top);
      requestAnimationFrame(() => { root.style.scrollBehavior = previous; });
    }
  }

  function snapOffset(panel) {
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    const left = panel.offsetLeft - (track.clientWidth - panel.offsetWidth) / 2;
    return Math.max(0, Math.min(max, Math.round(left)));
  }

  function finishRecenter() {
    cancelAnimationFrame(recenterRaf1);
    cancelAnimationFrame(recenterRaf2);
    recenterRaf1 = 0;
    recenterRaf2 = 0;
    track.classList.remove("is-recentering");
    recentering = false;
  }

  function recenter(index) {
    // Keep both neighbors available for the next swipe without duplicating chapter IDs.
    finishRecenter();
    recentering = true;
    order = [-1, 0, 1].map(step => panels[(index + step + panels.length) % panels.length]);
    track.classList.add("is-recentering");
    order.forEach((panel, position) => { panel.style.order = position + 1; });
    track.scrollLeft = snapOffset(panels[index]);
    // Keep overflow locked and scroll-snap off for two frames so iOS Safari does not
    // re-snap to the previously snapped chapter after flex order changes.
    recenterRaf1 = requestAnimationFrame(() => {
      recenterRaf1 = 0;
      recenterRaf2 = requestAnimationFrame(() => {
        recenterRaf2 = 0;
        track.classList.remove("is-recentering");
        recentering = false;
      });
    });
  }

  function sizeTrack() {
    if (destination === null && panels[active]) {
      track.style.height = `${panels[active].offsetHeight}px`;
    }
  }

  function visibleIndex() {
    let closest = order[1];
    let best = Infinity;
    for (const panel of order) {
      const distance = Math.abs(track.scrollLeft - snapOffset(panel));
      if (distance < best) {
        best = distance;
        closest = panel;
      }
    }
    return panels.indexOf(closest);
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
      cover.getAnimations().filter(animation => animation.id === "chapter-return").forEach(animation => animation.cancel());
      cover.dataset.position = next;
      if (!reducedMotion.matches && !exhibition.hasAttribute("data-animation-paused") && previous && previous !== "center" && next !== "center") {
        const back = cover.animate([
          { transform: `var(--exhibition-cover-${previous})` },
          { transform: "translate(0, 15%) translateZ(-9rem) rotate(0) scale(0.53)", offset: 0.5 },
          { transform: `var(--exhibition-cover-${next})` },
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
    if (!onlyIfBelow || window.scrollY > top) scrollWindowInstant(top);
  }

  function cancelSlide() {
    if (!slideRaf) return;
    cancelAnimationFrame(slideRaf);
    slideRaf = 0;
    track.classList.remove("is-sliding");
  }

  function completeNavigation(index) {
    destination = null;
    activate(index);
    if (panels[index] !== order[1]) recenter(index);
    sizeTrack();
    const panel = panels[active];
    const queued = queuedChapter;
    queuedChapter = null;
    if (queued && queued !== panel) requestAnimationFrame(() => {
      if (destination === null && !trackTouching && panels[active] === panel) open(queued);
    });
  }

  function slideTo(index, targetLeft) {
    cancelSlide();
    finishRecenter();
    const startLeft = track.scrollLeft;
    const delta = targetLeft - startLeft;
    if (Math.abs(delta) <= 1) {
      completeNavigation(index);
      return;
    }
    track.classList.add("is-sliding");
    const duration = 420;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - (1 - progress) ** 3;
      track.scrollLeft = startLeft + delta * eased;
      if (progress < 1) {
        slideRaf = requestAnimationFrame(step);
        return;
      }
      slideRaf = 0;
      track.scrollLeft = targetLeft;
      track.classList.remove("is-sliding");
      completeNavigation(index);
    }

    slideRaf = requestAnimationFrame(step);
  }

  function navigate(target, animate = true) {
    const panel = target?.closest(".exhibition__section");
    const index = panels.indexOf(panel);
    if (index === -1) return;
    cancelSlide();
    finishRecenter();
    if (destination !== null) {
      destination = null;
      queuedChapter = null;
      recenter(active);
      finishRecenter();
    }
    const left = snapOffset(panel);
    const slide = animate && target === panel && !reducedMotion.matches && Math.abs(track.scrollLeft - left) > 1;
    if (slide) {
      scrollPage(stage);
      track.style.height = `${Math.max(panels[active].offsetHeight, panel.offsetHeight)}px`;
    }
    destination = slide ? index : null;
    activate(index);
    if (slide) {
      playTransitionWind(stage, Math.sign(left - track.scrollLeft));
      slideTo(index, left);
    } else {
      recenter(index);
      sizeTrack();
      scrollPage(target === panel ? stage : target);
    }
  }

  function hashTarget() {
    return document.getElementById(location.hash.slice(1));
  }

  function restoreLocation() {
    const target = hashTarget();
    if (target === index || target?.matches(".exhibition__story, .exhibition__stories")) scrollPage(target);
    else if (target) navigate(target, false);
    else {
      cancelSlide();
      destination = null;
      activate(0);
      recenter(0);
    }
  }

  function open(target) {
    if (destination !== null && panels.includes(target)) {
      queuedChapter = target;
      return;
    }
    if (location.hash !== `#${target.id}`) history.pushState(null, "", `#${target.id}`);
    navigate(target);
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

  let trackWidth = track.clientWidth;
  const resize = new ResizeObserver(() => {
    sizeTrack();
    if (track.clientWidth !== trackWidth) {
      trackWidth = track.clientWidth;
      if (destination === null && !trackTouching && !slideRaf) recenter(active);
    }
  });
  resize.observe(track);
  panels.forEach(panel => resize.observe(panel));

  track.addEventListener("scroll", () => {
    if (recentering || slideRaf) return;
    if (!trackTouching) {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(finishScroll, 220);
    }
    if (destination !== null || swipeWind || reducedMotion.matches) return;
    const delta = track.scrollLeft - snapOffset(order[1]);
    if (Math.abs(delta) < 24) return;
    swipeWind = true;
    const line = stage.getBoundingClientRect().bottom > nav.getBoundingClientRect().bottom ? stage : nav;
    playTransitionWind(line, Math.sign(delta));
  }, { passive: true });

  function finishScroll() {
    clearTimeout(scrollTimer);
    if (recentering || slideRaf || trackTouching) return;
    swipeWind = false;
    const index = visibleIndex();
    if (index === -1) return;
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
      if (destination === null && !trackTouching && panels[active] === panel) open(queued);
    });
  }
  track.addEventListener("scrollend", finishScroll);

  function allowSwipe(event) {
    if (event.type === "wheel" && Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    cancelSlide();
    finishRecenter();
    destination = null;
    queuedChapter = null;
  }

  track.addEventListener("touchstart", event => {
    if (event.touches.length === 1) {
      trackTouching = true;
      clearTimeout(scrollTimer);
      finishRecenter();
      trackTouchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    } else {
      trackTouchStart = null;
    }
  }, { passive: true });
  track.addEventListener("touchmove", event => {
    if (!trackTouchStart || event.touches.length !== 1) return;
    const touch = event.touches[0];
    const dx = Math.abs(touch.clientX - trackTouchStart.x);
    const dy = Math.abs(touch.clientY - trackTouchStart.y);
    if (dx > Math.max(10, dy)) allowSwipe(event);
  }, { passive: true });
  function endTrackTouch(event) {
    if (event.touches.length > 0) return;
    trackTouching = false;
    trackTouchStart = null;
    if (!recentering && !slideRaf) {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(finishScroll, 220);
    }
  }
  track.addEventListener("touchend", endTrackTouch, { passive: true });
  track.addEventListener("touchcancel", endTrackTouch, { passive: true });
  track.addEventListener("wheel", allowSwipe, { passive: true });

  stage.addEventListener("touchstart", event => {
    if (event.touches.length === 1) {
      stageTouch = { x: event.touches[0].clientX, y: event.touches[0].clientY, lock: null };
    } else {
      stageTouch = null;
    }
  }, { passive: true });
  stage.addEventListener("touchmove", event => {
    if (!stageTouch || event.touches.length !== 1) return;
    const touch = event.touches[0];
    const dx = touch.clientX - stageTouch.x;
    const dy = touch.clientY - stageTouch.y;
    if (!stageTouch.lock && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      stageTouch.lock = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
    }
    if (stageTouch.lock === "x") event.preventDefault();
  }, { passive: false });
  stage.addEventListener("touchend", event => {
    if (!stageTouch || event.touches.length) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - stageTouch.x;
    const dy = touch.clientY - stageTouch.y;
    const lockedX = stageTouch.lock === "x";
    stageTouch = null;
    if ((lockedX && Math.abs(dx) > 24) || Math.abs(dx) > Math.max(36, Math.abs(dy))) {
      suppressStageClick = true;
      clearTimeout(suppressStageClickTimer);
      suppressStageClickTimer = setTimeout(() => { suppressStageClick = false; }, 400);
      turn(dx < 0 ? 1 : -1);
    }
  }, { passive: true });
  stage.addEventListener("touchcancel", () => {
    stageTouch = null;
  }, { passive: true });
  stage.addEventListener("click", event => {
    if (!suppressStageClick) return;
    suppressStageClick = false;
    clearTimeout(suppressStageClickTimer);
    event.preventDefault();
    event.stopPropagation();
  }, true);

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
    open(target);
    if (track.contains(link) && panels.includes(target)) {
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
