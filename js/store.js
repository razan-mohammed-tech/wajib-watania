/**
 * طبقة الحالة (Store) — مسؤولة فقط عن قراءة/كتابة تقدّم الطفل على الجهاز.
 *
 * ملاحظات الخصوصية والتوضيح:
 *  • كل البيانات تُحفظ في localStorage داخل متصفح الجهاز الحالي فقط.
 *  • لا تُرسل أي بيانات إلى أي خادم، ولا يوجد قاعدة بيانات.
 *  • لا يحتوي التخزين على أي معلومات شخصية (لا اسم، لا صورة، لا موقع).
 *  • بيانات العرض في «لوحة المعلمة» تجريبية غير مرتبطة بهذه الحالة.
 */

import { badges } from "./data/badges.js";
import { defaultTeacherSettings } from "./data/teacher.js";

const STORAGE_KEY = "wajib-watania/v1";
const SETTINGS_KEY = "wajib-watania/teacher-settings-v1";

function createDefaultState() {
  return {
    version: 1,
    startedAt: new Date().toISOString(),
    points: 0,
    // scenarios: { [scenarioId]: { chosen, correct, tries, category, completedAt } }
    scenarios: {},
    // challenges: { [challengeId]: { completedAt } }
    challenges: {},
    // badges: [badgeId]
    badges: [],
  };
}

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw);
    return { ...createDefaultState(), ...parsed };
  } catch (err) {
    console.warn("تعذّر قراءة التقدّم المحفوظ، سيبدأ تقدّم جديد.", err);
    return createDefaultState();
  }
}

let state = readState();
const listeners = new Set();

function commit() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("تعذّر حفظ التقدّم محليًا (قد تكون التخزين معطّلًا).", err);
  }
  listeners.forEach((fn) => fn(state));
}

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ------------------------------------------------------------------
 * إجراءات محاكي القرار
 * ------------------------------------------------------------------ */

/**
 * يسجّل اختيار الطفل لموقف ما.
 * @returns {{ pointsGained:number, newlyUnlocked:string[], solved:boolean }}
 */
export function recordScenarioChoice(scenario, optionIndex, triesUsed) {
  const option = scenario.options[optionIndex];
  const already = state.scenarios[scenario.id];

  let pointsGained = 0;
  if (option.correct && !already?.correct) {
    // نقاط كاملة عند الحل من المحاولة الأولى، ونصف نقاط في المحاولة التالية.
    pointsGained = triesUsed <= 1 ? 10 : 5;
    state.points += pointsGained;
  }

  state.scenarios[scenario.id] = {
    chosen: optionIndex,
    correct: Boolean(option.correct),
    tries: triesUsed,
    category: scenario.category,
    completedAt: already?.completedAt || new Date().toISOString(),
  };

  const newlyUnlocked = unlockNewBadges();
  commit();
  return { pointsGained, newlyUnlocked, solved: option.correct };
}

function unlockNewBadges() {
  const fresh = [];
  for (const badge of badges) {
    if (!state.badges.includes(badge.id) && badge.test(state)) {
      state.badges.push(badge.id);
      fresh.push(badge);
    }
  }
  return fresh;
}

/* ------------------------------------------------------------------
 * إجراءات التحديات
 * ------------------------------------------------------------------ */

/** @returns {{ firstTime:boolean, pointsGained:number, newlyUnlocked:string[] }} */
export function completeChallenge(challengeId, points = 20) {
  const firstTime = !state.challenges[challengeId];
  let pointsGained = 0;

  if (firstTime) {
    state.challenges[challengeId] = { completedAt: new Date().toISOString() };
    pointsGained = points;
    state.points += points;
  }

  const newlyUnlocked = unlockNewBadges();
  commit();
  return { firstTime, pointsGained, newlyUnlocked };
}

export function uncompleteChallenge(challengeId) {
  if (state.challenges[challengeId]) {
    delete state.challenges[challengeId];
    commit();
  }
}

/* ------------------------------------------------------------------
 * استعلامات مفيدة
 * ------------------------------------------------------------------ */

export const getCompletedScenarioIds = () => Object.keys(state.scenarios);
export const getCompletedChallengeIds = () => Object.keys(state.challenges);

export function isScenarioSolved(id) {
  return Boolean(state.scenarios[id]?.correct);
}

export function isChallengeDone(id) {
  return Boolean(state.challenges[id]);
}

/** نسبة الإنجاز من مجموع المواقف والتحديات المتاحة. */
export function getOverallProgress(totalScenarios, totalChallenges) {
  const total = totalScenarios + totalChallenges;
  if (!total) return 0;
  const done = getCompletedScenarioIds().length + getCompletedChallengeIds().length;
  return Math.min(100, Math.round((done / total) * 100));
}

/** إحصاءات دقيقة للاستخدام في سجل الإنجاز ولوحة المعلمة (بيانات هذا الجهاز فقط). */
export function getDeviceStats() {
  const entries = Object.values(state.scenarios);
  const solved = entries.filter((s) => s.correct).length;
  return {
    points: state.points,
    scenariosStarted: entries.length,
    scenariosSolved: solved,
    accuracy: entries.length ? Math.round((solved / entries.length) * 100) : 0,
    challengesDone: Object.keys(state.challenges).length,
    badgesCount: state.badges.length,
    badgesTotal: badges.length,
    startedAt: state.startedAt,
  };
}

/** يُرجع توزيع المحاور التي عمل فيها الطفل (لرسمها في لوحة المعلمة). */
export function getCategoryBreakdown() {
  const map = {};
  for (const s of Object.values(state.scenarios)) {
    map[s.category] = map[s.category] || { total: 0, solved: 0 };
    map[s.category].total += 1;
    if (s.correct) map[s.category].solved += 1;
  }
  return map;
}

/* ------------------------------------------------------------------
 * إعادة الضبط
 * ------------------------------------------------------------------ */

export function resetProgress() {
  state = createDefaultState();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("تعذّر حذف التقدّم المحلي.", err);
  }
  commit();
}

/* ------------------------------------------------------------------
 * إعدادات المعلمة (بيانات محلية على الجهاز فقط)
 * ------------------------------------------------------------------ */

function readSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultTeacherSettings };
    return { ...defaultTeacherSettings, ...JSON.parse(raw) };
  } catch (err) {
    console.warn("تعذّر قراءة الإعدادات، ستُستخدم القيم الافتراضية.", err);
    return { ...defaultTeacherSettings };
  }
}

let teacherSettings = readSettings();

export function getTeacherSettings() {
  return { ...teacherSettings };
}

/** يحفظ الإعدادات على هذا الجهاز فقط (لا يُرسل شيء إلى أي خادم). */
export function saveTeacherSettings(patch = {}) {
  teacherSettings = { ...teacherSettings, ...patch };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(teacherSettings));
  } catch (err) {
    console.warn("تعذّر حفظ الإعدادات محليًا.", err);
  }
  listeners.forEach((fn) => fn(state));
  return getTeacherSettings();
}

/** يستعيد القيم الافتراضية من ملف البيانات. */
export function resetTeacherSettings() {
  teacherSettings = { ...defaultTeacherSettings };
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (err) {
    console.warn("تعذّر حذف الإعدادات المحلية.", err);
  }
  return getTeacherSettings();
}
