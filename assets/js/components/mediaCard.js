/**
 * ============================================================
 * ETU PORTAL - REUSABLE MEDIA / GALLERY CARD
 * ============================================================
 *
 * Purpose:
 * Displays one image from the media table.
 *
 * Used by the group page gallery.
 *
 * Supports:
 *
 * - thumbnail image
 * - full image
 * - title
 * - category
 * - display size
 * - draft state
 * - edit/delete actions
 * - lightbox opening
 * ============================================================
 */


import {

    el,

    setImageWithFallback

} from '../utils/dom.js';


import {

    DEFAULT_PROJECT_IMAGE

} from '../utils/format.js';


/**
 * ------------------------------------------------------------
 * createMediaCard()
 * ------------------------------------------------------------
 */
export function createMediaCard(

    media,

    options = {}
) {

    /**
     * Determine optional gallery layout style.
     *
     * Supported values:
     *
     * standard
     * wide
     * tall
     */
    const sizeClass =

        media.display_size === 'wide'

            ? 'media-wide'

            : media.display_size === 'tall'

                ? 'media-tall'

                : '';


    /**
     * Main gallery item.
     */
    const figure =
        el(
            'figure',

            {
                className:
                    `relative group ` +
                    `bg-white ` +
                    `rounded-md ` +
                    `border border-slate-200 ` +
                    `overflow-hidden ` +
                    `shadow-none ` +
                    `${sizeClass}`
            }
        );


    /**
     * Image itself is wrapped in a button so keyboard and mouse
     * users can open the lightbox.
     */
    const imageButton =
        el(
            'button',

            {
                className:
                    'block w-full text-left',

                attrs: {

                    type:
                        'button',

                    'aria-label':
                        `Open ${
                            media.title ||
                            'gallery image'
                        }`
                },

                on: {

                    click:
                        () => {

                            if (
                                typeof options.onOpen ===
                                'function'
                            ) {

                                options.onOpen(
                                    media
                                );
                            }
                        }
                }
            }
        );


    const image =
        el(
            'img',

            {
                className:
                    'w-full h-56 ' +
                    'object-cover ' +
                    'group-hover:scale-[1.02] ' +
                    'transition',

                attrs: {
                    loading: 'lazy',
                    decoding: 'async',
                    alt:
                        media.title ||
                        'Group gallery image'
                }
            }
        );


    /**
     * Image priority:
     *
     * thumbnail_url
     *      ↓
     * media_url
     *      ↓
     * fallback image
     */
    setImageWithFallback(

        image,

        media.thumbnail_url ||
        media.media_url,

        DEFAULT_PROJECT_IMAGE
    );


    imageButton.append(
        image
    );


    /**
     * ========================================================
     * CAPTION
     * ========================================================
     */

    const caption =
        el(
            'figcaption',

            {
                className:
                    'p-4'
            },

            [

                el(
                    'div',

                    {
                        className:
                            'font-semibold ' +
                            'text-sm ' +
                            'text-navy-900',

                        text:
                            media.title ||
                            'Gallery image'
                    }
                ),

                el(
                    'div',

                    {
                        className:
                            'text-xs ' +
                            'text-slate-500 ' +
                            'mt-1',

                        text:
                            media.category ||
                            'Group media'
                    }
                )
            ]
        );


    figure.append(

        imageButton,

        caption
    );


    /**
     * Draft marker.
     */
    if (
        options.admin &&
        media.is_published === false
    ) {

        figure.append(

            el(
                'span',

                {
                    className:
                        'absolute top-3 left-3 ' +
                        'bg-slate-950 ' +
                        'text-white ' +
                        'text-[10px] ' +
                        'font-bold ' +
                        'px-2 py-1 rounded',

                    text:
                        'DRAFT'
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
                        'absolute top-3 right-3 ' +
                        'flex gap-1 ' +
                        'opacity-100 ' +
                        'md:opacity-0 ' +
                        'md:group-hover:opacity-100 ' +
                        'transition'
                },

                [

                    /**
                     * Edit button.
                     */
                    el(
                        'button',

                        {
                            className:
                                'bg-white/95 ' +
                                'text-navy-900 ' +
                                'text-[10px] ' +
                                'font-bold ' +
                                'px-2 py-1 ' +
                                'rounded shadow',

                            text:
                                'Edit',

                            attrs: {

                                type:
                                    'button'
                            },

                            on: {

                                click:
                                    event => {

                                        /**
                                         * Prevent the underlying image click
                                         * from opening the lightbox.
                                         */
                                        event.stopPropagation();


                                        if (
                                            typeof options.onEdit ===
                                            'function'
                                        ) {

                                            options.onEdit(
                                                media
                                            );
                                        }
                                    }
                            }
                        }
                    ),


                    /**
                     * Delete button.
                     */
                    el(
                        'button',

                        {
                            className:
                                'bg-red-600 ' +
                                'text-white ' +
                                'text-[10px] ' +
                                'font-bold ' +
                                'px-2 py-1 ' +
                                'rounded shadow',

                            text:
                                'Delete',

                            attrs: {

                                type:
                                    'button'
                            },

                            on: {

                                click:
                                    event => {

                                        event.stopPropagation();


                                        if (
                                            typeof options.onDelete ===
                                            'function'
                                        ) {

                                            options.onDelete(
                                                media
                                            );
                                        }
                                    }
                            }
                        }
                    )
                ]
            );


        figure.append(
            actions
        );
    }


    return figure;
}