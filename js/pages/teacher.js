/**
 * صفحة «لوحة المعلّمة»: عرض تجريبي للبيانات التراكمية + إحصاء حقيقي لهذا الجهاز.
 * ⚠️ كل الأرقام في قسم «بيانات العرض التجريبية» مختلقة للعرض فقط، وليست نتائج حقيقية.
 */

import { demoNoticeText } from "../data/site.js";
import { scenarios, categories } from "../data/scenarios.js";
import { challenges } from "../data/challenges.js";
import { badges } from "../data/badges.js";
import { teacherSettingsLabels, defaultTeacherSettings } from "../data/teacher.js";
import {
  getDeviceStats,
  getCategoryBreakdown,
  resetProgress,
  getTeacherSettings,
  saveTeacherSettings,
  resetTeacherSettings,
} from "../store.js";
import { pageHead, statCard, chartRow, notice, nf, escapeHtml } from "../components/ui.js";
import { showToast } from "../components/toast.js";

/* بيانات العرض التجريبية — لا تمثّل طلابًا حقيقيين ولا نتائج فعلية */
const demoClass = {
  participants: 24,
  avgPoints: 68,
  simulatorCompletion: 76,
  challengesDone: 41,
  indicators: [
    { label: "الوعي الرقمي", value: 82 },
    { label: "التحقق من الأخبار", value: 71 },
    { label: "السلامة", value: 74 },
    { label: "التعاون", value: 88 },
    { label: "حماية الممتلكات العامة", value: 69 },
  ],
  perCategory: categories.map((cat, i) => ({
    label: cat,
    value: [71, 74, 88, 69, 73, 80][i] ?? 70,
  })),
};

