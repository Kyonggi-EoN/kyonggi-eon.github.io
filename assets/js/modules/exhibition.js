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
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  initMotion(exhibition, reducedMotion);
  const index = exhibition.querySelector("#poster-index");
  initSearch(index);
  initChapters(exhibition, track, index, reducedMotion);
}

function initMotion(exhibition, reducedMotion) {
  const controls = exhibition.querySelector(".exhibition__motion-controls");
  controls.hidden = false;
  controls.querySelectorAll("[data-exhibition-motion]").forEach(button => {
    button.addEventListener("click", () => {
      const paused = exhibition.toggleAttribute(`data-${button.dataset.exhibitionMotion}-paused`);
      button.setAttribute("aria-pressed", String(!paused));
    });
  });

  const photos = Array.from(exhibition.querySelectorAll(".exhibition__cover img"));
  if (photos.length > 1) {
    let current = photos[0];
    setInterval(() => {
      if (document.hidden || reducedMotion.matches || exhibition.hasAttribute("data-animation-paused")) return;
      const loaded = photos.filter(photo => photo.complete && photo.naturalWidth > 0);
      if (!loaded.length) return;
      const next = loaded[(loaded.indexOf(current) + 1) % loaded.length];
      current.setAttribute("aria-hidden", "true");
      next.removeAttribute("aria-hidden");
      current = next;
    }, 6000);
  }

  const graph = exhibition.querySelector(".exhibition__graph");
  const observer = new IntersectionObserver(([entry]) => {
    graph.toggleAttribute("data-offscreen", !entry.isIntersecting);
  });
  observer.observe(graph);
}

function initSearch(index) {
  const search = index.querySelector("#poster-search");
  const searchBox = search.closest(".exhibition__search");
  const status = searchBox.querySelector("[role=status]");
  const compact = text => text.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
  const results = Array.from(index.querySelectorAll("[data-search-text]"), item => ({
    item,
    link: item.querySelector("a"),
    text: compact(item.textContent + " " + item.dataset.searchText),
  }));

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
    status.textContent = `${count}개 포스터`;
  }

  function restoreSearch() {
    search.value = new URLSearchParams(location.search).get("q") || "";
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
}

