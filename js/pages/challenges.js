/**
 * صفحة «تحدي الأسبوع»: مهمة واقعية أسبوعية + قائمة بقية التحديات القابلة للتنفيذ.
 * خطوات التحدي تُحدَّد داخل الصفحة (حالة مؤقتة)، أما إنجاز التحدي فيُسجَّل في المتجر المحلي.
 */

import { challenges, getWeeklyChallenge, getWeekIndex } from "../data/challenges.js";
import { completeChallenge, uncompleteChallenge, isChallengeDone } from "../store.js";
import { pageHead, notice, nf, fmtDate } from "../components/ui.js";
import { showToast, celebrate, announceBadges } from "../components/toast.js";

export default {
  key: "challenges",
  async render(container) {
    const weekly = getWeeklyChallenge();
    let currentId = weekly.id;
    /** حالة الخطوات المُنجزة: { [challengeId]: Set(stepIndex) } */
    const checked = {};

    container.innerHTML = `
      ${pageHead({
        badge: "🎯 تحدي الأسبوع",
        title: "مهمة صغيرة… أثرٌ كبير",
        sub: "كل أسبوع يظهر هنا تحدي واقعي ينفّذه الطفل في المدرسة أو المنزل. نفّذه بمساعدة معلّمه أو ولي أمره، ثم علّم خطواته واحدة واحدة.",
      })}

      <div id="ch-detail"></div>

      <section class="section">
        <h2 class="section__title">كل التحديات الوطنية</h2>
        <p class="section__sub">اختر أي تحدي لعرض خطواته. كل تحدي منفَّذ = نقاط وشارة.</p>
        <div class="grid grid--2" id="ch-list" style="margin-top:16px"></div>
      </section>

      <section class="section">
        ${notice(
          "⚠️ يُنفَّذ التحدي دائمًا تحت إشراف معلّم أو ولي أمر، ولا يُشارك الطفل أي صور أو بيانات على الإنترنت أثناء التنفيذ.",
          { icon: "🛡️" }
        )}
      </section>
    `;

    const detailEl = container.querySelector("#ch-detail");
    const listEl = container.querySelector("#ch-list");

    function renderDetail() {
      const ch = challenges.find((c) => c.id === currentId) || weekly;
      const isWeekly = ch.id === weekly.id;
      const done = isChallengeDone(ch.id);
      const set = (checked[ch.id] ||= new Set());
      const doneSteps = set.size;

      detailEl.innerHTML = `
        <article class="card card--green challenge-hero">
          <div>
            ${isWeekly ? `<span class="tag tag--gold">🌟 تحدي الأسبوع — الدورة ${nf.format(getWeekIndex() + 1)}</span>` : `<span class="tag">📌 تحدٍّ متاح دائمًا</span>`}
            <h2 class="sim-card__title" style="margin-top:10px">${ch.icon} ${ch.title}</h2>
            <p class="card__body">${ch.brief}</p>
            <div class="challenge-meta">
              <span class="tag">⏱️ ${ch.time}</span>
              <span class="tag">📊 المستوى: ${ch.difficulty}</span>
              <span class="tag tag--gold">⭐ ${nf.format(ch.points)} نقطة عند الإتمام</span>
              ${done ? `<span class="tag tag--gold">✅ أنجزتَ هذا التحدي</span>` : ""}
            </div>
          </div>

          <div>
            <div class="progress-meta">
              <span>الخطوات</span>
              <span>${nf.format(doneSteps)} من ${nf.format(ch.steps.length)}</span>
            </div>
            <ol class="steps">
              ${ch.steps
                .map(
                  (step, i) => `
                  <li class="step ${set.has(i) ? "step--done" : ""}">
                    <span class="step__num">${set.has(i) ? "✔" : nf.format(i + 1)}</span>
                    <span class="step__label">${step}</span>
                    <button class="step__check" type="button" data-step="${i}"
                            aria-label="${set.has(i) ? "إلغاء إشارة" : "علّم"} الخطوة ${nf.format(i + 1)}">
                      ${set.has(i) ? "✅" : "⬜"}
                    </button>
                  </li>`
                )
                .join("")}
            </ol>
          </div>

          <div class="tip-box">
            <span class="tip-box__icon" aria-hidden="true">💡</span>
            <div>
              <span class="tip-box__label">نصائح المعلّم/ولي الأمر:</span>
              <ul style="margin:6px 0 0; padding-inline-start:18px">
                ${ch.tip.map((t) => `<li>${t}</li>`).join("")}
              </ul>
            </div>
          </div>

          <div class="feedback__actions">
            ${
              done
                ? `<button class="btn btn--ghost" type="button" id="btn-undo">↩️ إلغاء إنجاز التحدي</button>`
                : `<button class="btn btn--gold btn--lg" type="button" id="btn-done">🎉 أنهيت التحدي!</button>`
            }
            ${isWeekly ? "" : `<a class="btn btn--soft" href="#/challenges">↩️ عودة لتحدي الأسبوع</a>`}
          </div>
          <p class="card__body" style="margin:0;font-size:.85rem">
            تاريخ اليوم: ${fmtDate(new Date())}
          </p>
        </article>`;

      detailEl.querySelectorAll(".step__check").forEach((btn) => {
        btn.addEventListener("click", () => {
          const i = Number(btn.dataset.step);
          if (set.has(i)) set.delete(i);
          else set.add(i);
          renderDetail();
        });
      });

      detailEl.querySelector("#btn-done")?.addEventListener("click", () => {
        const res = completeChallenge(ch.id, ch.points);
        if (res.firstTime) {
          showToast({ icon: "🏅", text: `أنجزتَ التحدي: ${ch.title} — +${nf.format(res.pointsGained)} نقطة`, tone: "gold" });
          celebrate();
          announceBadges(res.newlyUnlocked);
        }
        renderDetail();
        renderList();
      });

      detailEl.querySelector("#btn-undo")?.addEventListener("click", () => {
        uncompleteChallenge(ch.id);
        showToast({ icon: "↩️", text: "تم إلغاء إنجاز التحدي من هذا الجهاز." });
        renderDetail();
        renderList();
      });
    }

    function renderList() {
      listEl.innerHTML = challenges
        .map((ch) => {
          const done = isChallengeDone(ch.id);
          return `
            <button class="challenge-list-item" type="button" data-id="${ch.id}">
              <span class="challenge-list-item__icon" aria-hidden="true">${ch.icon}</span>
              <span>
                <span class="challenge-list-item__title">${ch.title}</span><br>
                <span class="challenge-list-item__meta">${ch.difficulty} · ${ch.time} · ⭐ ${nf.format(ch.points)}</span>
              </span>
              <span class="challenge-list-item__state" aria-hidden="true">${done ? "✅" : "➡️"}</span>
            </button>`;
        })
        .join("");

      listEl.querySelectorAll(".challenge-list-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          currentId = btn.dataset.id;
          renderDetail();
          detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }

    renderDetail();
    renderList();
  },
};
