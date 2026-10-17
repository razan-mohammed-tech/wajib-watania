/**
 * الصفحة الرئيسية: التعريف بالمبادرة + رسالة ترحيبية + زر بدء الرحلة.
 */

import { hero, howItWorks, values, privacyNotice } from "../data/site.js";
import { getWeeklyChallenge, challenges } from "../data/challenges.js";
import { scenarios } from "../data/scenarios.js";
import { badges } from "../data/badges.js";
import { getOverallProgress, getState } from "../store.js";
import { sectionHead, progressBar, nf } from "../components/ui.js";

/** يملأ العدادات التفاعلية في نصوص الصفحة الرئيسية من الملفات الفعلية. */
function fillCounters(text) {
  return text
    .replace("{scenariosCount}", nf.format(scenarios.length))
    .replace("{challengesCount}", nf.format(challenges.length))
    .replace("{badgesCount}", nf.format(badges.length));
}

export default {
  key: "home",
  async render(container) {
    const weekly = getWeeklyChallenge();
    const progress = getOverallProgress(scenarios.length, challenges.length);
    const hasStarted = Object.keys(getState().scenarios).length > 0 || Object.keys(getState().challenges).length > 0;

    container.innerHTML = `
      <section class="hero">
        <span class="hero__badge">${hero.badge}</span>
        <h1 class="hero__title">${hero.titleHtml}</h1>
        <p class="hero__lead">${hero.lead}</p>

        <div class="hero__actions">
          ${hero.actions
            .map(
              (a) =>
                `<a class="btn btn--${a.style} btn--lg" href="${a.href}">${a.label}</a>`
            )
            .join("")}
        </div>

        <div class="hero__points">
          ${hero.points.map((p) => `<span><b aria-hidden="true">${p.icon}</b> ${fillCounters(p.text)}</span>`).join("")}
        </div>
      </section>

      ${
        hasStarted
          ? `<section class="section">
              <div class="card card--gold">
                ${progressBar(progress, "تقدّمك حتى الآن", `${nf.format(progress)}٪`)}
                <p class="card__body" style="margin:14px 0 0">
                  أهلًا بعودتك! تابع رحلتك من حيث توقفت — تقدّمك محفوظ على جهازك فقط.
                </p>
                <div class="hero__actions" style="margin-top:16px">
                  <a class="btn btn--primary btn--auto" href="#/achievements">🏅 افتح سجل الإنجاز</a>
                </div>
              </div>
            </section>`
          : ""
      }

      <section class="section">
        ${sectionHead("كيف تعمل الرحلة؟ 🚀", "أربع خطوات قصيرة، وتجربة تعلّم كاملة.")}
        <div class="grid grid--4">
          ${howItWorks
            .map(
              (s) => `
              <article class="card card--hover">
                <div class="card__icon">${s.icon}</div>
                <h3 class="card__title">${s.title}</h3>
                <p class="card__body">${s.text}</p>
              </article>`
            )
            .join("")}
        </div>
      </section>

      <section class="section">
        ${sectionHead("قيم نزرعها كل يوم 🌱", "أربع قيم تتحوّل داخل الموقع إلى قرارات صغيرة ينفذها الطفل.")}
        <div class="grid grid--4">
          ${values
            .map(
              (v) => `
              <article class="card card--green card--hover">
                <div class="card__icon">${v.icon}</div>
                <h3 class="card__title">${v.title}</h3>
                <p class="card__body">${v.text}</p>
              </article>`
            )
            .join("")}
        </div>
      </section>

      <section class="section">
        <div class="grid grid--2">
          <article class="card card--green">
            <span class="tag tag--gold">🎯 تحدي هذا الأسبوع</span>
            <h2 class="card__title" style="margin-top:12px">${weekly.icon} ${weekly.title}</h2>
            <p class="card__body">${weekly.brief}</p>
            <p class="card__body"><b>الوقت المقدّر:</b> ${weekly.time} · <b>المستوى:</b> ${weekly.difficulty}</p>
            <a class="btn btn--primary" href="#/challenges">افتح التحدي الآن</a>
          </article>

          <article class="card">
            <div class="card__icon">${privacyNotice.icon}</div>
            <h2 class="card__title">${privacyNotice.title}</h2>
            <p class="card__body">${privacyNotice.text}</p>
            <p class="card__body">
              لا يوجد تسجيل دخول ولا قاعدة بيانات. كل الأرقام المعروضة في
              «لوحة المعلمة» بيانات تجريبية للعرض، وأيضًا شاراتك ونقاطك تجريبية تعليمية
              لا تمثّل تقييمًا دراسيًا رسميًا.
            </p>
            <a class="btn btn--soft" href="#/about">تعرّف على المبادرة</a>
          </article>
        </div>
      </section>
    `;
  },
};
