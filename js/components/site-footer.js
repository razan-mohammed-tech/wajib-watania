/**
 * تذييل الموقع (Site Footer) — مكوّن قابل لإعادة الاستخدام.
 * يتضمن تنويه الخصوصية والبيانات التجريبية بوضوح.
 */

import { siteInfo, footerText, privacyNotice, navItems } from "../data/site.js";

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="site-footer__grid">
            <div>
              <h3>🌴 ${siteInfo.name}</h3>
              <p>${footerText.about}</p>
            </div>
            <div>
              <h3>روابط سريعة</h3>
              ${navItems
                .slice(0, 4)
                .map((i) => `<a href="${i.href}">${i.icon} ${i.label}</a>`)
                .join("")}
            </div>
            <div>
              <h3>خصوصية الطفل</h3>
              <p style="margin:0">${privacyNotice.icon} ${privacyNotice.title}</p>
              <p style="font-size:.85rem;opacity:.85">${privacyNotice.text}</p>
            </div>
          </div>
          <p class="site-footer__note">${footerText.disclaimer}</p>
        </div>
      </footer>`;
  }
}

customElements.define("site-footer", SiteFooter);
