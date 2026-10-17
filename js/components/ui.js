/**
 * أدوات واجهة مشتركة (Reusable UI helpers).
 * دوال صغيرة تُرجع نصوص HTML، تستعملها كل الصفحات.
 */

/** تنسيق الأرقام بالعربية (١٢ بدل 12) — الأرقام الهندية المستخدمة في المدارس السعودية. */
export const nf = new Intl.NumberFormat("ar-SA-u-nu-arab");

/** تنسيق التاريخ بالعربية المبسطة: «١٢ أكتوبر». */
export function fmtDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  try {
    return new Intl.DateTimeFormat("ar-SA-u-nu-arab", { day: "numeric", month: "long" }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

/** حماية النصوص من كسر HTML (احتياطية حتى كانت المحتوى من ملفاتنا). */
export function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** عنوان قسم مع سطر توضيحي. */
export function sectionHead(title, sub = "") {
  return `
    <div class="section__head">
      <h2 class="section__title">${title}</h2>
      ${sub ? `<p class="section__sub">${sub}</p>` : ""}
    </div>`;
}

/** شريط تقدم. */
export function progressBar(percent, rightLabel = "", leftLabel = "", ariaLabel = "نسبة الإنجاز") {
  const pct = Math.max(0, Math.min(100, Number(percent) || 0));
  return `
    ${rightLabel || leftLabel ? `
      <div class="progress-meta">
        <span>${rightLabel}</span>
        <span>${leftLabel}</span>
      </div>` : ""}
    <div class="progress" role="progressbar" aria-label="${ariaLabel}" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
      <div class="progress__fill" style="width:${pct}%"></div>
    </div>`;
}

/** بطاقة إحصاء. */
export function statCard(value, label) {
  return `
    <div class="stat">
      <span class="stat__value">${value}</span>
      <span class="stat__label">${label}</span>
    </div>`;
}

/** صف مخطط أعمدة. */
export function chartRow(label, percent, tone = "green") {
  const pct = Math.max(0, Math.min(100, Number(percent) || 0));
  const cls = tone === "gold" ? "chart-row__fill chart-row__fill--gold" : "chart-row__fill";
  return `
    <div class="chart-row">
      <div class="chart-row__head"><span>${label}</span><span>${nf.format(pct)}٪</span></div>
      <div class="chart-row__bar"><div class="${cls}" style="width:${pct}%"></div></div>
    </div>`;
}

/** تنبيه معلوماتي/تجريبي. */
export function notice(text, { icon = "ℹ️", tone = "" } = {}) {
  return `
    <div class="notice ${tone}">
      <span class="notice__icon">${icon}</span>
      <span>${text}</span>
    </div>`;
}

/** رأس صفحة موحّد. */
export function pageHead({ badge, title, sub }) {
  return `
    <header class="page-head">
      ${badge ? `<span class="page-head__badge">${badge}</span>` : ""}
      <h1 class="page-title">${title}</h1>
      ${sub ? `<p class="page-sub">${sub}</p>` : ""}
    </header>`;
}

/** يُنفّذ HTML داخل عنصر بأمان ويعيد العناصر المستخرجة. */
export function setHTML(container, html) {
  container.innerHTML = html;
  return container;
}
