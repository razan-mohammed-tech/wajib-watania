/**
 * صفحة «محاكي القرار الوطني»: مواقف متعددة الخيارات مع تغذية راجعة فورية.
 * الجلسة الحالية تديرها الصفحة محليًا (لا تُحفظ إلا عند الحل النهائي للموقف).
 */

import { scenarios, categories } from "../data/scenarios.js";
import { recordScenarioChoice } from "../store.js";
import { pageHead, progressBar, nf } from "../components/ui.js";
import { showToast, announceBadges } from "../components/toast.js";

const LETTERS = ["أ", "ب", "ج", "د"];

export default {
  key: "simulator",
  async render(container) {
    container.innerHTML = `
      ${pageHead({
        badge: "🧭 محاكي القرار الوطني",
        title: "ماذا تفعل في هذه الموقف؟",
        sub: "اقرأ الموقف بعين الطفل، ثم اختر ما تراه صوابًا. ستظهر لك تغذية راجعة فورية تشرح لماذا — ولا بأس أبدًا بالخطأ، فهو جزء من التعلّم.",
      })}

      <div class="notice" style="margin-bottom:18px">
        <span class="notice__icon">💡</span>
        <span>اختر المحور الذي تريد التدرّب عليه، أو ابدأ بالكل. الإجابة الصحيحة من المحاولة الأولى = ١٠ نقاط، وبعد محاولة إضافية = ٥ نقاط.</span>
      </div>

      <div class="filters" id="sim-filters" role="group" aria-label="تصفية حسب المحور"></div>
      <div class="sim-layout" id="sim-area"></div>
    `;

    const filtersEl = container.querySelector("#sim-filters");
    const areaEl = container.querySelector("#sim-area");

    /** حالة الجلسة الحالية (داخل الصفحة فقط). */
    let activeCategory = "الكل";
    let queue = [];
    let index = 0;
    let tries = 0;
    const solvedInSession = new Set();

    function buildQueue() {
      queue =
        activeCategory === "الكل"
          ? [...scenarios]
          : scenarios.filter((s) => s.category === activeCategory);
      index = 0;
      tries = 0;
    }

    function renderFilters() {
      const all = ["الكل", ...categories];
      filtersEl.innerHTML = all
        .map(
          (c) => `
          <button class="chip" type="button" data-cat="${c}" aria-pressed="${c === activeCategory}">
            ${c === "الكل" ? "🌟 الكل" : c}
          </button>`
        )
        .join("");

      filtersEl.querySelectorAll(".chip").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeCategory = btn.dataset.cat;
          buildQueue();
          renderFilters();
          renderCard();
        });
      });
    }

    function renderCard() {
      const scenario = queue[index];
      if (!scenario) {
        renderSummary();
        return;
      }

      areaEl.innerHTML = `
        <article class="card sim-card">
          ${progressBar(
            ((index) / queue.length) * 100,
            `الموقف ${nf.format(index + 1)} من ${nf.format(queue.length)}`,
            activeCategory === "الكل" ? "كل المحاور" : activeCategory
          )}

          <div class="sim-card__head" style="margin-top:18px">
            <span class="sim-card__emoji" aria-hidden="true">${scenario.icon}</span>
            <div>
              <span class="tag">${scenario.category}</span>
              <h2 class="sim-card__title">${scenario.title}</h2>
            </div>
          </div>

          <p class="sim-scenario-text">${scenario.situation}</p>

          <div class="options" id="sim-options">
            ${scenario.options
              .map(
                (opt, i) => `
                <button class="option" type="button" data-index="${i}">
                  <span class="option__mark" aria-hidden="true">${LETTERS[i]}</span>
                  <span>${opt.text}</span>
                </button>`
              )
              .join("")}
          </div>

          <div id="sim-feedback"></div>
        </article>
      `;

      areaEl.querySelectorAll(".option").forEach((btn) => {
        btn.addEventListener("click", () => choose(Number(btn.dataset.index)));
      });
    }

    function choose(optionIndex) {
      const scenario = queue[index];
      tries += 1;
      const result = recordScenarioChoice(scenario, optionIndex, tries);
      const isCorrect = scenario.options[optionIndex].correct;

      if (isCorrect) solvedInSession.add(scenario.id);

      // تلوين الخيارات
      areaEl.querySelectorAll(".option").forEach((btn) => {
        const i = Number(btn.dataset.index);
        btn.disabled = true;
        btn.classList.add("option--dim");
        if (scenario.options[i].correct) {
          btn.classList.remove("option--dim");
          btn.classList.add("option--correct");
          btn.querySelector(".option__mark").textContent = "✔";
        }
        if (i === optionIndex && !isCorrect) {
          btn.classList.remove("option--dim");
          btn.classList.add("option--wrong");
          btn.querySelector(".option__mark").textContent = "✖";
        }
      });

      if (result.pointsGained > 0) {
        showToast({ icon: "⭐", text: `أحسنت! أضفنا ${nf.format(result.pointsGained)} نقطة إلى رصيدك.` });
      }
      announceBadges(result.newlyUnlocked);

      const canRetry = !isCorrect && tries < 2;
      const isLast = index === queue.length - 1;

      areaEl.querySelector("#sim-feedback").innerHTML = `
        <div class="feedback ${isCorrect ? "feedback--good" : "feedback--bad"}">
          <p class="feedback__head">
            ${isCorrect ? "🎉 قرارٌ صحيح" : "🤔 قرارٌ يحتاج تفكيرًا"}
          </p>
          <p class="feedback__body">${scenario.options[optionIndex].feedback}</p>

          <div class="tip-box">
            <span class="tip-box__icon" aria-hidden="true">💡</span>
            <span><span class="tip-box__label">القاعدة الذهبية:</span> ${scenario.tip}</span>
          </div>

          <div class="feedback__actions">
            ${
              canRetry
                ? `<button class="btn btn--primary btn--sm" type="button" id="btn-retry">🔁 حاول مرة أخرى</button>
                   <button class="btn btn--ghost btn--sm" type="button" id="btn-reveal">أرِني الإجابة الصحيحة</button>`
                : ""
            }
            ${
              !canRetry
                ? `<button class="btn btn--gold" type="button" id="btn-next">
                     ${isLast ? "🏆 شاهد النتيجة" : "الموقف التالي ➡️"}
                   </button>`
                : ""
            }
          </div>
        </div>`;

      areaEl.querySelector("#btn-retry")?.addEventListener("click", () => {
        // نحتفظ بعدد المحاولات حتى تنعكس على النقاط (٥ نقاط بعد محاولة إضافية).
        renderCard();
      });

      areaEl.querySelector("#btn-reveal")?.addEventListener("click", () => {
        areaEl.querySelectorAll(".option").forEach((btn) => {
          const i = Number(btn.dataset.index);
          if (scenario.options[i].correct) {
            btn.classList.remove("option--dim", "option--wrong");
            btn.classList.add("option--correct");
            btn.querySelector(".option__mark").textContent = "✔";
          }
        });
        areaEl.querySelector("#sim-feedback").innerHTML = `
          <div class="feedback feedback--good">
            <p class="feedback__head">✅ هذا هو القرار الصحيح</p>
            <p class="feedback__body">${scenario.options.find((o) => o.correct).feedback}</p>
            <div class="tip-box">
              <span class="tip-box__icon" aria-hidden="true">💡</span>
              <span><span class="tip-box__label">القاعدة الذهبية:</span> ${scenario.tip}</span>
            </div>
            <div class="feedback__actions">
              <button class="btn btn--gold" type="button" id="btn-next">
                ${isLast ? "🏆 شاهد النتيجة" : "الموقف التالي ➡️"}
              </button>
            </div>
          </div>`;
        bindNext();
      });

      bindNext();
    }

    function bindNext() {
      areaEl.querySelector("#btn-next")?.addEventListener("click", () => {
        index += 1;
        tries = 0;
        renderCard();
      });
    }

    function renderSummary() {
      const solved = solvedInSession.size;
      const total = queue.length;
      const rate = total ? Math.round((solved / total) * 100) : 0;

      const emoji = rate === 100 ? "🏆" : rate >= 60 ? "🌟" : rate > 0 ? "🌱" : "🧭";
      const message =
        rate === 100
          ? "ممتاز! أنت قرّار وطنّي متمرّس. جرّب الآن تحدي الأسبوع لتطبّق ما تعلّمته في الواقع."
          : rate >= 60
          ? "أداء رائع! أعد الجولة لتحسين نتيجتك أو انتقل إلى التحدي العملي."
          : "بداية جميلة! التعلّم يبدأ من المحاولة، أعد الجولة وستلاحظ الفرق.";

      areaEl.innerHTML = `
        <article class="card sim-summary">
          <div class="sim-summary__emoji" aria-hidden="true">${emoji}</div>
          <h2 class="sim-card__title">نتيجة الجولة</h2>
          <p class="sim-summary__score">${nf.format(solved)} / ${nf.format(total)}</p>
          <p class="card__body">${message}</p>
          <p class="card__body"><b>نسبة الإتقان:</b> ${nf.format(rate)}٪</p>
          <div class="feedback__actions" style="justify-content:center">
            <button class="btn btn--primary" type="button" id="btn-restart">🔄 أعد الجولة</button>
            <a class="btn btn--gold" href="#/challenges">🎯 إلى تحدي الأسبوع</a>
            <a class="btn btn--ghost" href="#/achievements">🏅 سجل الإنجاز</a>
          </div>
        </article>`;

      areaEl.querySelector("#btn-restart")?.addEventListener("click", () => {
        solvedInSession.clear();
        buildQueue();
        renderCard();
      });
    }

    // البدء
    buildQueue();
    renderFilters();
    renderCard();
  },
};
