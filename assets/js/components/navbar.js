/**
 * ============================================================
 * ETU PORTAL - SHARED NAVIGATION BAR
 * ============================================================
 *
 * Purpose:
 * Creates the SAME navigation bar for every page.
 *
 * Previously:
 *
 * index.html
 * groups.html
 * group.html
 * categories.html
 * about.html
 *
 * each contained their own copy of the navigation HTML.
 *
 * That caused unnecessary duplication.
 *
 * Now every page simply calls:
 *
 *     renderNavbar('home');
 *
 * or:
 *
 *     renderNavbar('groups');
 *
 *
 * Benefits:
 *
 * - One navbar design for the entire portal
 * - One mobile navigation implementation
 * - Easier link changes
 * - Easier visual maintenance
 * - Consistent active-page highlighting
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * renderNavbar()
 * ------------------------------------------------------------
 *
 * activePage:
 *
 * Tells the component which navigation item should be
 * highlighted.
 *
 * Possible values:
 *
 *     home
 *     groups
 *     categories
 *     about
 *
 *
 * options:
 *
 * Allows individual pages to slightly change behaviour.
 *
 * Example:
 *
 * renderNavbar(
 *     'home',
 *     {
 *         galleryHref: '#work'
 *     }
 * );
 */
export function renderNavbar(

    activePage = '',

    options = {}
) {

    /**
     * The HTML pages contain:
     *
     *     <div id="site-header"></div>
     *
     * We insert the shared navbar into that element.
     */
    const mount =
        document.getElementById(
            'site-header'
        );


    // If the page does not contain a navbar mount point,
    // quietly stop.
    if (!mount) {

        return;
    }


    /**
     * Gallery destination.
     *
     * Homepage:
     *
     *     #work
     *
     * Group page:
     *
     *     #gallery
     *
     * Other pages:
     *
     *     groups.html#projects
     */
    const galleryHref =
        options.galleryHref ||
        'groups.html#projects';


    /**
     * Categories currently had a small UTC clock bar.
     *
     * We preserve support for that feature but make it optional.
     */
    const showTimeBar =
        Boolean(
            options.showTimeBar
        );


    /**
     * CSS class for the currently selected page.
     */
    const activeClass =
        'bg-navy-800 text-accent-gold ' +
        'px-4 py-2 rounded-md font-medium';


    /**
     * Normal navigation link appearance.
     */
    const normalClass =
        'text-slate-300 hover:text-white transition';


    /**
     * Helper that decides whether a desktop link should appear
     * active.
     */
    const navClass = page => {

        return page === activePage
            ? activeClass
            : normalClass;
    };


    /**
     * Equivalent styling for mobile navigation.
     */
    const mobileClass = page => {

        return page === activePage

            ? 'block text-accent-gold font-medium py-1'

            : 'block text-slate-300 hover:text-white py-1';
    };


    /**
     * The content below is static application HTML.
     *
     * No user/database content is inserted here, so using
     * innerHTML for this shared template is safe and convenient.
     */
    mount.innerHTML = `

        ${
            showTimeBar

                ? `
                    <!-- Optional university/time information bar -->
                    <div
                        class="
                            bg-navy-950
                            text-slate-400
                            text-xs
                            py-1.5
                            px-6
                            border-b
                            border-navy-800
                        "
                    >

                        <div
                            class="
                                max-w-7xl
                                mx-auto
                                flex
                                justify-between
                                items-center
                                gap-4
                            "
                        >

                            <span>
                                Faculty of Engineering,
                                University of Peradeniya
                            </span>

                            <span
                                id="current-time"
                                class="
                                    font-mono
                                    text-accent-gold
                                    whitespace-nowrap
                                "
                            >
                                --:--:--
                            </span>

                        </div>

                    </div>
                `

                : ''
        }


        <!-- ==================================================
             MAIN NAVIGATION
             ================================================== -->

        <header
            class="
                sticky
                top-0
                z-50
                bg-navy-900
                text-white
                shadow-md
            "
        >

            <div
                class="
                    max-w-7xl
                    mx-auto
                    px-6
                    h-20
                    flex
                    items-center
                    justify-between
                "
            >

                <!-- ==========================================
                     ETU / UNIVERSITY BRAND
                     ========================================== -->

                <a
                    href="index.html"
                    class="flex items-center space-x-3"
                >

                    <img
                        src="assets/images/uoplogo.png"
                        alt="University of Peradeniya"
                        class="h-12 w-auto object-contain"
                    >

                    <div>

                        <div
                            class="
                                font-semibold
                                leading-tight
                                text-sm
                            "
                        >
                            English Teaching Unit
                        </div>

                        <div
                            class="
                                text-xs
                                text-slate-400
                            "
                        >
                            Faculty of Engineering · UoP
                        </div>

                    </div>

                </a>


                <!-- ==========================================
                     DESKTOP NAVIGATION
                     ========================================== -->

                <nav
                    class="
                        hidden
                        md:flex
                        items-center
                        space-x-8
                        text-sm
                    "
                    aria-label="Primary navigation"
                >

                    <a
                        href="index.html"
                        class="${navClass('home')}"
                    >
                        Home
                    </a>

                    <a
                        href="groups.html"
                        class="${navClass('groups')}"
                    >
                        Groups
                    </a>

                    <a
                        href="categories.html"
                        class="${navClass('categories')}"
                    >
                        Categories
                    </a>

                    <a
                        href="${galleryHref}"
                        class="${normalClass}"
                    >
                        Gallery
                    </a>

                    <a
                        href="about.html"
                        class="${navClass('about')}"
                    >
                        About
                    </a>

                </nav>


                <!-- ==========================================
                     MOBILE MENU BUTTON
                     ========================================== -->

                <button
                    id="mobile-menu-btn"
                    type="button"
                    class="
                        md:hidden
                        text-slate-300
                        hover:text-white
                        p-2
                        focus:outline-none
                    "
                    aria-label="Toggle navigation"
                    aria-expanded="false"
                >

                    <svg
                        class="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >

                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />

                    </svg>

                </button>

            </div>


            <!-- ==============================================
                 MOBILE NAVIGATION
                 ============================================== -->

            <div
                id="mobile-menu"
                class="
                    hidden
                    md:hidden
                    bg-navy-950
                    px-6
                    py-4
                    border-t
                    border-navy-800
                    space-y-3
                "
            >

                <a
                    href="index.html"
                    class="${mobileClass('home')}"
                >
                    Home
                </a>

                <a
                    href="groups.html"
                    class="${mobileClass('groups')}"
                >
                    Groups
                </a>

                <a
                    href="categories.html"
                    class="${mobileClass('categories')}"
                >
                    Categories
                </a>

                <a
                    href="${galleryHref}"
                    class="
                        block
                        text-slate-300
                        hover:text-white
                        py-1
                    "
                >
                    Gallery
                </a>

                <a
                    href="about.html"
                    class="${mobileClass('about')}"
                >
                    About
                </a>

            </div>

        </header>
    `;


    /**
     * --------------------------------------------------------
     * MOBILE MENU INTERACTION
     * --------------------------------------------------------
     */

    const button =
        document.getElementById(
            'mobile-menu-btn'
        );


    const menu =
        document.getElementById(
            'mobile-menu'
        );


    button?.addEventListener(

        'click',

        () => {

            /**
             * Determine whether the menu is currently hidden.
             */
            const opening =
                menu.classList.contains(
                    'hidden'
                );


            /**
             * Toggle Tailwind's hidden class.
             */
            menu.classList.toggle(
                'hidden'
            );


            /**
             * Keep accessibility state accurate.
             */
            button.setAttribute(

                'aria-expanded',

                String(opening)
            );
        }
    );


    /**
     * --------------------------------------------------------
     * OPTIONAL UTC CLOCK
     * --------------------------------------------------------
     *
     * Only enabled when:
     *
     *     showTimeBar: true
     */
    if (showTimeBar) {

        const clock =
            document.getElementById(
                'current-time'
            );


        const updateClock = () => {

            if (clock) {

                clock.textContent =
                    new Date()
                        .toUTCString();
            }
        };


        // Display immediately.
        updateClock();


        // Then update every second.
        window.setInterval(

            updateClock,

            1000
        );
    }
}