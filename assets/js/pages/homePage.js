/**
 * ============================================================
 * ETU PORTAL - HOMEPAGE CONTROLLER
 * ============================================================
 *
 * File:
 *
 *     assets/js/pages/homePage.js
 *
 *
 * PURPOSE:
 *
 * Controls all dynamic content on:
 *
 *     index.html
 *
 *
 * STATIC CONTENT REMAINS IN HTML:
 *
 * - University / ETU identity
 * - Hero text
 * - About section
 * - Mission
 * - Contact details
 *
 *
 * DYNAMIC CONTENT COMES FROM SUPABASE:
 *
 * - Number of groups
 * - Number of projects
 * - Number of students
 * - Group cards
 * - Latest projects
 * - Footer group links
 *
 *
 * ARCHITECTURE:
 *
 * index.html
 *      ↓
 * homePage.js
 *      ↓
 * reusable components
 *      ↓
 * dataService.js
 *      ↓
 * Supabase
 * ============================================================
 */


/**
 * ============================================================
 * STATIC CATEGORY CONFIGURATION
 * ============================================================
 *
 * Categories are application configuration rather than
 * database-managed content.
 */

import {

    CATEGORIES

} from '../config/categories.js';



/**
 * ============================================================
 * SHARED UI COMPONENTS
 * ============================================================
 */


/**
 * Main website navigation.
 */
import {

    renderNavbar

} from '../components/navbar.js';


/**
 * Shared website footer.
 */
import {

    renderFooter

} from '../components/footer.js';


/**
 * Small banner shown only when administrator is signed in.
 */
import {

    renderAdminBanner

} from '../components/adminBanner.js';


/**
 * Standard group card.
 */
import {

    createGroupCard

} from '../components/groupCard.js';


/**
 * Standard project card.
 */
import {

    createProjectCard

} from '../components/projectCard.js';


/**
 * Used when no groups/projects exist.
 */
import {

    createEmptyState

} from '../components/emptyState.js';


/**
 * Small error notifications.
 */
import {

    showToast

} from '../components/toast.js';



/**
 * ============================================================
 * DOM UTILITIES
 * ============================================================
 */

import {

    clear,

    setText

} from '../utils/dom.js';



/**
 * ============================================================
 * DATABASE SERVICE
 * ============================================================
 */


/**
 * getGroups()
 *
 * Returns real groups from Supabase together with calculated:
 *
 * - member_count
 * - project_count
 * - media_count
 *
 *
 * getLatestProjects(3)
 *
 * Returns the newest / featured student projects.
 */
import {

    getGroups,

    getLatestProjects

} from '../services/dataService.js';



/**
 * ============================================================
 * AUTHENTICATION
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
     * Current list of groups.
     */
    groups: [],


    /**
     * Latest projects shown on homepage.
     */
    latestProjects: [],


    /**
     * Whether current user is authorized administrator.
     */
    admin: false
};



/**
 * ============================================================
 * HOMEPAGE STATISTICS
 * ============================================================
 */


/**
 * renderStatistics()
 *
 * Calculates statistics from the current database information.
 *
 * We intentionally DO NOT store these values separately in the
 * database because they can be calculated from existing data.
 */
function renderStatistics() {

    /**
     * --------------------------------------------------------
     * GROUP COUNT
     * --------------------------------------------------------
     */

    const groupCount =
        state.groups.length;


    /**
     * --------------------------------------------------------
     * PROJECT COUNT
     * --------------------------------------------------------
     *
     * Each group returned by getGroups() contains its project
     * count.
     */

    const projectCount =
        state.groups.reduce(

            (total, group) => {

                return (

                    total +

                    Number(
                        group.project_count ||
                        0
                    )
                );
            },

            0
        );


    /**
     * --------------------------------------------------------
     * STUDENT COUNT
     * --------------------------------------------------------
     */

    const studentCount =
        state.groups.reduce(

            (total, group) => {

                return (

                    total +

                    Number(
                        group.member_count ||
                        0
                    )
                );
            },

            0
        );


    /**
     * --------------------------------------------------------
     * CATEGORY COUNT
     * --------------------------------------------------------
     *
     * Categories are defined in categories.js.
     */

    const categoryCount =
        CATEGORIES.length;


    /**
     * Update the visible page.
     */
    setText(
        '#stat-groups',
        groupCount
    );


    setText(
        '#stat-projects',
        projectCount
    );


    setText(
        '#stat-categories',
        categoryCount
    );


    setText(
        '#stat-students',
        studentCount
    );
}



/**
 * ============================================================
 * HOMEPAGE GROUPS
 * ============================================================
 */


