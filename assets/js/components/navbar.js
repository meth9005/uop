import { el } from '../utils/dom.js';

/** Shared, keyboard-accessible navigation. */
export function renderNavbar(activePage = '') {
    const mount = document.getElementById('site-header');
    if (!mount) return;

    const links = [
        ['home', 'Home', 'index.html'],
        ['groups', 'Groups', 'groups.html'],
        ['categories', 'Categories', 'categories.html'],
        ['about', 'About', 'about.html']
    ];
    mount.innerHTML = `
        <a class="skip-link" href="#main-content">Skip to content</a>
        <header class="site-navigation">
            <div class="navigation-inner">
                <a href="index.html" class="site-brand">
                    <img src="assets/images/uoplogo.png" alt="University of Peradeniya" width="44" height="44">
                    <span><strong>English Teaching Unit</strong><small>Faculty of Engineering &middot; Peradeniya</small></span>
                </a>
                <nav class="desktop-navigation" aria-label="Primary navigation"></nav>
                <button id="mobile-menu-btn" class="menu-toggle" type="button"
                    aria-expanded="false" aria-controls="mobile-menu" aria-label="Open navigation">
                    <span>Menu</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
                </button>
            </div>
            <nav id="mobile-menu" class="mobile-navigation" aria-label="Mobile navigation" hidden></nav>
        </header>
    `;
    for (const nav of mount.querySelectorAll('nav')) {
        for (const [page, label, href] of links) {
            nav.append(el('a', {
                className: 'navigation-link', text: label,
                attrs: { href, 'aria-current': page === activePage ? 'page' : null }
            }));
        }
    }

    const main = document.querySelector('main');
    if (main) { main.id = 'main-content'; main.tabIndex = -1; }
    const button = mount.querySelector('#mobile-menu-btn');
    const menu = mount.querySelector('#mobile-menu');
    const setOpen = open => {
        menu.hidden = !open;
        button.setAttribute('aria-expanded', String(open));
        button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    };
    button.addEventListener('click', () => setOpen(menu.hidden));
    mount.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !menu.hidden) { setOpen(false); button.focus(); }
    });
    menu.addEventListener('click', event => {
        if (event.target.closest('a')) setOpen(false);
    });
    mount.addEventListener('focusout', event => {
        if (!mount.contains(event.relatedTarget)) setOpen(false);
    });
}
