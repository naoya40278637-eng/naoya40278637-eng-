(() => {
  const cases = Array.isArray(window.STUDENT_CASES) ? window.STUDENT_CASES : [];
  const form = document.querySelector("#case-search");
  const list = document.querySelector("#case-list");
  const count = document.querySelector("#result-count");
  const filters = document.querySelector("#active-filters");
  const empty = document.querySelector("#empty-state");
  const loadMore = document.querySelector("#load-more");
  const clearButton = document.querySelector("#clear-search");
  const pageSize = 12;

  let visibleLimit = pageSize;
  let matchedCases = [...cases];

  const fields = {
    age: document.querySelector("#age"),
    job: document.querySelector("#job"),
  };

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const stateFromForm = () => ({
    age: fields.age.value,
    job: fields.job.value,
  });

  const applyUrlState = () => {
    const params = new URLSearchParams(window.location.search);
    if ([...fields.age.options].some((option) => option.value === params.get("age"))) {
      fields.age.value = params.get("age");
    }
    if ([...fields.job.options].some((option) => option.value === params.get("job"))) {
      fields.job.value = params.get("job");
    }
  };

  const updateUrl = (state) => {
    const params = new URLSearchParams();
    if (state.age !== "all") params.set("age", state.age);
    if (state.job !== "all") params.set("job", state.job);
    const query = params.toString();
    history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  };

  const selectedLabel = (field) => field.options[field.selectedIndex].textContent;

  const renderActiveFilters = (state) => {
    const items = [];
    if (state.age !== "all") items.push(`年齢：${selectedLabel(fields.age)}`);
    if (state.job !== "all") items.push(`職業：${selectedLabel(fields.job)}`);
    filters.innerHTML = items
      .map((item) => `<span class="active-filter">${escapeHtml(item)}</span>`)
      .join("");
  };

  const cardTemplate = (item) => {
    const detailUrl = `case.html?id=${encodeURIComponent(item.id)}`;
    const tags = [
      item.ageLabel,
      item.jobLabels[0],
      item.genderLabel === "未掲載" ? "性別 未掲載" : item.genderLabel,
    ];
    return `
      <article class="case-card">
        <a href="${detailUrl}" aria-label="${escapeHtml(item.name)}の実績を見る">
          <div class="case-cover">
            <img src="${escapeHtml(item.thumb)}" alt="${escapeHtml(item.name)}の受講生実績バナー" loading="lazy" width="480" height="360">
            <strong class="outcome-badge">${escapeHtml(item.outcomeValue)}</strong>
          </div>
          <div class="case-body">
            <div class="case-tags">
              ${tags.map((tag) => `<span class="case-tag">${escapeHtml(tag)}</span>`).join("")}
            </div>
            <h3 class="case-name">${escapeHtml(item.name)}</h3>
            <p class="case-role">${escapeHtml(item.role)}</p>
            <div class="case-story">
              <p class="story-row">
                <span class="story-label">受講前</span>
                <span>${escapeHtml(`${item.before.metric}｜${item.before.callout}`)}</span>
              </p>
              <p class="story-row">
                <span class="story-label">最初の一歩</span>
                <span>${escapeHtml(item.firstStep.title)}</span>
              </p>
            </div>
            <span class="case-cta">収益化までの流れを見る</span>
          </div>
        </a>
      </article>
    `;
  };

  const renderResults = () => {
    const visibleCases = matchedCases.slice(0, visibleLimit);
    list.innerHTML = visibleCases.map(cardTemplate).join("");
    count.innerHTML = `<strong>${matchedCases.length}</strong>件`;
    empty.hidden = matchedCases.length !== 0;
    loadMore.hidden = matchedCases.length === 0 || visibleLimit >= matchedCases.length;
    loadMore.textContent = `さらに${Math.min(pageSize, matchedCases.length - visibleLimit)}件を見る`;
  };

  const filterCases = ({ scroll = false } = {}) => {
    const state = stateFromForm();
    matchedCases = cases.filter((item) => (
      (state.age === "all" || item.age === state.age)
      && (state.job === "all" || item.jobs.includes(state.job))
    ));
    visibleLimit = pageSize;
    updateUrl(state);
    renderActiveFilters(state);
    renderResults();
    if (scroll) {
      document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const clearSearch = ({ scroll = false } = {}) => {
    fields.age.value = "all";
    fields.job.value = "all";
    filterCases({ scroll });
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    filterCases({ scroll: true });
  });

  fields.age.addEventListener("change", () => filterCases());
  fields.job.addEventListener("change", () => filterCases());

  clearButton.addEventListener("click", () => clearSearch());
  document.querySelector("[data-clear-search]").addEventListener("click", () => clearSearch({ scroll: true }));

  loadMore.addEventListener("click", () => {
    visibleLimit += pageSize;
    renderResults();
  });

  applyUrlState();
  filterCases();
})();
