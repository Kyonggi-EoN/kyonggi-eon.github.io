// 소식 페이지의 분류·기간·제목 검색 필터. (_includes/sections/news.html의 form[data-news-filter], 섹션 옵션 filter: true)
// - 목록 줄(li.news-item)의 data-category, time[datetime], 제목 글자로 거르고 안 맞는 줄은 hidden으로 숨깁니다.
// - 제목 검색은 띄어쓰기와 대소문자를 가리지 않습니다. ("볼링모임"으로 "볼링 모임"을 찾음)
// - 기간은 고른 option의 data-year와 달 범위(data-from~data-to)로 거릅니다. 연도 전체와 학기가 같은 방식입니다.
// - 고른 값은 주소에 남깁니다(?category=seminar&period=2026-s2&q=볼링). 링크로 공유하거나 뒤로 가기로 돌아와도 그대로입니다.
// - 스크립트가 꺼져 있으면 필터 칸은 숨겨진 채로 두고 목록 전체를 보여 줍니다.

const squash = (text) => text.normalize("NFC").toLowerCase().replace(/\s+/g, "");

export function initNewsFilter() {
  const form = document.querySelector("[data-news-filter]");
  const section = form?.closest("section");
  const list = section?.querySelector(".news-list");
  if (!list) return;

  const count = form.querySelector("[data-news-count]");
  const reset = form.querySelector("[data-news-reset]");
  const empty = section.querySelector("[data-news-empty]");
  const rows = [...list.querySelectorAll(".news-item")].map((li) => {
    const [year, month] = (li.querySelector("time")?.getAttribute("datetime") ?? "").split("-").map(Number);
    return {
      li,
      category: li.dataset.category ?? "",
      year,
      month,
      title: squash(li.querySelector(".news-item__title")?.textContent ?? ""),
    };
  });

  // 주소에 적힌 값으로 시작합니다. 목록에 없는 분류·기간은 무시합니다.
  const params = new URLSearchParams(location.search);
  const radio = [...form.querySelectorAll("input[name=category]")].find((r) => r.value === params.get("category"));
  if (radio) radio.checked = true;
  const period = form.elements.period;
  if ([...period.options].some((o) => o.value === params.get("period"))) period.value = params.get("period");
  form.elements.q.value = params.get("q") ?? "";

  const apply = () => {
    const data = new FormData(form);
    const picked = {
      category: data.get("category") ?? "",
      period: data.get("period") ?? "",
      q: (data.get("q") ?? "").trim(),
    };
    const q = squash(picked.q);
    const range = picked.period && period.selectedOptions[0].dataset;
    const inPeriod = (row) =>
      !range || (row.year === Number(range.year) && row.month >= Number(range.from) && row.month <= Number(range.to));

    let shown = 0;
    for (const row of rows) {
      const ok =
        (!picked.category || row.category === picked.category) &&
        inPeriod(row) &&
        (!q || row.title.includes(q));
      row.li.hidden = !ok;
      if (ok) shown += 1;
    }

    const filtered = Object.values(picked).some(Boolean);
    count.textContent = filtered ? `${rows.length}건 중 ${shown}건` : `전체 ${rows.length}건`;
    reset.hidden = !filtered;
    if (empty) empty.hidden = shown > 0;

    const url = new URL(location.href);
    for (const [key, value] of Object.entries(picked)) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    history.replaceState(history.state, "", url);
  };

  form.addEventListener("input", apply);
  form.addEventListener("submit", (e) => e.preventDefault());
  reset.addEventListener("click", () => {
    form.reset();
    apply();
    form.querySelector("input[name=category]:checked").focus(); // 누른 버튼이 사라지므로 첫 칸으로
  });

  form.hidden = false;
  apply();
}