/**
 * renderGroups()
 *
 * Shows the first four groups according to the ordering returned
 * by dataService.
 *
 * The full list remains available from groups.html.
 *
 *
 * Example:
 *
 * homepage:
 *
 *     AB01
 *     AB02
 *     AB03
 *     AB04
 *
 * If AB05 is later added:
 *
 *     groups.html will automatically contain AB05.
 */
function renderGroups() {

    const container =
        clear(
            '#home-groups-grid'
        );


    if (!container) {

        return;
    }


    /**
     * Preserve the existing four-card homepage layout.
     */
    const homepageGroups =
        state.groups.slice(
            0,
            4
        );


    /**
     * No groups available.
     */
    if (
        homepageGroups.length === 0
    ) {

        container.append(

            createEmptyState(
                'No student groups are published yet.'
            )
        );


        return;
    }


    /**
     * Build real cards using reusable groupCard.js.
     */
    homepageGroups.forEach(

        group => {

            container.append(

                createGroupCard(

                    group,

                    {
                        showStats:
                            true,


                        /**
                         * Administrator can see DRAFT badge for
                         * unpublished groups returned by RLS.
                         */
                        admin:
                            state.admin
                    }
                )
            );
        }
    );
}



/**
 * ============================================================
 * LATEST PROJECTS
 * ============================================================
 */


/**
 * renderLatestProjects()
 *
 * Displays up to three projects returned from Supabase.
 */
function renderLatestProjects() {

    const container =
        clear(
            '#latest-projects-container'
        );


    if (!container) {

        return;
    }


    /**
     * --------------------------------------------------------
     * EMPTY PROJECT STATE
     * --------------------------------------------------------
     */

    if (
        state.latestProjects.length ===
        0
    ) {

        container.append(

            createEmptyState(
                'No student projects have been published yet.'
            )
        );


        return;
    }


    /**
     * --------------------------------------------------------
     * PROJECT CARDS
     * --------------------------------------------------------
     */

    state.latestProjects.forEach(

        project => {

            container.append(

                createProjectCard(

                    project,

                    {
                        /**
                         * Homepage contains projects from multiple
                         * groups, so display the group badge/link.
                         */
                        showGroup:
                            true,


                        /**
                         * Homepage remains a presentation page.
                         *
                         * Project editing is performed on the
                         * individual group page.
                         */
                        admin:
                            false
                    }
                )
            );
        }
    );
}



/**
 * ============================================================
 * ADMIN LOGOUT
 * ============================================================
 */


/**
 * handleLogout()
 *
 * Used by:
 *
 * - Administrator banner
 * - Footer
 */
async function handleLogout() {

    try {

        await logout();


        /**
         * Reload homepage in public mode.
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
 * INITIALIZE HOMEPAGE
 * ============================================================
 */

async function init() {

    /**
     * --------------------------------------------------------
     * NAVIGATION
     * --------------------------------------------------------
     *
     * "Home" appears active.
     *
     * Gallery link scrolls to Latest Student Work.
     */
    renderNavbar(

        'home',

        {
            galleryHref:
                '#work'
        }
    );


    try {

        /**
         * ----------------------------------------------------
         * LOAD PAGE INFORMATION IN PARALLEL
         * ----------------------------------------------------
         *
         * These calls do not depend on each other, so loading
         * them together improves page startup time.
         */

        const [

            adminStatus,

            groups,

            latestProjects

        ] = await Promise.all([

            isAdmin(),

            getGroups(),

            getLatestProjects(3)
        ]);


        /**
         * Save the results in page state.
         */
        state.admin =
            adminStatus;


        state.groups =
            groups;


        state.latestProjects =
            latestProjects;


        /**
         * ----------------------------------------------------
         * ADMINISTRATOR BANNER
         * ----------------------------------------------------
         */

        renderAdminBanner(

            state.admin,

            handleLogout
        );


        /**
         * ----------------------------------------------------
         * DYNAMIC HOMEPAGE CONTENT
         * ----------------------------------------------------
         */

        renderStatistics();

        renderGroups();

        renderLatestProjects();


        /**
         * ----------------------------------------------------
         * SHARED FOOTER
         * ----------------------------------------------------
         *
         * Group links inside the footer now come directly from
         * Supabase.
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
            'Homepage failed to initialize:',
            error
        );


        /**
         * Clear loading text so the visitor is not left with
         * "Loading..." forever.
         */

        const groupsContainer =
            clear(
                '#home-groups-grid'
            );


        groupsContainer?.append(

            createEmptyState(
                'Student groups could not be loaded.'
            )
        );


        const projectContainer =
            clear(
                '#latest-projects-container'
            );


        projectContainer?.append(

            createEmptyState(
                'Student projects could not be loaded.'
            )
        );


        showToast(

            'Some portal content could not be loaded.',

            'error'
        );


        /**
         * Keep footer/navigation usable.
         */
        renderFooter([]);
    }
}



/**
 * Start homepage controller.
 */
init();