export default {
  key: "teacher",
  async render(container) {
    const stats = getDeviceStats();
    const breakdown = getCategoryBreakdown();
    const settings = getTeacherSettings();

    container.innerHTML = `
      ${pageHead({
        badge: "👩‍🏫 لوحة المعلّمة",
        title: "ملخّص المبادرة ومؤشرات التعلّم",
        sub: "لوحة عرض تساعد المعلّمة على متابعة المبادرة داخل الفصل، وفهم شكل البيانات قبل تطبيقها مع الطلاب.",
      })}

      <div class="identity-strip" aria-label="المشرفون على المبادرة">
        <span class="identity-strip__item">
          👩‍🏫 <span class="identity-strip__label">المعلمة:</span> ${escapeHtml(settings.teacherName) || "غير محدّدة"}
        </span>
        <span class="identity-strip__item">
          🏫 <span class="identity-strip__label">مديرة المدرسة:</span> ${escapeHtml(settings.principalName) || "غير محدّدة"}
        </span>
        ${
          settings.schoolName
            ? `<span class="identity-strip__item">🎓 <span class="identity-strip__label">المدرسة:</span> ${escapeHtml(settings.schoolName)}</span>`
            : ""
        }
      </div>

      <section class="section" style="margin-top:0">
        <div class="card card--green">
          <div class="card__icon">⚙️</div>
          <h2 class="card__title">إعدادات المعلمة</h2>
          <p class="card__body">
            تُحدَّد هنا أسماء المشرفين على المبادرة لعرضها في هذه اللوحة فقط.
            تُحفظ التعديلات في <b>متصفح هذا الجهاز</b> ولا تُرسل إلى أي خادم، ولا تُجمع أي بيانات عن الطلاب.
          </p>

          <div class="grid grid--2" style="margin-top:16px">
            <div>
              <div class="field">
                <label class="field__label" for="set-teacher">${teacherSettingsLabels.teacherName}</label>
                <input class="input" id="set-teacher" type="text" maxlength="60"
                       value="${escapeHtml(settings.teacherName)}" placeholder="اكتب اسم المعلمة">
              </div>

              <div class="field">
                <label class="field__label" for="set-principal">${teacherSettingsLabels.principalName}</label>
                <input class="input" id="set-principal" type="text" maxlength="60"
                       value="${escapeHtml(settings.principalName)}" placeholder="اكتب اسم مديرة المدرسة">
              </div>

              <div class="field">
                <label class="field__label" for="set-school">${teacherSettingsLabels.schoolName}</label>
                <input class="input" id="set-school" type="text" maxlength="60"
                       value="${escapeHtml(settings.schoolName)}" placeholder="مثال: مدرسة الأندلس الابتدائية">
                <span class="field__hint">يمكن تركه فارغًا، عندها لن يظهر في الشريط أعلاه.</span>
              </div>
            </div>

            <div>
              <div class="notice">
                <span class="notice__icon">🔒</span>
                <span>
                  هذه الحقول تخصّ الكبار (المعلمة/المديرة) ولا تُستخدم لجمع أي بيانات عن الأطفال،
                  ولا اسم طالب ولا صورة ولا رقم ولا موقع.
                </span>
              </div>

              <div class="feedback__actions" style="margin-top:16px">
                <button class="btn btn--primary" type="button" id="btn-save-settings">💾 حفظ الإعدادات</button>
                <button class="btn btn--ghost" type="button" id="btn-reset-settings">↩️ استعادة الافتراضي</button>
              </div>

              <p class="card__body" style="font-size:.85rem;margin-top:14px">
                القيم الافتراضية الحالية: المعلمة «${defaultTeacherSettings.teacherName}» ·
                المديرة «${defaultTeacherSettings.principalName}» — ويمكن تغييرها من ملف
                <code>js/data/teacher.js</code>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="section" style="margin-top:8px">
        ${notice(`<b>تنويه مهم:</b> ${demoNoticeText}`, { icon: "⚠️", tone: "notice--demo" })}
      </section>

      <section class="section">
        <h2 class="section__title">📊 بيانات العرض التجريبية (غير حقيقية)</h2>
        <p class="section__sub">أرقام مختلقة لتوضيح شكل اللوحة فقط.</p>
        <div class="grid grid--4" style="margin-top:16px">
          ${statCard(nf.format(demoClass.participants), "مشارك (تجريبي)")}
          ${statCard(nf.format(demoClass.avgPoints), "متوسط النقاط (تجريبي)")}
          ${statCard(`${nf.format(demoClass.simulatorCompletion)}٪`, "إكمال المحاكاة (تجريبي)")}
          ${statCard(nf.format(demoClass.challengesDone), "تحديًا منجزًا (تجريبي)")}
        </div>
      </section>

      <section class="section grid grid--2">
        <div class="card">
          <h3 class="card__title">مؤشرات التعلّم (تجريبية)</h3>
          <p class="card__body">نسبة التقاط الطلاب لمهارات كل محور بعد الممارسة.</p>
          <div class="chart" style="margin-top:14px">
            ${demoClass.indicators.map((r) => chartRow(r.label, r.value)).join("")}
          </div>
        </div>

        <div class="card">
          <h3 class="card__title">توزّع المحاور (تجريبي)</h3>
          <p class="card__body">نسبة الطلاب الذين جرّبوا مواقف كل محور.</p>
          <div class="chart" style="margin-top:14px">
            ${demoClass.perCategory.map((r) => chartRow(r.label, r.value, "gold")).join("")}
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">📱 إحصاء هذا الجهاز (حقيقي، محفوظ محليًا)</h2>
        <p class="section__sub">
          هذه الأرقام مأخوذة من متصفح الجهاز الذي تتصفحه الآن فقط، ولا تمثّل فصلًا كاملًا.
        </p>
        <div class="grid grid--4" style="margin-top:16px">
          ${statCard(nf.format(stats.points), "نقاط هذا الجهاز")}
          ${statCard(`${nf.format(stats.scenariosSolved)} / ${nf.format(scenarios.length)}`, "مواقف محلولة")}
          ${statCard(`${nf.format(stats.accuracy)}٪`, "دقة الإجابات")}
          ${statCard(`${nf.format(stats.challengesDone)} / ${nf.format(challenges.length)}`, "تحديات منجزة")}
        </div>

        ${
          stats.scenariosStarted
            ? `<div class="card" style="margin-top:18px">
                <h3 class="card__title">أداؤك حسب المحور (هذا الجهاز)</h3>
                <div class="chart" style="margin-top:14px">
                  ${Object.entries(breakdown)
                    .map(([cat, v]) =>
                      chartRow(cat, Math.round((v.solved / Math.max(1, v.total)) * 100), "gold")
                    )
                    .join("")}
                </div>
              </div>`
            : `<div class="card card--green" style="margin-top:18px">
                <h3 class="card__title">لا توجد بيانات بعد على هذا الجهاز</h3>
                <p class="card__body">جرّب <a href="#/simulator">محاكي القرار الوطني</a> بعدها ستظهر هنا إحصاءاتك الحقيقية.</p>
              </div>`
        }
      </section>

      <section class="section grid grid--2">
        <div class="card card--green">
          <h3 class="card__title">🧭 استخدام المبادرة في حصة واحدة</h3>
          <ol class="num-list" style="margin-top:12px">
            <li>٥ دقائق: افتتاحية + قراءة موقف واحد بصوت عالٍ.</li>
            <li>٥ دقائق: تصويت الطلاب بين الخيارات ومناقشة سريعة.</li>
            <li>١٠ دقائق: طرح التحدي الأسبوعي وشرح خطواته.</li>
            <li>١٠ دقائق: نشاط تطبيقي داخل الفصل (شكر/تنظيف/ترشيد).</li>
            <li>٥ دقائق: ختام بسؤال: «ماذا سأفعل غدًا بشكل مختلف؟»</li>
          </ol>
        </div>

        <div class="card">
          <h3 class="card__title">🎯 رموز المبادرة</h3>
          <ul class="check-list" style="margin-top:12px">
            <li>${nf.format(scenarios.length)} موقفًا تفاعليًا قابلًا للإضافة بسهولة.</li>
            <li>${nf.format(challenges.length)} تحديات وطنية قابلة للتنفيذ.</li>
            <li>${nf.format(badges.length)} شارات تعليمية + ${nf.format(4)} مستويات تقدّم.</li>
            <li>المحتوى منفصل عن الواجهة في مجلد <code>js/data/</code> — عدّله بسهولة.</li>
          </ul>
          <button class="btn btn--danger btn--sm" type="button" id="btn-reset" style="margin-top:16px">
            🗑️ إعادة ضبط بيانات هذا الجهاز
          </button>
        </div>
      </section>
    `;

    container.querySelector("#btn-reset")?.addEventListener("click", () => {
      if (window.confirm("سيُحذف تقدّم هذا الجهاز بالكامل. هل تريد المتابعة؟")) {
        resetProgress();
        showToast({ icon: "🗑️", text: "تمت إعادة الضبط على هذا الجهاز." });
        this.render(container);
      }
    });

    /* --- حفظ/استعادة إعدادات المعلمة --- */
    container.querySelector("#btn-save-settings")?.addEventListener("click", () => {
      const teacherName = container.querySelector("#set-teacher").value.trim();
      const principalName = container.querySelector("#set-principal").value.trim();
      const schoolName = container.querySelector("#set-school").value.trim();

      saveTeacherSettings({ teacherName, principalName, schoolName });
      showToast({ icon: "💾", text: "تم حفظ الإعدادات على هذا الجهاز.", tone: "gold" });
      this.render(container);
    });

    container.querySelector("#btn-reset-settings")?.addEventListener("click", () => {
      if (!window.confirm("هل تريد استعادة الأسماء الافتراضية للإعدادات؟")) return;
      resetTeacherSettings();
      showToast({ icon: "↩️", text: "تمت استعادة الإعدادات الافتراضية." });
      this.render(container);
    });
  },
};
