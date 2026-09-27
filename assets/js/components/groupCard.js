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
                className: 'etu-card group-card reveal',

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
                className: 'group-card-image'
            }
        );


    const image =
        el(
            'img',

            {
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
     * Small AB01 / AB02 etc. badge (top-left).
     */
    imageWrap.append(

        el(
            'span',

            {
                className: 'group-badge',

                text:
                    groupCode(group)
            }
        )
    );


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
                    className: 'group-badge group-badge-draft',

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
                className: 'group-card-body'
            },

            [

                /**
                 * Group name.
                 */
                el(
                    'h3',

                    {
                        className: 'group-card-title',

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
                        className: 'group-card-tagline',

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
                    className: 'group-card-stats'
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
                    className: 'group-card-view-link',

                    text:
                        'View group'
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