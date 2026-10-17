/**
 * ترويسة الموقع (Site Header) — مكوّن قابل لإعادة الاستخدام.
 * تعرض: الهوية + التنقّل + النقاط المحفوظة محليًا + زر القائمة للجوال.
 */

import { siteInfo, navItems } from "../data/site.js";
import { getState, subscribe } from "../store.js";
import { nf } from "./ui.js";

class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.render();
    this.unsub = subscribe(() => this.updatePoints());
    this.routeHandler = (e) => this.setActive(e.detail?.key);
    document.addEventListener("routechange", this.routeHandler);

    this.querySelector(".menu-toggle")?.addEventListener("click", () => {
      const nav = this.querySelector(".nav");
      const open = nav.classList.toggle("is-open");
      this.querySelector(".menu-toggle").setAttribute("aria-expanded", String(open));
    });

    // إغلاق القائمة عند اختيار رابط
    this.querySelectorAll(".nav__link").forEach((a) =>
      a.addEventListener("click", () => {
        this.querySelector(".nav")?.classList.remove("is-open");
        this.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "false");
      })
    );
  }

  disconnectedCallback() {
    this.unsub?.();
    document.removeEventListener("routechange", this.routeHandler);
  }

  render() {
    this.innerHTML = `
      <header class="site-header">
        <div class="container site-header__inner">
          <a class="brand" href="#/" aria-label="${siteInfo.name} — الصفحة الرئيسية">
            <span class="brand__logo brand__logo--img" aria-hidden="true">
              <img src="./assets/logo.png" alt="" loading="eager"
                   onerror="this.closest('.brand__logo').classList.remove('brand__logo--img'); this.remove();">
            </span>
            <span class="brand__text">
              <span class="brand__title">${siteInfo.name}</span>
              <span class="brand__tag">${siteInfo.tagline}</span>
            </span>
          </a>

          <button class="menu-toggle" aria-expanded="false" aria-controls="main-nav">
            ☰ القائمة
          </button>

          <nav class="nav" id="main-nav" aria-label="التنقّل الرئيسي">
            ${navItems
              .map((item) => `<a class="nav__link" href="${item.href}" data-key="${item.key}">
                  <span aria-hidden="true">${item.icon}</span> ${item.label}
                </a>`)
              .join("")}
          </nav>

          <span class="points-pill" title="نقاطك محفوظة على جهازك فقط">
            ⭐ <span data-points>٠</span> نقطة
          </span>
        </div>
      </header>`;
    this.updatePoints();
  }

  updatePoints() {
    const el = this.querySelector("[data-points]");
    if (el) el.textContent = nf.format(getState().points);
  }

  setActive(key) {
    this.querySelectorAll(".nav__link").forEach((a) => {
      if (a.dataset.key === key) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
}

customElements.define("site-header", SiteHeader);
