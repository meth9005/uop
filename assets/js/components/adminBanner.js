import { el, clear } from '../utils/dom.js';
import { createIcon } from '../utils/icons.js';

/** Render the management-only status strip. Public visitors see nothing. */
export function renderAdminBanner(isAdmin, onLogout) {
    const mount = clear('#admin-banner');
    if (!mount || !isAdmin) return;

    const wrapper = el('div', { className: 'admin-mode-banner' });
    const inner = el('div', { className: 'admin-mode-inner' });
    const state = el('div', { className: 'admin-mode-state' });
    const copy = el('div', { className: 'admin-mode-copy' }, [
        el('strong', { text: 'Administrator mode' }),
        el('span', { text: 'Content management controls are enabled.' })
    ]);

    state.append(createIcon('lock', { size: 17 }), copy);

    const signOut = el('button', {
        className: 'admin-mode-action',
        text: 'Sign out',
        attrs: { type: 'button' },
        on: {
            click: () => {
                if (typeof onLogout === 'function') onLogout();
            }
        }
    });

    inner.append(state, signOut);
    wrapper.append(inner);
    mount.append(wrapper);
}
