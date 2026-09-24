import { el } from '../utils/dom.js';

/** Render shared navigation and administrator access without fetching group data. */
export function renderFooter({ admin = false, onLogout } = {}) {
    const mount = document.getElementById('site-footer');
    if (!mount) return;

    mount.innerHTML = `
        <footer class="bg-navy-950 text-white px-6 py-10 sm:py-12 border-t border-slate-800">
            <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pb-8">
                <div>
                    <div class="flex items-center gap-3 mb-4">
                        <img class="footer-crest" src="assets/images/uoplogo.png" alt="University of Peradeniya" width="52" height="52" loading="lazy">
                        <h2 class="font-bold text-sm">English Teaching Unit</h2>
                    </div>
                    <p class="text-sm text-slate-400 leading-relaxed max-w-md mb-4">
                        Developing English language and communication skills in engineering
                        students at the University of Peradeniya, Sri Lanka.
                    </p>
                    <address class="text-xs text-slate-400 leading-relaxed not-italic">
                        Faculty of Engineering, University of Peradeniya,<br>
                        Peradeniya 20400, Sri Lanka
                    </address>
                </div>
                <nav aria-label="Footer navigation" class="footer-explore md:justify-self-end">
                    <div class="footer-explore-heading">
                        <span class="footer-explore-kicker">Explore</span>
                        <span class="footer-explore-caption">Discover the unit</span>
                    </div>
                    <ul class="footer-explore-links">
                        <li><a href="index.html" class="hover:text-accent-gold"><span>Home</span><span aria-hidden="true">↗</span></a></li>
                        <li><a href="categories.html" class="hover:text-accent-gold"><span>Categories</span><span aria-hidden="true">↗</span></a></li>
                        <li><a href="groups.html#projects" class="hover:text-accent-gold"><span>Gallery</span><span aria-hidden="true">↗</span></a></li>
                        <li><a href="about.html" class="hover:text-accent-gold"><span>About</span><span aria-hidden="true">↗</span></a></li>
                    </ul>
                </nav>
            </div>
            <div class="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
                <p class="leading-relaxed">&copy; English Teaching Unit - Faculty of Engineering,
                    University of Peradeniya. All rights reserved.</p>
                <div id="footer-admin-link" class="shrink-0"></div>
            </div>
        </footer>
    `;

    const accessLink = admin
        ? el('button', {
            className: 'hover:text-accent-gold transition',
            text: 'Administrator - Sign out',
            attrs: { type: 'button' },
            on: { click: async () => { if (typeof onLogout === 'function') await onLogout(); } }
        })
        : el('a', {
            className: 'hover:text-accent-gold transition',
            text: 'Admin Login',
            attrs: { href: 'admin-login.html' }
        });

    mount.querySelector('#footer-admin-link').append(accessLink);
}
