/**
 * ============================================================
 * ETU PORTAL - REUSABLE PROJECT CARD
 * ============================================================
 *
 * Purpose:
 * Creates one standard project card.
 *
 * Used by:
 *
 * - Homepage latest projects
 * - groups.html project browser
 * - individual group page
 *
 * Administrator mode can additionally display:
 *
 * - Edit
 * - Delete
 * - Draft state
 *
 * This removes repeated project-card HTML from multiple pages.
 * ============================================================
 */


import {

    el,

    setImageWithFallback

} from '../utils/dom.js';


import {

    DEFAULT_PROJECT_IMAGE,

groupCode,

    toYouTubeEmbedUrl

} from '../utils/format.js';


/**
 * ------------------------------------------------------------
 * createProjectCard()
 * ------------------------------------------------------------
 *
 * project:
 * A project record from Supabase.
 *
 * options.showGroup:
 * Shows/hides group badge/link.
 *
 * options.group:
 * Group object when the page already knows the current group.
 *
 * options.admin:
 * Enables management buttons.
 *
 * options.onEdit:
 * Callback executed when Edit is clicked.
 *
 * options.onDelete:
 * Callback executed when Delete is clicked.
 */
export function createProjectCard(

    project,

    options = {}
) {

    const card =
        el(
            'article',

            {
                className:
                    'showcase-card bg-white ' +
                    'border border-slate-200 ' +
                    'rounded-md ' +
                    'overflow-hidden ' +
                    'shadow-none ' +
                    ' ' +
                    'transition ' +
                    'flex flex-col ' +
                    'justify-between'
            }
        );


    /**
     * ========================================================
     * IMAGE SECTION
     * ========================================================
     */

    const imageWrap =
        el(
            'div',

            {
                className:
                    'relative h-44 ' +
                    'bg-slate-100 ' +
                    'overflow-hidden'
            }
        );


    const image =
        el(
            'img',

            {
                className:
                    'w-full h-full object-cover',

                attrs: {
                    loading: 'lazy',
                    decoding: 'async',
                    alt:
                        project.title ||
                        'Student project'
                }
            }
        );


    /**
     * projects.file_url contains the project's image.
     *
     * We intentionally keep the existing database field name
     * instead of renaming it during this refactor.
     */
    setImageWithFallback(

        image,

        project.file_url,

        DEFAULT_PROJECT_IMAGE
    );


    imageWrap.append(
        image
    );


    /**
     * Project may contain related group information from:
     *
     * getAllProjects()
     *
     * or the group can be supplied explicitly by group.html.
     */
    const group =
        project.groups ||
        options.group ||
        null;


    /**
     * Show group badge when this project appears outside its
     * own group page.
     */
    if (
        options.showGroup !== false &&
        group
    ) {

        imageWrap.append(

            el(
                'a',

                {
                    className:
                        'absolute top-3 left-3 ' +
                        'bg-accent-gold ' +
                        'text-navy-900 ' +
                        'text-[10px] font-bold ' +
                        'px-2 py-0.5 ' +
                        'rounded shadow ' +
                        'hover:bg-white transition',

                    text:
                        groupCode(group),

                    attrs: {

                        href:
                            `group.html?group=` +
                            encodeURIComponent(
                                group.slug
                            )
                    }
                }
            )
        );
    }


/**
     * Optional duration label.
     *
     * Example:
     *
     * 08:20
     */
    if (project.duration_label) {

        imageWrap.append(

            el(
                'span',

                {
                    className:
                        'absolute bottom-2 right-2 ' +
                        'bg-black/70 ' +
                        'text-white text-[10px] ' +
                        'px-1.5 py-0.5 ' +
                        'rounded font-mono',

                    text:
                        project.duration_label
                }
            )
        );
    }


    /**
     * Draft badge visible only to admin.
     */
    if (
        options.admin &&
        project.is_published === false
    ) {

        imageWrap.append(

            el(
                'span',

                {
                    className:
                        'absolute bottom-2 left-2 ' +
                        'bg-slate-950 text-white ' +
                        'text-[10px] font-bold ' +
                        'px-2 py-1 rounded',

                    text:
                        'DRAFT'
                }
            )
        );
    }


    /**
     * ========================================================
     * PROJECT INFORMATION
     * ========================================================
     */

    const body =
        el(
            'div',

            {
                className:
                    'p-5'
            },

            [

                /**
                 * Category label.
                 */
                el(
                    'span',

                    {
                        className:
                            'text-[10px] ' +
                            'text-blue-600 ' +
                            'font-semibold ' +
                            'uppercase ' +
                            'tracking-wider ' +
                            'mb-1 block',

                        text:
                            project.category ||
                            'Project'
                    }
                ),


                /**
                 * Project title.
                 */
                el(
                    'h3',

                    {
                        className:
                            'font-bold ' +
                            'text-navy-900 ' +
                            'text-sm ' +
                            'mb-2 ' +
                            'leading-snug',

                        text:
                            project.title
                    }
                ),


                /**
                 * Description.
                 */
                el(
                    'p',

                    {
                        className:
                            'text-xs ' +
                            'text-slate-500 ' +
                            'mb-3 ' +
                            'line-clamp-3 ' +
                            'leading-relaxed ' +
                            'min-h-12',

                        text:
                            project.description ||
                            'Project details will be added by the group administrator.'
                    }
                )
            ]
        );


    /**
     * Featured project marker.
     */
    if (project.is_featured) {

        body.append(

            el(
                'span',

                {
                    className:
                        'inline-flex ' +
                        'text-[10px] ' +
                        'font-semibold ' +
                        'bg-amber-50 ' +
                        'text-amber-700 ' +
                        'border border-amber-200 ' +
                        'px-2 py-1 rounded',

                    text:
                        'Featured'
                }
            )
        );
    }


    /**
     * ========================================================
     * CARD FOOTER
     * ========================================================
     */

    const footer =
        el(
            'div',

            {
                className:
                    'px-5 py-4 ' +
                    'border-t border-slate-100 ' +
                    'flex flex-wrap ' +
                    'items-center ' +
                    'justify-between ' +
                    'gap-2'
            }
        );


    /**
     * Link back to the project's group.
     */
    if (group) {

        footer.append(

            el(
                'a',

                {
                    className:
                        'text-xs font-bold ' +
                        'text-accent-gold ' +
                        'hover:underline',

                    text:
                        `View in ${groupCode(group)} →`,

                    attrs: {

                        href:
                            `group.html?group=` +
                            encodeURIComponent(
                                group.slug
                            )
                    }
                }
            )
        );
    }

    else {

        /**
         * Empty element preserves footer spacing.
         */
        footer.append(
            el('span')
        );
    }


    /**
     * Direct YouTube link if the project contains a video.
     */
    if (toYouTubeEmbedUrl(project.youtube_url)) {

        footer.append(

            el(
                'a',

                {
                    className:
                        'text-xs font-semibold ' +
                        'text-navy-900 ' +
                        'hover:text-accent-gold',

                    text:
                        'Watch video ↗',

                    attrs: {

                        href:
                            project.youtube_url,

                        target:
                            '_blank',

                        rel:
                            'noopener noreferrer'
                    }
                }
            )
        );
    }


    /**
     * ========================================================
     * ADMIN ACTIONS
     * ========================================================
     */

    if (options.admin) {

        const actions =
            el(
                'div',

                {
                    className:
                        'w-full flex ' +
                        'justify-end gap-2 pt-2'
                }
            );


        /**
         * Edit button.
         */
        if (options.onEdit) {

            actions.append(

                el(
                    'button',

                    {
                        className:
                            'text-[11px] ' +
                            'font-semibold ' +
                            'px-3 py-1.5 ' +
                            'rounded ' +
                            'border border-slate-300 ' +
                            'hover:bg-slate-50',

                        text:
                            'Edit',

                        attrs: {

                            type:
                                'button'
                        },

                        on: {

                            click:
                                () =>
                                    options.onEdit(
                                        project
                                    )
                        }
                    }
                )
            );
        }


        /**
         * Delete button.
         */
        if (options.onDelete) {

            actions.append(

                el(
                    'button',

                    {
                        className:
                            'text-[11px] ' +
                            'font-semibold ' +
                            'px-3 py-1.5 ' +
                            'rounded ' +
                            'border border-red-200 ' +
                            'text-red-700 ' +
                            'hover:bg-red-50',

                        text:
                            'Delete',

                        attrs: {

                            type:
                                'button'
                        },

                        on: {

                            click:
                                () =>
                                    options.onDelete(
                                        project
                                    )
                        }
                    }
                )
            );
        }


        footer.append(
            actions
        );
    }


    card.append(

        imageWrap,

        body,

        footer
    );


    return card;
}