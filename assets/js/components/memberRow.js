/**
 * ============================================================
 * ETU PORTAL - REUSABLE MEMBER TABLE ROW
 * ============================================================
 *
 * Purpose:
 * Creates one student/member row inside the group roster.
 *
 * Public users see:
 *
 * Reg No | Name | Committee | Role
 *
 * Administrator additionally sees:
 *
 * Edit | Delete
 *
 * The component also identifies obviously incomplete
 * registration numbers without changing them.
 * ============================================================
 */


import {

    el

} from '../utils/dom.js';


import {

    isIncompleteRegistration

} from '../utils/format.js';


/**
 * ------------------------------------------------------------
 * createMemberRow()
 * ------------------------------------------------------------
 */
export function createMemberRow(

    member,

    options = {}
) {

    /**
     * Draft rows receive a slight background difference for
     * administrators.
     */
    const row =
        el(
            'tr',

            {
                className:
                    (
                        member.is_published === false &&
                        options.admin
                    )

                        ? 'bg-slate-50/80'

                        : ''
            }
        );


    /**
     * ========================================================
     * REGISTRATION NUMBER CELL
     * ========================================================
     */

    const regCell =
        el(
            'td',

            {
                className:
                    'py-3 px-4 ' +
                    'font-mono ' +
                    'text-slate-600 ' +
                    'align-top'
            }
        );


    regCell.append(

        el(
            'div',

            {
                text:
                    member.reg_no ||
                    '—'
            }
        )
    );


    /**
     * Do not change incomplete registration numbers.
     *
     * Simply flag them for administrator review.
     */
    if (
        isIncompleteRegistration(
            member.reg_no
        )
    ) {

        regCell.append(

            el(
                'span',

                {
                    className:
                        'inline-flex mt-1 ' +
                        'text-[9px] ' +
                        'font-semibold ' +
                        'text-amber-700 ' +
                        'bg-amber-50 ' +
                        'border border-amber-200 ' +
                        'px-1.5 py-0.5 rounded',

                    text:
                        'Needs review'
                }
            )
        );
    }


    /**
     * ========================================================
     * PUBLIC MEMBER INFORMATION
     * ========================================================
     */

    row.append(

        regCell,


        /**
         * Student name.
         */
        el(
            'td',

            {
                className:
                    'py-3 px-4 ' +
                    'font-medium ' +
                    'text-slate-800 ' +
                    'align-top',

                text:
                    member.name
            }
        ),


        /**
         * Committee responsibility.
         */
        el(
            'td',

            {
                className:
                    'py-3 px-4 ' +
                    'text-slate-600 ' +
                    'align-top',

                text:
                    member.committee ||
                    '—'
            }
        ),


        /**
         * Role.
         */
        el(
            'td',

            {
                className:
                    'py-3 px-4 ' +
                    'text-right ' +
                    'text-slate-600 ' +
                    'align-top',

                text:
                    member.role ||
                    'Member'
            }
        )
    );


    /**
     * ========================================================
     * ADMINISTRATOR ACTION COLUMN
     * ========================================================
     */

    if (options.admin) {

        const actionsCell =
            el(
                'td',

                {
                    className:
                        'py-3 px-4 ' +
                        'text-right ' +
                        'align-top'
                }
            );


        const actions =
            el(
                'div',

                {
                    className:
                        'flex justify-end gap-2'
                }
            );


        /**
         * Draft indicator.
         */
        if (
            member.is_published === false
        ) {

            actions.append(

                el(
                    'span',

                    {
                        className:
                            'text-[9px] ' +
                            'font-bold ' +
                            'bg-slate-800 ' +
                            'text-white ' +
                            'px-2 py-0.5 rounded',

                        text:
                            'DRAFT'
                    }
                )
            );
        }


        /**
         * Edit member.
         */
        actions.append(

            el(
                'button',

                {
                    className:
                        'text-[11px] ' +
                        'font-semibold ' +
                        'text-navy-900 ' +
                        'hover:text-accent-gold',

                    text:
                        'Edit',

                    attrs: {

                        type:
                            'button'
                    },

                    on: {

                        click:
                            () => {

                                if (
                                    typeof options.onEdit ===
                                    'function'
                                ) {

                                    options.onEdit(
                                        member
                                    );
                                }
                            }
                    }
                }
            )
        );


        /**
         * Delete member.
         */
        actions.append(

            el(
                'button',

                {
                    className:
                        'text-[11px] ' +
                        'font-semibold ' +
                        'text-red-600 ' +
                        'hover:text-red-800',

                    text:
                        'Delete',

                    attrs: {

                        type:
                            'button'
                    },

                    on: {

                        click:
                            () => {

                                if (
                                    typeof options.onDelete ===
                                    'function'
                                ) {

                                    options.onDelete(
                                        member
                                    );
                                }
                            }
                    }
                }
            )
        );


        actionsCell.append(
            actions
        );


        row.append(
            actionsCell
        );
    }


    return row;
}