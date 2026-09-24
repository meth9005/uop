/**
 * ============================================================
 * ETU PORTAL - EMPTY STATE COMPONENT
 * ============================================================
 *
 * Purpose:
 * Provides a consistent message whenever a section contains
 * no database records.
 *
 * Examples:
 *
 * - No projects have been published yet.
 * - No gallery media exists.
 * - No student groups exist.
 *
 * Instead of leaving a blank area, visitors receive a clear
 * professional message.
 * ============================================================
 */


import {

    el

} from '../utils/dom.js';


/**
 * ------------------------------------------------------------
 * createEmptyState()
 * ------------------------------------------------------------
 *
 * message:
 * Text shown to the visitor.
 *
 * options.className:
 * Optional custom appearance.
 */
export function createEmptyState(

    message,

    options = {}
) {

    return el(
        'div',

        {
            className:

                options.className ||

                (
                    'col-span-full ' +
                    'py-10 ' +
                    'text-center ' +
                    'text-sm ' +
                    'text-slate-400'
                ),

            text:
                message
        }
    );
}