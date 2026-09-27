import { el } from '../utils/dom.js';
import { iconMarkup } from '../utils/icons.js';

/** Render the shared institutional footer. */
export function renderFooter({ admin = false, onLogout } = {}) {
    const mount = document.getElementById('site-footer');
    if (!mount) return;

    mount.innerHTML = `
        <footer class="site-footer">
            <div class="footer-inner">
                <div class="footer-brand">
                    <a class="footer-brand-logo" href="index.html" aria-label="English Teaching Unit home">
                        <img src="assets/images/uoplogo.png" alt="" width="52" height="52" loading="lazy">
                        <span>
                            <span class="footer-brand-name">English Teaching Unit</span>
                            <span class="footer-brand-subtitle">Faculty of Engineering · University of Peradeniya</span>
                        </span>
                    </a>
                    <p class="footer-brand-desc">
                        Language, communication and creative student work from the Faculty of Engineering.
                    </p>
                    <address class="footer-brand-address">
                        Peradeniya 20400, Sri Lanka
                    </address>
                </div>

                <nav class="footer-nav" aria-label="Footer navigation">
                    <p class="footer-nav-heading">Explore</p>
                    <ul class="footer-nav-list">
                        <li><a href="index.html"><span>Home</span>${iconMarkup('arrow', { size: 15 })}</a></li>
                        <li><a href="groups.html"><span>Groups</span>${iconMarkup('arrow', { size: 15 })}</a></li>
                        <li><a href="categories.html"><span>Categories</span>${iconMarkup('arrow', { size: 15 })}</a></li>
                        <li><a href="about.html"><span>About</span>${iconMarkup('arrow', { size: 15 })}</a></li>
                    </ul>
                </nav>
            </div>

            <div class="footer-bottom">
                <p>&copy; English Teaching Unit · Faculty of Engineering · University of Peradeniya</p>
                <div id="footer-admin-link"></div>
            </div>
        </footer>
    `;

    const accessLink = admin
        ? el('button', {
            className: 'footer-admin-btn',
            text: 'Administrator · Sign out',
            attrs: { type: 'button' },
            on: { click: async () => { if (typeof onLogout === 'function') await onLogout(); } }
        })
        : el('a', {
            className: 'footer-admin-btn',
            text: 'Admin Login',
            attrs: { href: 'admin-login.html' }
        });

    mount.querySelector('#footer-admin-link').append(accessLink);
}
