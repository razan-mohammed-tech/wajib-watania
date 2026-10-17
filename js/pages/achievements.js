/**
 * صفحة «سجل الإنجاز»: المستوى، النقاط، الشارات، والتحديات والمواقف المكتملة.
 * كل البيانات المعروضة هنا من هذا الجهاز فقط.
 */

import { badges, getLevel } from "../data/badges.js";
import { scenarios } from "../data/scenarios.js";
import { challenges } from "../data/challenges.js";
import { getState, getDeviceStats, getOverallProgress, resetProgress } from "../store.js";
import { pageHead, progressBar, statCard, nf, fmtDate, notice } from "../components/ui.js";
import { showToast } from "../components/toast.js";

export default {
  key: "achievements",
  async render(container) {
    const state = getState();
    const stats = getDeviceStats();
    const { current, next, progress } = getLevel(stats.points);

    const doneChallenges = challenges.filter((c) => state.challenges[c.id]);
    const doneScenarios = scenarios.filter((s) => state.scenarios[s.id]);
    const overall = getOverallProgress(scenarios.length, challenges.length);

    container.innerHTML = `
      ${pageHead({
        badge: "🏅 سجل الإنجاز",
        title: "رحلتي حتى الآن",
        sub: "كل ما تراه هنا محفوظ داخل متصفح جهازك فقط، ولا يُرسل إلى أي جهة. لا يوجد اسم ولا صورة ولا رقم — تقدّم بلا بيانات شخصية.",
      })}

      <section class="level-card">
        <span class="level-card__ring" aria-hidden="true">${current.icon}</span>
        <div style="flex:1;min-width:220px">
          <span class="level-card__name">${current.name}</span>
          <p class="level-card__meta" style="margin:4px 0 0">
            ${nf.format(stats.points)} نقطة ·
            ${next ? `باقٍ ${nf.format(next.min - stats.points)} نقطة للوصول إلى «${next.name}»` : "وصلتَ إلى أعلى مستوى! 🎉"}
          </p>
          ${progressBar(progress, "", `${nf.format(progress)}٪ من المستوى التالي`, "التقدّم نحو المستوى التالي")}
        </div>
      </section>

      <section class="section">
        <div class="grid grid--4">
          ${statCard(nf.format(stats.points), "النقاط")}
          ${statCard(`${nf.format(stats.scenariosSolved)} / ${nf.format(scenarios.length)}`, "مواقف محلولة")}
          ${statCard(`${nf.format(stats.accuracy)}٪`, "دقة الإجابات")}
          ${statCard(`${nf.format(stats.challengesDone)} / ${nf.format(challenges.length)}`, "تحديات منجزة")}
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">شاراتي</h2>
        <p class="section__sub">اجمع الشارات بإنجاز المواقف والتحديات.</p>
        <div class="grid grid--4" style="margin-top:16px">
          ${badges
            .map((b) => {
              const unlocked = state.badges.includes(b.id);
              return `
                <article class="badge-card ${unlocked ? "" : "badge-card--locked"}"
                         ${unlocked ? "" : 'aria-label="شارة مقفلة"'}>
                  <span class="badge-card__icon" aria-hidden="true">${b.icon}</span>
                  <span class="badge-card__name">${b.name}</span>
                  <p class="badge-card__desc">${b.desc}</p>
                  <span class="tag ${unlocked ? "tag--gold" : ""}">${unlocked ? "✅ مُستحقّة" : "🔒 لم تُفتح بعد"}</span>
                </article>`;
            })
            .join("")}
        </div>
      </section>

      <section class="section grid grid--2">
        <div>
          <h2 class="section__title">تحدياتي المنجزة</h2>
          ${
            doneChallenges.length
              ? `<ul class="record-list" style="margin-top:12px">
                  ${doneChallenges
                    .map(
                      (c) => `
                      <li>
                        <span aria-hidden="true">${c.icon}</span>
                        <span>${c.title}</span>
                        <span class="date">${fmtDate(state.challenges[c.id].completedAt)}</span>
                      </li>`
                    )
                    .join("")}
                 </ul>`
              : `<p class="card__body">لم تنجز تحديًا بعد. ابدأ بـ <a href="#/challenges">تحدي الأسبوع</a> — إنه بسيط وسريع.</p>`
          }
        </div>

        <div>
          <h2 class="section__title">مواقف مكتملة</h2>
          ${
            doneScenarios.length
              ? `<ul class="record-list" style="margin-top:12px">
                  ${doneScenarios
                    .map((s) => {
                      const rec = state.scenarios[s.id];
                      return `
                        <li>
                          <span aria-hidden="true">${rec.correct ? "✅" : "🔁"}</span>
                          <span>${s.icon} ${s.title}</span>
                          <span class="date">${s.category}</span>
                        </li>`;
                    })
                    .join("")}
                 </ul>`
              : `<p class="card__body">لم تبدأ المحاكاة بعد. <a href="#/simulator">ابدأ أول موقف الآن</a>.</p>`
          }
        </div>
      </section>

      <section class="section">
        ${notice(
          `إنجازك العام: <b>${nf.format(overall)}٪</b> من المواقف والتحديات المتاحة. هذه شارات تعليمية محفوظة محليًا ولا تُعتبر تقييمًا دراسيًا رسميًا.`,
          { icon: "📊", tone: "notice--demo" }
        )}
      </section>

      <section class="section">
        <button class="btn btn--danger" type="button" id="btn-reset">🗑️ إعادة ضبط تقدّم هذا الجهاز</button>
        <p class="card__body" style="font-size:.85rem">سيُحذف كل ما سبق نهائيًا من هذا المتصفح فقط.</p>
      </section>
    `;

    container.querySelector("#btn-reset")?.addEventListener("click", () => {
      const ok = window.confirm("هل تريد حذف كل تقدّمك من هذا الجهاز؟ لا يمكن التراجع.");
      if (!ok) return;
      resetProgress();
      showToast({ icon: "🗑️", text: "تمت إعادة الضبط. يمكنك البدء من جديد 🌱" });
      this.render(container);
    });
  },
};
