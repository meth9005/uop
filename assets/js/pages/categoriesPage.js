/**
 * ============================================================
 * ETU PORTAL - CATEGORIES PAGE CONTROLLER
 * ============================================================
 *
 * File:
 * assets/js/pages/categoriesPage.js
 *
 *
 * PURPOSE:
 *
 * Controls:
 *
 *     categories.html
 *
 *
 * This page displays the four official showcase categories:
 *
 * - Group Activities
 * - Presentations
 * - Documentaries
 * - Art & Explorer
 *
 *
 * STATIC DATA:
 *
 * Category name
 * Category icon
 * Category description
 * Category image
 *
 * These come from:
 *
 *     config/categories.js
 *
 *
 * DYNAMIC DATA:
 *
 * Project count
 * Participating group count
 * Video count
 *
 * These come from real Supabase project records.
 *
 * ============================================================
 */


/**
 * ============================================================
 * CATEGORY CONFIGURATION
 * ============================================================
 */

import {

    CATEGORIES

} from '../config/categories.js';



/**
 * ============================================================
 * SHARED COMPONENTS
 * ============================================================
 */

import {

    renderNavbar

} from '../components/navbar.js';


import {

    renderFooter

} from '../components/footer.js';


import {

    renderAdminBanner

} from '../components/adminBanner.js';


import {

    showToast

} from '../components/toast.js';



/**
 * ============================================================
 * DOM HELPERS
 * ============================================================
 */

import {

    el,

    clear,

    setText,

    setImageWithFallback

} from '../utils/dom.js';



/**
 * ============================================================
 * IMAGE FALLBACK
 * ============================================================
 */

import {

    DEFAULT_PROJECT_IMAGE

} from '../utils/format.js';



/**
 * ============================================================
 * DATA SERVICE
 * ============================================================
 */

import {

    getGroups,

    getAllProjects

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
     * Groups used mainly by the shared footer.
     */
    groups: [],


    /**
     * All projects currently visible through Supabase RLS.
     *
     * Public:
     * only published projects.
     *
     * Admin:
     * published + drafts.
     */
    projects: [],


    /**
     * Authorized administrator status.
     */
    admin: false,


    /**
     * Currently selected category.
     */
    activeCategory: null
};



/**
 * ============================================================
 * FIND CATEGORY FROM URL
 * ============================================================
 *
 * We support:
 *
 * categories.html
 *
 * categories.html?category=presentations
 *
 * categories.html?category=group-activities
 *
 * categories.html?category=Presentations
 */
function getInitialCategory() {

    const requested =
        new URLSearchParams(
            window.location.search
        )
            .get('category')
            ?.trim()
            .toLowerCase();


    /**
     * No requested category:
     *
     * use first configured category.
     */
    if (!requested) {

        return CATEGORIES[0];
    }


    /**
     * Try:
     *
     * key
     * slug
     * name
     */
    const match =
        CATEGORIES.find(

            category => {

                return (

                    category.key
                        .toLowerCase() ===
                        requested

                    ||

                    category.slug
                        .toLowerCase() ===
                        requested

                    ||

                    category.name
                        .toLowerCase() ===
                        requested
                );
            }
        );


    return (
        match ||
        CATEGORIES[0]
    );
}



/**
 * ============================================================
 * CATEGORY STATISTICS
 * ============================================================
 */


/**
 * getCategoryStatistics()
 *
 * Calculates statistics using current project records.
 */
function getCategoryStatistics(category) {

    /**
     * Projects belonging to selected category.
     */
    const projects =
        state.projects.filter(

            project =>
                project.category ===
                category.name
        );


    /**
     * Count unique groups represented by those projects.
     */
    const participatingGroups =
        new Set(

            projects
                .map(
                    project =>
                        project.group_id
                )
                .filter(Boolean)

        ).size;


    /**
     * A project counts as a video when it contains a YouTube URL.
     */
    const videos =
        projects.filter(

            project =>
                Boolean(
                    project.youtube_url
                )

        ).length;


    return {

        projects:
            projects.length,

        groups:
            participatingGroups,

        videos
    };
}



/**
 * ============================================================
 * CATEGORY TABS
 * ============================================================
 */


/**
 * renderCategoryTabs()
 *
 * Creates all category tabs from categories.js.
 *
 * This prevents category names from being duplicated in HTML.
 */
function renderCategoryTabs() {

    const container =
        clear(
            '#category-tabs'
        );


    if (!container) {

        return;
    }


    CATEGORIES.forEach(

        category => {

            const active =
                state.activeCategory?.key ===
                category.key;


            const button =
                el(
                    'button',

                    {
                        className:

                            active

                                ? (
                                    'category-tab ' +
                                    'py-4 ' +
                                    'border-b-2 ' +
                                    'border-accent-gold ' +
                                    'text-navy-900 ' +
                                    'font-semibold ' +
                                    'flex items-center gap-2 ' +
                                    'whitespace-nowrap ' +
                                    'transition'
                                )

                                : (
                                    'category-tab ' +
                                    'py-4 ' +
                                    'border-b-2 ' +
                                    'border-transparent ' +
                                    'text-slate-500 ' +
                                    'hover:text-navy-900 ' +
                                    'flex items-center gap-2 ' +
                                    'whitespace-nowrap ' +
                                    'transition'
                                ),


                        attrs: {

                            type:
                                'button',

                            'aria-pressed':
                                String(active)
                        },


                        on: {

                            click:
                                () =>
                                    selectCategory(
                                        category
                                    )
                        }
                    },

                    [

                        el(
                            'span',

                            {
                                text:
                                    category.icon
                            }
                        ),

                        el(
                            'span',

                            {
                                text:
                                    category.name
                            }
                        )
                    ]
                );


            container.append(
                button
            );
        }
    );
}



