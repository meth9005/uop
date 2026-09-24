/**
 * ============================================================
 * ETU PORTAL - REUSABLE GROUP CARD
 * ============================================================
 *
 * Purpose:
 * Creates one standard card for student groups.
 *
 * Used by:
 *
 * - Homepage "Meet Our Groups"
 * - groups.html
 * - potentially other future sections
 *
 * Therefore Group AB01, AB02, AB03, AB04, AB05 etc. all use
 * exactly the same HTML structure.
 * ============================================================
 */


import {

    el,

    setImageWithFallback

} from '../utils/dom.js';


import {

    DEFAULT_GROUP_IMAGE,

    groupCode,

    formatCount

} from '../utils/format.js';


/**
 * ------------------------------------------------------------
 * createGroupCard()
 * ------------------------------------------------------------
 *
 * group:
 * Group object returned by dataService.getGroups().
 *
 * options:
 *
 * showStats
 *     whether project/student counts should appear.
 *
 * admin
 *     allows the component to show DRAFT state.
 */
export function createGroupCard(

    group,

    options = {}
) {

    /**
     * The entire card links to the reusable group page:
     *
     * group.html?group=ab04
     */
    const card =
        el(
            'a',

            {
                className:
                    'showcase-card group block ' +
                    'bg-white ' +
                    'rounded-md ' +
                    'border border-slate-200 ' +
                    'overflow-hidden ' +
                    'shadow-none ' +
                    ' ' +
                    'transition',

                attrs: {

                    href:
                        `group.html?group=` +
                        encodeURIComponent(
                            group.slug
                        ),

                    'aria-label':
                        `Open ${group.name}`
                }
            }
        );


    /**
     * ========================================================
     * IMAGE AREA
     * ========================================================
     */

    const imageWrap =
        el(
            'div',

            {
                className:
                    'relative h-44 ' +
                    'overflow-hidden ' +
                    'bg-slate-100'
            }
        );


    const image =
        el(
            'img',

            {
                className:
                    'w-full h-full ' +
                    'object-cover ' +
                    '' +
                    'transition duration-300',

                attrs: {
                    loading: 'lazy',
                    decoding: 'async',
                    alt:
                        group.name ||
                        'Student group'
                }
            }
        );


    /**
     * Image priority:
     *
     * card_image
     *      ↓
     * cover_image
     *      ↓
     * default university image
     */
    setImageWithFallback(

        image,

        group.card_image ||
        group.cover_image,

        DEFAULT_GROUP_IMAGE
    );


    imageWrap.append(

        image
    );


    /**
     * Small AB01 / AB02 etc. badge.
     */
    imageWrap.append(

        el(
            'span',

            {
                className:
                    'absolute top-3 left-3 ' +
                    'bg-accent-gold ' +
                    'text-navy-900 ' +
                    'text-xs font-bold ' +
                    'px-2.5 py-1 rounded',

                text:
                    groupCode(group)
            }
        )
    );


    /**
     * Project count shown over image.
     */
    if (
        options.showStats !== false
    ) {

        imageWrap.append(

            el(
                'span',

                {
                    className:
                        'absolute bottom-3 right-3 ' +
                        'bg-navy-950/80 ' +
                        'text-white text-xs ' +
                        'px-2 py-0.5 rounded ' +
                        'backdrop-blur-sm',

                    text:
                        formatCount(
                            group.project_count,
                            'project'
                        )
                }
            )
        );
    }


    /**
     * Administrators can see unpublished groups.
     *
     * Show a clear DRAFT badge so unpublished content is not
     * confused with public content.
     */
    if (
        options.admin &&
        group.is_published === false
    ) {

        imageWrap.append(

            el(
                'span',

                {
                    className:
                        'absolute top-3 right-3 ' +
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
     * CARD CONTENT
     * ========================================================
     */

    const content =
        el(
            'div',

            {
                className:
                    'p-5'
            },

            [

                /**
                 * Group name.
                 */
                el(
                    'h3',

                    {
                        className:
                            'font-bold ' +
                            'text-navy-900 ' +
                            'text-base mb-1 ' +
                            'group-hover:text-accent-gold ' +
                            'transition',

                        text:
                            group.name
                    }
                ),


                /**
                 * Group tagline.
                 *
                 * If the administrator has not entered one yet,
                 * display a neutral label instead of fake content.
                 */
                el(
                    'p',

                    {
                        className:
                            'text-xs ' +
                            'text-slate-500 ' +
                            'mb-4 ' +
                            'line-clamp-2 ' +
                            'min-h-8',

                        text:
                            group.tagline ||
                            'Student showcase group'
                    }
                )
            ]
        );


    /**
     * Homepage / browse card statistics.
     */
    if (
        options.showStats !== false
    ) {

        content.append(

            el(
                'div',

                {
                    className:
                        'text-xs ' +
                        'text-slate-400 ' +
                        'flex justify-between ' +
                        'pt-3 ' +
                        'border-t ' +
                        'border-slate-100'
                },

                [

                    el(
                        'span',

                        {
                            text:
                                formatCount(
                                    group.project_count,
                                    'project'
                                )
                        }
                    ),

                    el(
                        'span',

                        {
                            text:
                                formatCount(
                                    group.member_count,
                                    'student'
                                )
                        }
                    )
                ]
            )
        );
    }

    /**
     * Alternative compact card appearance.
     */
    else {

        content.append(

            el(
                'span',

                {
                    className:
                        'text-xs font-semibold ' +
                        'text-accent-gold ' +
                        'group-hover:underline',

                    text:
                        'View group →'
                }
            )
        );
    }


    card.append(

        imageWrap,

        content
    );


    return card;
}