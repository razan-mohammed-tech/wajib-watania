/**
 * تنبيهات منبثقة (Toasts) + تأثير احتفال بسيط.
 * لا تجمع أي بيانات؛ تعمل داخل الصفحة فقط.
 */

const root = () => document.getElementById("toast-root");

/**
 * يعرض تنبيهًا منبثقًا.
 * @param {{icon?:string, text:string, tone?:'default'|'gold'}} opts
 */
export function showToast({ icon = "✅", text = "", tone = "default" } = {}) {
  const host = root();
  if (!host) return;

  const toast = document.createElement("div");
  toast.className = `toast ${tone === "gold" ? "toast--gold" : ""}`;
  toast.innerHTML = `<span class="toast__icon">${icon}</span><span>${text}</span>`;
  host.appendChild(toast);

  const remove = () => {
    toast.classList.add("is-leaving");
    setTimeout(() => toast.remove(), 320);
  };
  setTimeout(remove, 3200);
}

/** احتفال بسيط بألوان الهوية (مع احترام إعداد تقليل الحركة). */
export function celebrate(duration = 1600) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const layer = document.createElement("div");
  layer.className = "confetti";
  const colors = ["#12934f", "#17a55a", "#c9a227", "#d9b84a", "#ffffff"];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("span");
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDuration = `${900 + Math.random() * 900}ms`;
    piece.style.animationDelay = `${Math.random() * 300}ms`;
    piece.style.opacity = String(0.6 + Math.random() * 0.4);
    layer.appendChild(piece);
  }

  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), duration + 1200);
}

/** يعرض إشعارات الشارات الجديدة إن وُجدت. */
export function announceBadges(newlyUnlocked = []) {
  newlyUnlocked.forEach((badge, i) => {
    setTimeout(() => {
      showToast({ icon: badge.icon, text: `🎉 حصلتَ على شارة جديدة: ${badge.name}`, tone: "gold" });
      celebrate();
    }, i * 900);
  });
}
