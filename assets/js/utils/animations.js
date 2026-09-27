/**
 * Motion system inspired by modern editorial/product sites.
 * The motion stays subtle, uses native scrolling and respects reduced-motion.
 */

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
let initialized = false;
let observer;
let mutationObserver;

function revealNow(node) {
    node.classList.add('is-revealed');
}

function prepareReveal(node, index = 0) {
    if (!(node instanceof HTMLElement)) return;
    if (node.dataset.motionPrepared === 'true') return;
    node.dataset.motionPrepared = 'true';
    node.classList.add('motion-reveal');
    node.style.setProperty('--reveal-delay', `${Math.min(index, 8) * 70}ms`);

    if (reducedMotion || !observer) revealNow(node);
    else observer.observe(node);
}

function prepareExistingContent() {
    const sectionSelectors = [
        'main > section',
        '.page-intro > div',
        '.section-heading',
        '.home-statistics dl',
        '.about-content-grid',
        '.home-about-grid',
        '.home-contact-grid'
    ];

    document.querySelectorAll(sectionSelectors.join(',')).forEach((node, index) => {
        prepareReveal(node, index % 4);
    });

    document.querySelectorAll('.reveal, .etu-card, .project-card, .group-card').forEach((node, index) => {
        prepareReveal(node, index % 6);
    });
}

function initRevealObserver() {
    if (reducedMotion || !('IntersectionObserver' in window)) return;

    observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            revealNow(entry.target);
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -7% 0px'
    });
}

function initDynamicContentObserver() {
    if (!('MutationObserver' in window)) return;

    mutationObserver = new MutationObserver(records => {
        records.forEach(record => {
            record.addedNodes.forEach(node => {
                if (!(node instanceof HTMLElement)) return;

                if (node.matches('.reveal, .etu-card, .project-card, .group-card')) {
                    prepareReveal(node, 0);
                }

                node.querySelectorAll?.('.reveal, .etu-card, .project-card, .group-card').forEach((child, index) => {
                    prepareReveal(child, index % 6);
                });
            });
        });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
}

function initCardPointerLight() {
    if (reducedMotion || !window.matchMedia?.('(pointer: fine)').matches) return;

    document.addEventListener('pointermove', event => {
        const card = event.target.closest('.etu-card, .motion-card, .category-feature-card');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--pointer-x', `${x}%`);
        card.style.setProperty('--pointer-y', `${y}%`);
    }, { passive: true });
}

function initHeroMotion() {
    const stage = document.querySelector('.hero-visual-stage');
    if (!stage || reducedMotion || !window.matchMedia?.('(pointer: fine)').matches) return;

    const reset = () => {
        stage.style.setProperty('--hero-x', '0');
        stage.style.setProperty('--hero-y', '0');
    };

    stage.addEventListener('pointermove', event => {
        const rect = stage.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        stage.style.setProperty('--hero-x', x.toFixed(3));
        stage.style.setProperty('--hero-y', y.toFixed(3));
    }, { passive: true });

    stage.addEventListener('pointerleave', reset, { passive: true });
}

function initPageLoadState() {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => document.body.classList.add('page-ready'));
    });
}

export function initSiteAnimations() {
    if (initialized) return;
    initialized = true;

    if (reducedMotion) document.documentElement.classList.add('reduced-motion');

    initRevealObserver();
    prepareExistingContent();
    initDynamicContentObserver();
    initCardPointerLight();
    initHeroMotion();
    initPageLoadState();
}

/** Backwards-compatible exports used by earlier page code. */
export function initRevealAnimations() { initSiteAnimations(); }
export function initPageTransition() { initSiteAnimations(); }
export function staggerReveal(elements) {
    [...elements].forEach((el, index) => prepareReveal(el, index));
}
