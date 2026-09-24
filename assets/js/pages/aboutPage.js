/**
 * ============================================================
 * ETU PORTAL - ABOUT PAGE CONTROLLER
 * ============================================================
 *
 * File:
 *
 *     assets/js/pages/aboutPage.js
 *
 *
 * PURPOSE:
 *
 * Controls the shared parts of:
 *
 *     about.html
 *
 *
 * ABOUT PAGE CONTENT IS INTENTIONALLY STATIC
 * ------------------------------------------------------------
 *
 * Information such as:
 *
 * - Who We Are
 * - What We Do
 * - Our Community
 * - ETU institutional description
 *
 * does not need to be stored in Supabase.
 *
 * It changes rarely and belongs to the actual website structure.
 *
 *
 * DYNAMIC PARTS:
 *
 * - Navigation
 * - Administrator mode banner
 * - Footer group links
 * - Administrator sign out
 *
 * ============================================================
 */


/**
 * ============================================================
 * SHARED NAVIGATION
 * ============================================================
 */

import {

    renderNavbar

} from '../components/navbar.js';



/**
 * ============================================================
 * SHARED FOOTER
 * ============================================================
 */

import {

    renderFooter

} from '../components/footer.js';



/**
 * ============================================================
 * ADMINISTRATOR BANNER
 * ============================================================
 */

import {

    renderAdminBanner

} from '../components/adminBanner.js';



/**
 * ============================================================
 * TOAST NOTIFICATIONS
 * ============================================================
 */

import {

    showToast

} from '../components/toast.js';



/**
 * ============================================================
 * DATA SERVICE
 * ============================================================
 *
 * We only need groups here because footer.js creates the
 * student-group links dynamically.
 */

import {

    getGroups

} from '../services/dataService.js';



/**
 * ============================================================
 * AUTHENTICATION SERVICE
 * ============================================================
 */

import {

    isAdmin,

    logout

} from '../services/authService.js';



/**
 * ============================================================
 * PAGE STATE
 * ============================================================
 */

const state = {

    /**
     * Current groups from Supabase.
     */
    groups: [],


    /**
     * Whether the signed-in user is the authorized ETU admin.
     */
    admin: false
};



/**
 * ============================================================
 * ADMINISTRATOR LOGOUT
 * ============================================================
 */

async function handleLogout() {

    try {

        /**
         * End Supabase authentication session.
         */
        await logout();


        /**
         * Reload page.
         *
         * The page then returns to normal public mode.
         */
        window.location.reload();
    }

    catch (error) {

        console.error(
            'Could not sign out:',
            error
        );


        showToast(

            'Could not sign out.',

            'error'
        );
    }
}



/**
 * ============================================================
 * INITIALIZE ABOUT PAGE
 * ============================================================
 */

async function init() {

    /**
     * --------------------------------------------------------
     * SHARED NAVIGATION
     * --------------------------------------------------------
     *
     * Passing:
     *
     *     'about'
     *
     * tells navbar.js to highlight the About link.
     */

    renderNavbar(

        'about',

        {
            /**
             * Gallery navigation should open the project/gallery
             * section of groups.html.
             */
            galleryHref:
                'groups.html#projects'
        }
    );


    try {

        /**
         * ----------------------------------------------------
         * LOAD ADMIN STATUS + GROUPS TOGETHER
         * ----------------------------------------------------
         *
         * They do not depend on each other, so Promise.all()
         * lets the browser request them at the same time.
         */

        const [

            adminStatus,

            groups

        ] = await Promise.all([

            isAdmin(),

            getGroups()
        ]);


        /**
         * Store returned data.
         */
        state.admin =
            adminStatus;


        state.groups =
            groups;


        /**
         * ----------------------------------------------------
         * ADMINISTRATOR MODE BANNER
         * ----------------------------------------------------
         */

        renderAdminBanner(

            state.admin,

            handleLogout
        );


        /**
         * ----------------------------------------------------
         * SHARED FOOTER
         * ----------------------------------------------------
         *
         * Student-group links now come from Supabase instead of
         * being manually written as:
         *
         * AB01
         * AB02
         * AB03
         * AB04
         *
         * Therefore future groups appear automatically.
         */

        renderFooter(

            state.groups,

            {
                admin:
                    state.admin,

                onLogout:
                    handleLogout
            }
        );
    }

    catch (error) {

        console.error(
            'About page failed to initialize:',
            error
        );


        /**
         * Static About information should still remain visible
         * even when Supabase temporarily cannot be reached.
         */

        showToast(

            'Some navigation information could not be loaded.',

            'error'
        );


        /**
         * Still provide a usable footer without dynamic groups.
         */
        renderFooter([]);
    }
}



/**
 * ============================================================
 * START PAGE
 * ============================================================
 */

init();