/**
 * ============================================================
 * CATEGORY OVERVIEW
 * ============================================================
 */


/**
 * renderCategoryOverview()
 *
 * Changes the main category information panel.
 */
function renderCategoryOverview() {

    const category =
        state.activeCategory;


    if (!category) {

        return;
    }


    const stats =
        getCategoryStatistics(
            category
        );


    /**
     * Category icon.
     */
    setText(

        '#cat-emoji',

        category.icon
    );


    /**
     * Category heading.
     */
    setText(

        '#cat-title',

        category.name
    );


    /**
     * Category description from categories.js.
     */
    setText(

        '#cat-desc',

        category.description
    );


    /**
     * --------------------------------------------------------
     * PROJECT COUNT
     * --------------------------------------------------------
     */

    setText(

        '#cat-projects',

        `${stats.projects} ${
            stats.projects === 1
                ? 'Project'
                : 'Projects'
        }`
    );


    /**
     * --------------------------------------------------------
     * PARTICIPATING GROUP COUNT
     * --------------------------------------------------------
     */

    setText(

        '#cat-groups',

        `${stats.groups} ${
            stats.groups === 1
                ? 'Group'
                : 'Groups'
        }`
    );


    /**
     * --------------------------------------------------------
     * VIDEO COUNT
     * --------------------------------------------------------
     */

    setText(

        '#cat-videos',

        `${stats.videos} ${
            stats.videos === 1
                ? 'Video'
                : 'Videos'
        }`
    );


    /**
     * --------------------------------------------------------
     * CATEGORY IMAGE
     * --------------------------------------------------------
     */

    const image =
        document.getElementById(
            'cat-image'
        );


    if (image) {

        image.alt =
            category.name;


        setImageWithFallback(

            image,

            category.image,

            DEFAULT_PROJECT_IMAGE
        );
    }


    /**
     * --------------------------------------------------------
     * EXPLORE BUTTON
     * --------------------------------------------------------
     *
     * groups.html already understands:
     *
     * ?category=Presentations
     */

    const exploreButton =
        document.getElementById(
            'cat-explore-btn'
        );


    if (exploreButton) {

        exploreButton.href =
            'groups.html?category=' +
            encodeURIComponent(
                category.name
            );


        exploreButton.textContent =
            `Explore ${category.name} Projects →`;
    }
}



/**
 * ============================================================
 * SELECT CATEGORY
 * ============================================================
 */

function selectCategory(category) {

    /**
     * Save new selection.
     */
    state.activeCategory =
        category;


    /**
     * Rebuild UI.
     */
    renderCategoryTabs();

    renderCategoryOverview();


    /**
     * --------------------------------------------------------
     * UPDATE ADDRESS BAR
     * --------------------------------------------------------
     *
     * Example:
     *
     * categories.html?category=presentations
     *
     * No page reload is required.
     */

    const url =
        new URL(
            window.location.href
        );


    url.searchParams.set(

        'category',

        category.slug
    );


    window.history.replaceState(

        {},

        '',

        url
    );
}



/**
 * ============================================================
 * ADMIN LOGOUT
 * ============================================================
 */

async function handleLogout() {

    try {

        await logout();


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
 * INITIALIZE PAGE
 * ============================================================
 */

async function init() {

    /**
     * --------------------------------------------------------
     * SHARED NAVIGATION
     * --------------------------------------------------------
     *
     * Categories page keeps the small UTC information bar used
     * by the original design.
     */
    renderNavbar(

        'categories',

        {
            galleryHref:
                'groups.html#projects',

            showTimeBar:
                true
        }
    );


    /**
     * Determine category before data finishes loading so the
     * correct tab is ready.
     */
    state.activeCategory =
        getInitialCategory();


    try {

        /**
         * ----------------------------------------------------
         * LOAD DATA
         * ----------------------------------------------------
         */

        const [

            adminStatus,

            groups,

            projects

        ] = await Promise.all([

            isAdmin(),

            getGroups(),

            getAllProjects()
        ]);


        state.admin =
            adminStatus;


        state.groups =
            groups;


        state.projects =
            projects;


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
         * CATEGORY UI
         * ----------------------------------------------------
         */

        renderCategoryTabs();

        renderCategoryOverview();


        /**
         * ----------------------------------------------------
         * FOOTER
         * ----------------------------------------------------
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
            'Categories page failed to initialize:',
            error
        );


        /**
         * Category descriptions are static configuration, so we
         * can still display them even if Supabase temporarily
         * fails.
         */
        renderCategoryTabs();

        renderCategoryOverview();


        showToast(

            'Category statistics could not be loaded.',

            'error'
        );


        renderFooter([]);
    }
}



/**
 * Start page controller.
 */
init();