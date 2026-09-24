/**
 * ============================================================
 * ETU PORTAL - ADMINISTRATOR MODE BANNER
 * ============================================================
 *
 * Purpose:
 * Displays a small management banner when the authorized
 * administrator is signed in.
 *
 * Public visitors never see this component.
 *
 * This replaces the old localStorage-based "Editor Mode"
 * banner and toggle.
 * ============================================================
 */


import {

    el,

    clear

} from '../utils/dom.js';


/**
 * ------------------------------------------------------------
 * renderAdminBanner()
 * ------------------------------------------------------------
 *
 * isAdmin:
 * true only when authService confirms the user is the
 * authorized administrator.
 *
 * onLogout:
 * callback used when Sign Out is clicked.
 */
export function renderAdminBanner(

    isAdmin,

    onLogout
) {

    const mount =
        clear(
            '#admin-banner'
        );


    /**
     * No mount point or normal public user:
     *
     * render nothing.
     */
    if (
        !mount ||
        !isAdmin
    ) {

        return;
    }


    /**
     * Main banner wrapper.
     */
    const wrapper =
        el(
            'div',

            {
                className:
                    'bg-amber-50 ' +
                    'border-b border-amber-200 ' +
                    'px-6 py-2.5 ' +
                    'text-xs text-amber-900'
            }
        );


    /**
     * Centers banner content to match the rest of the portal.
     */
    const inner =
        el(
            'div',

            {
                className:
                    'max-w-7xl mx-auto ' +
                    'flex flex-wrap ' +
                    'items-center justify-between gap-3'
            }
        );


    /**
     * Left side:
     *
     * shows administrator state.
     */
    inner.append(

        el(
            'div',

            {
                className:
                    'flex items-center gap-2'
            },

            [

                el(
                    'span',

                    {
                        text: '🔐'
                    }
                ),

                el(
                    'strong',

                    {
                        text:
                            'Administrator Mode'
                    }
                ),

                el(
                    'span',

                    {
                        text:
                            'You can manage the content shown on this page.'
                    }
                )
            ]
        )
    );


    /**
     * Right side:
     *
     * administrator sign-out button.
     */
    inner.append(

        el(
            'button',

            {
                className:
                    'font-semibold underline ' +
                    'hover:text-navy-900',

                text:
                    'Sign out',

                attrs: {

                    type:
                        'button'
                },

                on: {

                    click:
                        () => {

                            if (
                                typeof onLogout ===
                                'function'
                            ) {

                                onLogout();
                            }
                        }
                }
            }
        )
    );


    wrapper.append(
        inner
    );


    mount.append(
        wrapper
    );
}