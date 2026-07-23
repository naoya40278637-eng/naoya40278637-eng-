(() => {
  const cases = Array.isArray(window.STUDENT_CASES) ? window.STUDENT_CASES : [];
  const target = document.querySelector("#case-detail");
  const id = new URLSearchParams(window.location.search).get("id");
  const item = cases.find((entry) => entry.id === id);

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  if (!item) {
    target.innerHTML = `
      <section class="detail-missing">
        <div>
          <strong>実績が見つかりませんでした</strong>
          <p><a href="./">受講生実績一覧へ戻る</a></p>
        </div>
      </section>
    `;
    return;
  }

  document.title = `${item.name}の受講生実績 | ERABERU`;
  const tags = [
    item.ageLabel,
    ...item.jobLabels.slice(0, 2),
    item.genderLabel === "未掲載" ? "性別 未掲載" : item.genderLabel,
  ];

  target.innerHTML = `
    <section class="detail-hero">
      <div class="detail-tags">
        ${tags.map((tag) => `<span class="detail-tag">${escapeHtml(tag)}</span>`).join("")}
      </div>
      <h1 class="detail-name">${escapeHtml(item.name)}</h1>
      <p class="detail-role">${escapeHtml(item.role)}</p>
      <p class="detail-outcome">
        ${escapeHtml(item.outcome)}
        <strong>${escapeHtml(item.outcomeValue)}</strong>
      </p>
    </section>

    <section class="detail-summary">
      <h2>この実績のポイント</h2>
      <div class="detail-summary-grid">
        <div class="detail-summary-row">
          <span>受講前</span>
          <strong>${escapeHtml(`${item.before.metric}｜${item.before.callout}`)}</strong>
        </div>
        <div class="detail-summary-row">
          <span>最初の一歩</span>
          <strong>${escapeHtml(item.firstStep.title)}</strong>
        </div>
        <div class="detail-summary-row">
          <span>受講のきっかけ</span>
          <strong>${escapeHtml(item.trigger.headline)}</strong>
        </div>
      </div>
    </section>

    <section class="banner-section">
      <div class="banner-heading">
        <p>REAL PROCESS</p>
        <h2>収益化までのリアルなプロセス</h2>
      </div>
      <img class="full-banner" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}の収益化までの実績資料" width="720" loading="eager">
    </section>

    <section class="detail-actions">
      <a class="detail-action" href="${escapeHtml(item.file)}" target="_blank" rel="noopener">元のPDFを開く</a>
      <button class="detail-action share-action" id="share-case" type="button">この実績を共有する</button>
      <a class="detail-action detail-action-secondary" href="./">条件検索へ戻る</a>
      <p class="share-note" id="share-note" aria-live="polite"></p>
    </section>
  `;

  const shareButton = document.querySelector("#share-case");
  const shareNote = document.querySelector("#share-note");
  shareButton.addEventListener("click", async () => {
    const shareData = {
      title: `${item.name}の受講生実績`,
      text: `${item.name}｜${item.outcome}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== "AbortError") shareNote.textContent = "共有を開始できませんでした";
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      shareNote.textContent = "URLをコピーしました";
    } catch {
      shareNote.textContent = "ブラウザのURLをコピーして共有してください";
    }
  });
})();
