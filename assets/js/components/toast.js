/**
 * ============================================================
 * ETU PORTAL - TOAST NOTIFICATIONS
 * ============================================================
 *
 * Purpose:
 * Shows small temporary success/error messages after admin
 * actions.
 *
 * Examples:
 *
 *     Student added.
 *
 *     Project updated.
 *
 *     Could not delete media.
 *
 * This is cleaner than repeatedly using alert().
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * showToast()
 * ------------------------------------------------------------
 *
 * message:
 * Message displayed.
 *
 * type:
 *
 *     success
 *     error
 */
export function showToast(

    message,

    type = 'success'
) {

    /**
     * Reuse existing toast container if one already exists.
     */
    let container =
        document.getElementById(
            'toast-container'
        );


    /**
     * First notification:
     *
     * automatically create the notification container.
     */
    if (!container) {

        container =
            document.createElement(
                'div'
            );


        container.id =
            'toast-container';


        container.className =
            'toast-container';


        document.body.append(
            container
        );
    }


    /**
     * Create notification.
     */
    const toast =
        document.createElement(
            'div'
        );


    /**
     * Select success/error appearance.
     */
    toast.className =
        `app-toast ${
            type === 'error'

                ? 'app-toast-error'

                : 'app-toast-success'
        }`;


    /**
     * Use textContent to safely display message text.
     */
    toast.textContent =
        message;


    container.append(
        toast
    );


    /**
     * Automatically start hiding after 3.2 seconds.
     */
    window.setTimeout(

        () => {

            toast.classList.add(
                'app-toast-hide'
            );


            /**
             * Remove element after fade animation finishes.
             */
            window.setTimeout(

                () =>
                    toast.remove(),

                250
            );
        },

        3200
    );
}