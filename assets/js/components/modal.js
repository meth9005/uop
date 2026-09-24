/**
 * ============================================================
 * ETU PORTAL - MODAL MANAGEMENT
 * ============================================================
 *
 * Purpose:
 * Provides shared functions for opening and closing forms and
 * lightboxes.
 *
 * Used for:
 *
 * - Edit Group
 * - Add/Edit Student
 * - Add/Edit Project
 * - Add/Edit Media
 * - Gallery lightbox
 *
 * This replaces separate modal open/close functions scattered
 * throughout the old group.html.
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * openModal()
 * ------------------------------------------------------------
 *
 * Opens one modal using its HTML ID.
 *
 * Example:
 *
 *     openModal('member-modal');
 */
export function openModal(id) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal) {

        return;
    }


    /**
     * Remove hidden state.
     */
    modal.hidden = false;


    /**
     * Prevent page behind the modal from scrolling.
     */
    document.body.classList.add(
        'modal-open'
    );


    /**
     * Move keyboard focus inside the modal.
     *
     * This improves usability and accessibility.
     */
    const firstInput =
        modal.querySelector(
            `
                input:not([type="hidden"]),
                textarea,
                select,
                button
            `
        );


    window.setTimeout(

        () =>
            firstInput?.focus(),

        0
    );
}


/**
 * ------------------------------------------------------------
 * closeModal()
 * ------------------------------------------------------------
 *
 * Closes one modal.
 */
export function closeModal(id) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal) {

        return;
    }


    modal.hidden = true;


    /**
     * Only restore body scrolling if no other modal is open.
     */
    if (
        !document.querySelector(
            '.app-modal:not([hidden])'
        )
    ) {

        document.body.classList.remove(
            'modal-open'
        );
    }
}


/**
 * ------------------------------------------------------------
 * initModalSystem()
 * ------------------------------------------------------------
 *
 * Runs once on pages containing modals.
 *
 * Adds standard behaviour:
 *
 * - close buttons
 * - click outside modal
 * - Escape key
 */
export function initModalSystem() {

    /**
     * ========================================================
     * CLOSE BUTTONS
     * ========================================================
     *
     * Any button containing:
     *
     * data-modal-close="member-modal"
     *
     * automatically closes that modal.
     */
    document
        .querySelectorAll(
            '[data-modal-close]'
        )
        .forEach(

            button => {

                button.addEventListener(

                    'click',

                    () => {

                        closeModal(

                            button.getAttribute(
                                'data-modal-close'
                            )
                        );
                    }
                );
            }
        );


    /**
     * ========================================================
     * CLICK BACKDROP TO CLOSE
     * ========================================================
     */
    document
        .querySelectorAll(
            '.app-modal'
        )
        .forEach(

            modal => {

                modal.addEventListener(

                    'click',

                    event => {

                        /**
                         * Only close when the user clicked the
                         * backdrop itself.
                         *
                         * Clicking inside the modal panel does
                         * not close it.
                         */
                        if (
                            event.target === modal
                        ) {

                            closeModal(
                                modal.id
                            );
                        }
                    }
                );
            }
        );


    /**
     * ========================================================
     * ESCAPE KEY
     * ========================================================
     */
    document.addEventListener(

        'keydown',

        event => {

            if (
                event.key !== 'Escape'
            ) {

                return;
            }


            /**
             * Close any currently visible modal.
             */
            document
                .querySelectorAll(
                    '.app-modal:not([hidden])'
                )
                .forEach(

                    modal => {

                        closeModal(
                            modal.id
                        );
                    }
                );
        }
    );
}