/**
 * شارات «واجب مواطنة».
 * لإضافة شارة: أضف كائنًا جديدًا بـ test(state) تُرجع true عند استحقاقها.
 * state هو كائن التقدم: { scenarios: {id:{...}}, challenges: {id:{...}}, points }
 */

function scenarioEntries(state) {
  return Object.values(state.scenarios || {});
}

export const badges = [
  {
    id: "first-step",
    icon: "🌱",
    name: "أول خطوة",
    desc: "أكملتَ أول موقف تفاعلي في محاكي القرار.",
    test: (state) => scenarioEntries(state).length >= 1,
  },
  {
    id: "news-pro",
    icon: "🔍",
    name: "خبير التحقق",
    desc: "أجبتَ إجابة صحيحة في ٣ مواقف من محور «التحقق من الأخبار».",
    test: (state) =>
      scenarioEntries(state).filter((s) => s.correct && s.category === "التحقق من الأخبار").length >= 3,
  },
  {
    id: "safe-guard",
    icon: "🛡️",
    name: "حارس الأمان",
    desc: "أكملتَ موقعي محور «السلامة» بنجاح.",
    test: (state) =>
      scenarioEntries(state).filter((s) => s.correct && s.category === "السلامة").length >= 2,
  },
  {
    id: "team-spirit",
    icon: "🤝",
    name: "روح الفريق",
    desc: "أكملتَ موقعي محور «التعاون» بنجاح.",
    test: (state) =>
      scenarioEntries(state).filter((s) => s.correct && s.category === "التعاون").length >= 2,
  },
  {
    id: "first-challenge",
    icon: "🏅",
    name: "منجز التحدي",
    desc: "أنجزتَ تحديًا وطنيًا واحدًا على الأقل.",
    test: (state) => Object.keys(state.challenges || {}).length >= 1,
  },
  {
    id: "half-hero",
    icon: "⭐",
    name: "نصف البطل",
    desc: "جمعتَ ٦٠ نقطة من المواقف والتحديات.",
    test: (state) => (state.points || 0) >= 60,
  },
  {
    id: "true-citizen",
    icon: "👑",
    name: "بطل واجب المواطنة",
    desc: "أكملتَ ٨ مواقف وأنجزتَ ٣ تحديات وطنية.",
    test: (state) =>
      scenarioEntries(state).length >= 8 && Object.keys(state.challenges || {}).length >= 3,
  },
];

/** مستويات التقدّم مرتبة تصاعديًا حسب النقاط. */
export const levels = [
  { min: 0,   name: "مستكشف وطن",        icon: "🧭" },
  { min: 30,  name: "حارس الأمان",       icon: "🛡️" },
  { min: 60,  name: "سفير التعاون",      icon: "🤝" },
  { min: 100, name: "بطل واجب المواطنة", icon: "⭐" },
];

/** يُرجع المستوى الحالي والمستوى التالي ونسبة التقدّم إليه. */
export function getLevel(points = 0) {
  let index = 0;
  for (let i = 0; i < levels.length; i++) {
    if (points >= levels[i].min) index = i;
  }
  const current = levels[index];
  const next = levels[index + 1] || null;
  const progress = next
    ? Math.min(100, Math.round(((points - current.min) / (next.min - current.min)) * 100))
    : 100;
  return { current, next, progress };
}
