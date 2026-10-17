/**
 * صفحة «عن المبادرة»: الرؤية، الرسالة، الأهداف، وطريقة التطبيق في الفصل والكشافة.
 */

import { vision, goals, classPlan, scoutPlan, privacyNotice, footerText } from "../data/site.js";
import { scenarios } from "../data/scenarios.js";
import { challenges } from "../data/challenges.js";
import { badges } from "../data/badges.js";
import { pageHead, notice, nf } from "../components/ui.js";

export default {
  key: "about",
  async render(container) {
    container.innerHTML = `
      ${pageHead({
        badge: "🇸🇦 عن المبادرة",
        title: "واجب مواطنة",
        sub: "مبادرة تعليمية تفاعلية لطلاب المرحلة الابتدائية في المملكة العربية السعودية، تُحوّل القيم الوطنية إلى قرارات سلوكية صغيرة يعيشها الطفل كل يوم.",
      })}

      <section class="section grid grid--2">
        <div class="card card--green">
          <div class="card__icon">🔭</div>
          <h2 class="card__title">الرؤية</h2>
          <p class="card__body">${vision.vision}</p>
        </div>
        <div class="card card--gold">
          <div class="card__icon">📣</div>
          <h2 class="card__title">الرسالة</h2>
          <p class="card__body">${vision.mission}</p>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">أهداف المبادرة</h2>
        <ul class="check-list" style="margin-top:14px">
          ${goals.map((g) => `<li>${g}</li>`).join("")}
        </ul>
      </section>

      <section class="section">
        <h2 class="section__title">كيف تُطبَّق المبادرة داخل الفصل 🏫</h2>
        <p class="section__sub">خطة مقترحة لحصة نشاط أسبوعية لا تتجاوز ٣٠ دقيقة.</p>
        <ol class="num-list" style="margin-top:16px">
          ${classPlan.map((s) => `<li>${s}</li>`).join("")}
        </ol>
      </section>

      <section class="section">
        <h2 class="section__title">كيف تُطبَّق المبادرة في الكشافة ⚜️</h2>
        <p class="section__sub">خطة مقترحة للتطبيق ضمن نشاط الدورية وعهدها.</p>
        <ol class="num-list" style="margin-top:16px">
          ${scoutPlan.map((s) => `<li>${s}</li>`).join("")}
        </ol>
      </section>

      <section class="section">
        <h2 class="section__title">مكوّنات المبادرة الرقمية</h2>
        <div class="grid grid--3" style="margin-top:16px">
          <div class="card">
            <div class="card__icon">🧭</div>
            <h3 class="card__title">محاكي القرار الوطني</h3>
            <p class="card__body">
              ${nf.format(scenarios.length)} مواقف واقعية موزّعة على ستة محاور:
              التحقق من الأخبار، الوعي الرقمي، السلامة، التعاون، حماية الممتلكات العامة، وحب الوطن.
            </p>          </div>
          <div class="card">
            <div class="card__icon">🎯</div>
            <h3 class="card__title">تحدي الأسبوع</h3>
            <p class="card__body">
              ${nf.format(challenges.length)} تحديات عملية ينفّذها الطفل في المدرسة أو المنزل،
              يدور تحدٍّ جديد تلقائيًا كل أسبوع.
            </p>
          </div>
          <div class="card">
            <div class="card__icon">🏅</div>
            <h3 class="card__title">سجل الإنجاز</h3>
            <p class="card__body">
              ${nf.format(badges.length)} شارات و${nf.format(4)} مستويات تقدّم تحفّز الطفل على الاستمرار،
              وتُحفظ على جهازه دون أي بيانات شخصية.
            </p>
          </div>
        </div>
      </section>

      <section class="section">
        ${notice(`<b>${privacyNotice.title}:</b> ${privacyNotice.text}`, { icon: "🔒" })}
      </section>

      <section class="section">
        ${notice(
          `<b>إخلاء مسؤولية وتوضيح:</b> ${vision.note} كما أن هذه المبادرة نموذج تعليمي تجريبي غير تابع لجهة رسمية،
           وكل ما يظهر في «لوحة المعلمة» من أرقام هو بيانات عرض تجريبية غير حقيقية، ولا يُحفظ أي شيء في قاعدة بيانات.`,
          { icon: "📌", tone: "notice--demo" }
        )}
      </section>

      <section class="section">
        <div class="card">
          <h3 class="card__title">هل تريد تعديل المحتوى؟ ✏️</h3>
          <p class="card__body">${footerText.about}</p>
          <p class="card__body">
            كل النصوص والمواقف والتحديات مخزّنة في مجلد <code>js/data/</code>
            (ملفات: <code>site.js</code> و<code>scenarios.js</code> و<code>challenges.js</code> و<code>badges.js</code>).
            يمكنك إضافة موقف أو تحدٍّ جديد بنسخ أي كائن موجود وتغيير نصوصه — دون لمس أكواد الواجهة.
          </p>
        </div>
      </section>
    `;
  },
};