function initChapters(exhibition, track, index, reducedMotion) {
  const nav = exhibition.querySelector(".exhibition__topics");
  const stage = exhibition.querySelector("[data-exhibition-stage]");
  const panels = Array.from(track.children);
  const topics = Array.from(nav.querySelectorAll("a"));
  const covers = Array.from(stage.children);
  const buttons = nav.querySelectorAll("[data-exhibition-step]");
  let active = -1;
  let slides = [];

  function showChapter(next, direction = 0, drag = 0) {
    if (next === active) return;
    slides.forEach(slide => slide.cancel());
    slides = [];
    const previous = panels[active];
    if (previous?.contains(document.activeElement)) track.focus({ preventScroll: true });
    active = next;

    buttons.forEach(button => {
      const neighbor = active + Number(button.dataset.exhibitionStep);
      button.setAttribute("aria-disabled", String(!panels[neighbor]));
    });
    panels.forEach((panel, i) => {
      const current = i === active;
      const position = ["left", "center", "right"][i - active + 1] ?? "offstage";
      panel.dataset.position = covers[i].dataset.position = position;
      panel.inert = !current;
      for (const link of [topics[i], covers[i]]) {
        if (current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
    });

    if (!direction || reducedMotion.matches) return;
    const incoming = direction > 0 ? "var(--chapter-right)" : "var(--chapter-left)";
    const outgoing = direction > 0 ? "var(--chapter-left)" : "var(--chapter-right)";
    const timing = { duration: 360, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)" };
    slides = [
      previous.animate([
        { transform: `translateX(${drag}px)` },
        { transform: `translateX(${outgoing})` },
      ], timing),
      panels[active].animate([
        { transform: `translateX(calc(${incoming} + ${drag}px))` },
        { transform: "none" },
      ], timing),
    ];
    if (!exhibition.hasAttribute("data-wind-paused")) {
      stage.dispatchEvent(new CustomEvent("exhibition:wind", { bubbles: true, detail: direction }));
    }
  }

  const align = target => target.scrollIntoView({ behavior: "instant", block: "start", inline: "nearest" });

  function open(target, { link, drag, restore = false } = {}) {
    const panel = target.closest(".exhibition__section");
    const next = panels.indexOf(panel);
    if (next < 0) {
      align(target);
      if (link) target.focus({ preventScroll: true });
      return;
    }

    const isChapter = target === panel;
    const enter = isChapter && next === active && link && stage.contains(link);
    const distance = next - active;
    const step = isChapter && !restore && Math.abs(distance) === 1 ? distance : 0;
    showChapter(next, step, drag);
    align(isChapter ? (enter ? track : stage) : target);
    if (enter || (isChapter && link && track.contains(link))) track.focus({ preventScroll: true });
    if (!isChapter && link) target.querySelector("a").focus({ preventScroll: true });
  }

  function navigate(target, options) {
    const hash = `#${target.id}`;
    if (location.hash !== hash) history.pushState(history.state, "", hash);
    open(target, options);
  }

  function turn(direction, drag) {
    const neighbor = panels[active + direction];
    if (neighbor) navigate(neighbor, { drag });
  }

  function restoreLocation() {
    const target = document.getElementById(location.hash.slice(1));
    if (track.contains(target) || target?.matches("#poster-index, .exhibition__story, .exhibition__stories")) {
      open(target, { restore: true });
    } else if (!location.hash) {
      showChapter(0);
    }
  }

  track.tabIndex = 0;
  showChapter(0);
  track.classList.add("is-carousel");
  stage.classList.add("is-carousel");
  buttons.forEach(button => { button.hidden = false; });
  if (location.hash) restoreLocation();
  window.addEventListener("hashchange", restoreLocation);

  exhibition.addEventListener("click", event => {
    const control = event.target.closest("[data-exhibition-step]");
    if (control) {
      turn(Number(control.dataset.exhibitionStep));
      return;
    }
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (target !== index && !track.contains(target)) return;
    event.preventDefault();
    navigate(target, { link });
  });

  track.addEventListener("keydown", event => {
    if (event.target !== track || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    turn(event.key === "ArrowLeft" ? -1 : 1);
  });

  let wheelTime = -Infinity;
  let wheelDistance = 0;
  track.addEventListener("wheel", event => {
    if (event.ctrlKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    if (event.timeStamp - wheelTime > 180) wheelDistance = 0;
    wheelTime = event.timeStamp;
    if (wheelDistance === null) return;
    wheelDistance += event.deltaMode ? Math.sign(event.deltaX) * 40 : event.deltaX;
    if (Math.abs(wheelDistance) < 32) return;
    turn(Math.sign(wheelDistance));
    wheelDistance = null;
  }, { passive: false });

  enableSwipe(stage, turn);
  enableSwipe(track, turn, track);
}

function enableSwipe(surface, turn, track) {
  let swipe;

  function clearSwipe() {
    swipe = null;
    track?.style.removeProperty("--chapter-drag");
  }

  surface.addEventListener("pointerdown", event => {
    if (!event.isPrimary) clearSwipe();
    else if (event.pointerType !== "mouse") swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  surface.addEventListener("pointermove", event => {
    if (!swipe || event.pointerId !== swipe.id) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    if (!swipe.horizontal) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 10) return;
      if (Math.abs(dx) <= Math.abs(dy)) {
        clearSwipe();
        return;
      }
      swipe.horizontal = true;
      // Keep the eventual click on the carousel instead of the link under the finger.
      surface.setPointerCapture(event.pointerId);
    }
    track?.style.setProperty("--chapter-drag", `${dx}px`);
  });
  surface.addEventListener("pointerup", event => {
    if (!swipe || event.pointerId !== swipe.id) return;
    const dx = event.clientX - swipe.x;
    const change = swipe.horizontal && Math.abs(dx) >= 36;
    clearSwipe();
    if (change) turn(dx < 0 ? 1 : -1, track ? dx : 0);
  });
  surface.addEventListener("pointercancel", clearSwipe);
}
