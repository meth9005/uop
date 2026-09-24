/**
 * ============================================================
 * ETU PORTAL - SHARED FOOTER
 * ============================================================
 *
 * Purpose:
 * Creates one reusable footer for the entire website.
 *
 * The footer also:
 *
 * - loads the current student groups dynamically
 * - links to every group automatically
 * - shows Admin Login to normal visitors
 * - shows Administrator / Sign Out to the admin
 *
 * Therefore adding Group AB05 does NOT require manually editing
 * every page footer.
 * ============================================================
 */


// Safe DOM helper utilities.
import {

    el,

    clear

} from '../utils/dom.js';


/**
 * ------------------------------------------------------------
 * renderFooter()
 * ------------------------------------------------------------
 *
 * groups:
 * Array of groups retrieved from Supabase.
 *
 * options.admin:
 * true when current user is the administrator.
 *
 * options.onLogout:
 * function to execute when administrator clicks Sign Out.
 */
export function renderFooter(

    groups = [],

    options = {}
) {

    /**
     * Every HTML page will contain:
     *
     *     <div id="site-footer"></div>
     */
    const mount =
        document.getElementById(
            'site-footer'
        );


    if (!mount) {

        return;
    }


    /**
     * Static footer structure.
     *
     * Dynamic group names are NOT inserted here directly.
     * They are created safely later using textContent.
     */
    mount.innerHTML = `

        <footer
            class="
                bg-navy-950
                text-white
                pt-16
                pb-10
                px-6
                border-t
                border-slate-800
            "
        >

            <div
                class="
                    max-w-7xl
                    mx-auto
                    grid
                    grid-cols-1
                    md:grid-cols-3
                    gap-10
                    mb-12
                "
            >

                <!-- ==========================================
                     COLUMN 1 - ETU INFORMATION
                     ========================================== -->

                <div>

                    <div
                        class="
                            flex
                            items-center
                            space-x-3
                            mb-4
                        "
                    >

                        <div
                            class="
                                bg-accent-gold
                                text-navy-900
                                font-bold
                                text-xs
                                px-2
                                py-1
                                rounded
                            "
                        >
                            ETU
                        </div>

                        <div class="font-bold text-sm">
                            English Teaching Unit
                        </div>

                    </div>


                    <p
                        class="
                            text-xs
                            text-slate-400
                            mb-4
                            leading-relaxed
                            max-w-sm
                        "
                    >
                        Developing English language and
                        communication skills in engineering
                        students at the University of Peradeniya,
                        Sri Lanka.
                    </p>


                    <p
                        class="
                            text-xs
                            text-slate-400
                        "
                    >
                        📍 Faculty of Engineering,
                        University of Peradeniya,
                        Peradeniya 20400, Sri Lanka
                    </p>

                </div>


                <!-- ==========================================
                     COLUMN 2 - MAIN SITE LINKS
                     ========================================== -->

                <div>

                    <h3
                        class="
                            font-bold
                            text-sm
                            text-slate-200
                            mb-4
                        "
                    >
                        Pages
                    </h3>


                    <ul
                        class="
                            space-y-2
                            text-xs
                            text-slate-400
                        "
                    >

                        <li>
                            <a
                                href="index.html"
                                class="hover:text-accent-gold"
                            >
                                Home
                            </a>
                        </li>

                        <li>
                            <a
                                href="groups.html"
                                class="hover:text-accent-gold"
                            >
                                Groups
                            </a>
                        </li>

                        <li>
                            <a
                                href="categories.html"
                                class="hover:text-accent-gold"
                            >
                                Categories
                            </a>
                        </li>

                        <li>
                            <a
                                href="groups.html#projects"
                                class="hover:text-accent-gold"
                            >
                                Gallery
                            </a>
                        </li>

                        <li>
                            <a
                                href="about.html"
                                class="hover:text-accent-gold"
                            >
                                About
                            </a>
                        </li>

                    </ul>

                </div>


                <!-- ==========================================
                     COLUMN 3 - DYNAMIC GROUP LINKS
                     ========================================== -->

                <div>

                    <h3
                        class="
                            font-bold
                            text-sm
                            text-slate-200
                            mb-4
                        "
                    >
                        Student Groups
                    </h3>


                    <ul
                        id="footer-groups-list"
                        class="
                            space-y-2
                            text-xs
                            text-slate-400
                        "
                    >
                    </ul>

                </div>

            </div>


            <!-- ==============================================
                 BOTTOM FOOTER ROW
                 ============================================== -->

            <div
                class="
                    max-w-7xl
                    mx-auto
                    pt-7
                    border-t
                    border-slate-800
                    flex
                    flex-col
                    sm:flex-row
                    items-center
                    justify-between
                    gap-3
                    text-xs
                    text-slate-500
                "
            >

                <span>
                    &copy; English Teaching Unit -
                    Faculty of Engineering,
                    University of Peradeniya.
                    All rights reserved.
                </span>


                <!--
                    Visitor:
                    Admin Login

                    Administrator:
                    Administrator · Sign out
                -->
                <span id="footer-admin-link"></span>

            </div>

        </footer>
    `;


    /**
     * --------------------------------------------------------
     * BUILD DYNAMIC GROUP LINKS
     * --------------------------------------------------------
     */

    const list =
        clear(
            '#footer-groups-list'
        );


    if (list) {

        groups.forEach(

            group => {

                /**
                 * Build the link using DOM methods instead of
                 * injecting group names through innerHTML.
                 */
                const link =
                    el(
                        'a',

                        {
                            className:
                                'hover:text-accent-gold',

                            text:
                                group.name,

                            attrs: {

                                href:
                                    `group.html?group=` +
                                    encodeURIComponent(
                                        group.slug
                                    )
                            }
                        }
                    );


                const item =
                    el(
                        'li',

                        {},

                        [
                            link
                        ]
                    );


                list.append(
                    item
                );
            }
        );
    }


    /**
     * --------------------------------------------------------
     * ADMIN LOGIN / LOGOUT LINK
     * --------------------------------------------------------
     */

    const adminMount =
        document.getElementById(
            'footer-admin-link'
        );


    if (!adminMount) {

        return;
    }


    /**
     * Administrator is currently logged in.
     */
    if (options.admin) {

        const logoutButton =
            el(
                'button',

                {
                    className:
                        'hover:text-accent-gold transition',

                    text:
                        'Administrator · Sign out',

                    attrs: {

                        type:
                            'button'
                    },

                    on: {

                        click:
                            async () => {

                                if (
                                    typeof options.onLogout ===
                                    'function'
                                ) {

                                    await options.onLogout();
                                }
                            }
                    }
                }
            );


        adminMount.append(
            logoutButton
        );
    }

    /**
     * Normal public visitor.
     */
    else {

        const adminLink =
            el(
                'a',

                {
                    className:
                        'hover:text-accent-gold transition',

                    text:
                        'Admin Login',

                    attrs: {

                        href:
                            'admin-login.html'
                    }
                }
            );


        adminMount.append(
            adminLink
        );
    }
}