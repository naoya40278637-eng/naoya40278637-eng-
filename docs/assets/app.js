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
    keyword: document.querySelector("#keyword"),
    age: document.querySelector("#age"),
    job: document.querySelector("#job"),
    gender: document.querySelector("#gender"),
  };

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const normalized = (value) => String(value)
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/\s+/g, "");

  const searchableText = (item) => normalized([
    item.name,
    item.role,
    item.ageLabel,
    item.genderLabel,
    item.jobLabels.join(" "),
    item.resultTypes.join(" "),
    item.heroTag,
    item.headline,
    item.outcome,
    item.trigger.eyebrow,
    item.trigger.headline,
    item.trigger.summary,
    item.before.label,
    item.before.metric,
    item.before.callout,
    item.steps.map((step) => `${step.timing} ${step.metric} ${step.title} ${step.detail}`).join(" "),
  ].join(" "));

  cases.forEach((item) => {
    item.searchableText = searchableText(item);
  });

  const stateFromForm = () => ({
    keyword: fields.keyword.value.trim(),
    age: fields.age.value,
    job: fields.job.value,
    gender: fields.gender.value,
  });

  const applyUrlState = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("q")) fields.keyword.value = params.get("q");
    if ([...fields.age.options].some((option) => option.value === params.get("age"))) {
      fields.age.value = params.get("age");
    }
    if ([...fields.job.options].some((option) => option.value === params.get("job"))) {
      fields.job.value = params.get("job");
    }
    if ([...fields.gender.options].some((option) => option.value === params.get("gender"))) {
      fields.gender.value = params.get("gender");
    }
  };

  const updateUrl = (state) => {
    const params = new URLSearchParams();
    if (state.keyword) params.set("q", state.keyword);
    if (state.age !== "all") params.set("age", state.age);
    if (state.job !== "all") params.set("job", state.job);
    if (state.gender !== "all") params.set("gender", state.gender);
    const query = params.toString();
    history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  };

  const selectedLabel = (field) => field.options[field.selectedIndex].textContent;

  const renderActiveFilters = (state) => {
    const items = [];
    if (state.keyword) items.push(`キーワード：${state.keyword}`);
    if (state.age !== "all") items.push(`年齢：${selectedLabel(fields.age)}`);
    if (state.job !== "all") items.push(`職業：${selectedLabel(fields.job)}`);
    if (state.gender !== "all") items.push(`性別：${selectedLabel(fields.gender)}`);
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
    const query = normalized(state.keyword);
    matchedCases = cases.filter((item) => (
      (!query || item.searchableText.includes(query))
      && (state.age === "all" || item.age === state.age)
      && (state.job === "all" || item.jobs.includes(state.job))
      && (state.gender === "all" || item.gender === state.gender)
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
    fields.keyword.value = "";
    fields.age.value = "all";
    fields.job.value = "all";
    fields.gender.value = "all";
    filterCases({ scroll });
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    filterCases({ scroll: true });
  });

  fields.age.addEventListener("change", () => filterCases());
  fields.job.addEventListener("change", () => filterCases());
  fields.gender.addEventListener("change", () => filterCases());

  clearButton.addEventListener("click", () => clearSearch());
  document.querySelector("[data-clear-search]").addEventListener("click", () => clearSearch({ scroll: true }));

  loadMore.addEventListener("click", () => {
    visibleLimit += pageSize;
    renderResults();
  });

  applyUrlState();
  filterCases();
})();
