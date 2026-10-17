/**
 * نقطة الدخول + الراوتر (يعتمد على hash حتى يعمل على أي استضافة ثابتة).
 * كل صفحة تُصدّر: { key, badge, title, sub, render(container) }
 */

import "./components/site-header.js";
import "./components/site-footer.js";

import homePage from "./pages/home.js";
import simulatorPage from "./pages/simulator.js";
import challengesPage from "./pages/challenges.js";
import achievementsPage from "./pages/achievements.js";
import teacherPage from "./pages/teacher.js";
import aboutPage from "./pages/about.js";

const pages = {
  home: homePage,
  simulator: simulatorPage,
  challenges: challengesPage,
  achievements: achievementsPage,
  teacher: teacherPage,
  about: aboutPage,
};

const main = document.getElementById("main");

function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, "").trim();
  return pages[hash] ? hash : "home";
}

async function render() {
  const key = parseRoute();
  const page = pages[key];

  main.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.className = "container page-enter";
  main.appendChild(wrapper);

  try {
    await page.render(wrapper);
  } catch (err) {
    console.error("خطأ في عرض الصفحة:", err);
    wrapper.innerHTML = `
      <div class="card card--gold">
        <h2 class="card__title">حدث خطأ أثناء العرض 🙈</h2>
        <p class="card__body">لا تقلق، حاول تحديث الصفحة أو ارجع إلى <a href="#/">الرئيسية</a>.</p>
      </div>`;
  }

  document.dispatchEvent(new CustomEvent("routechange", { detail: { key } }));
  window.scrollTo({ top: 0, behavior: "auto" });
  main.focus({ preventScroll: true });
}

let booted = false;
function boot() {
  if (booted) return;
  booted = true;
  render();
}

window.addEventListener("hashchange", render);

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
