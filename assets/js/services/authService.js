/**
 * ============================================================
 * ETU PORTAL - AUTHENTICATION SERVICE
 * ============================================================
 *
 * File:
 * assets/js/services/authService.js
 *
 *
 * PURPOSE:
 *
 * Handles all administrator authentication logic.
 *
 *
 * FUNCTIONS PROVIDED:
 *
 * getSession()
 *     Get current login session.
 *
 * getCurrentUser()
 *     Get current Supabase user.
 *
 * isAdmin()
 *     Check whether logged-in user is the ETU administrator.
 *
 * login()
 *     Sign in using email/password.
 *
 * logout()
 *     End current authentication session.
 *
 * assertAdmin()
 *     Protect CREATE / UPDATE / DELETE operations.
 *
 *
 * IMPORTANT:
 *
 * Logged in ≠ Administrator.
 *
 * A user must:
 *
 * 1. authenticate successfully
 * 2. pass the database is_etu_admin() check
 * ============================================================
 */


// Import the shared Supabase client.
import {

    supabase

} from './supabase.js';



/**
 * ============================================================
 * GET CURRENT SESSION
 * ============================================================
 */


/**
 * getSession()
 *
 * Returns:
 *
 * Supabase session object
 *
 * OR
 *
 * null
 *
 * when nobody is logged in.
 */
export async function getSession() {

    const {

        data,

        error

    } = await supabase.auth.getSession();


    if (error) {

        console.error(
            'Could not read authentication session:',
            error
        );


        throw error;
    }


    return data.session || null;
}



/**
 * ============================================================
 * GET CURRENT USER
 * ============================================================
 */


/**
 * getCurrentUser()
 *
 * Retrieves the authenticated user's verified Supabase Auth
 * record.
 */
export async function getCurrentUser() {

    const {

        data,

        error

    } = await supabase.auth.getUser();


    if (error) {

        console.error(
            'Could not get authenticated user:',
            error
        );


        return null;
    }


    return data.user || null;
}



/**
 * ============================================================
 * CHECK ADMINISTRATOR AUTHORIZATION
 * ============================================================
 */


/**
 * isAdmin()
 *
 * This is the important authorization check.
 *
 *
 * FLOW:
 *
 * Current browser
 *      ↓
 * Supabase Auth session exists?
 *      ↓
 * YES
 *      ↓
 * call public.is_etu_admin()
 *      ↓
 * true / false
 */
export async function isAdmin() {

    /**
     * --------------------------------------------------------
     * STEP 1 - CHECK LOGIN SESSION
     * --------------------------------------------------------
     */

    const session =
        await getSession();


    /**
     * Nobody signed in.
     */
    if (!session) {

        return false;
    }


    /**
     * --------------------------------------------------------
     * STEP 2 - ASK DATABASE WHETHER USER IS ADMIN
     * --------------------------------------------------------
     */

    const {

        data,

        error

    } = await supabase.rpc(
        'is_etu_admin'
    );


    if (error) {

        console.error(
            'Admin authorization RPC failed:',
            error
        );


        return false;
    }


    /**
     * Supabase SQL function returns boolean.
     */
    return data === true;
}



/**
 * ============================================================
 * ADMIN LOGIN
 * ============================================================
 */


/**
 * login()
 *
 * Receives:
 *
 * email
 * password
 *
 * from admin-login.html.
 */
export async function login(

    email,

    password
) {

    /**
     * Clean email input.
     */
    const cleanEmail =
        String(email || '')
            .trim()
            .toLowerCase();


    /**
     * Password should never be trimmed or modified because
     * spaces could theoretically form part of the password.
     */
    const cleanPassword =
        String(password || '');


    /**
     * Basic local validation.
     */
    if (!cleanEmail) {

        throw new Error(
            'Email is required.'
        );
    }


    if (!cleanPassword) {

        throw new Error(
            'Password is required.'
        );
    }


    /**
     * --------------------------------------------------------
     * STEP 1 - SUPABASE AUTHENTICATION
     * --------------------------------------------------------
     */

    const {

        data,

        error

    } =
        await supabase.auth.signInWithPassword({

            email:
                cleanEmail,

            password:
                cleanPassword
        });


    /**
     * Incorrect email/password etc.
     */
    if (error) {

        console.error(
            'Supabase login error:',
            error
        );


        throw error;
    }


    /**
     * --------------------------------------------------------
     * STEP 2 - AUTHORIZATION
     * --------------------------------------------------------
     *
     * A valid Supabase account is NOT automatically allowed to
     * administer this portal.
     */

    const authorized =
        await isAdmin();


    /**
     * If another account signed in successfully but does not
     * belong to the ETU administrator:
     *
     * immediately sign it out.
     */
    if (!authorized) {

        await supabase.auth.signOut();


        throw new Error(
            'This account is not authorized to manage the ETU portal.'
        );
    }


    /**
     * Successful authorized administrator session.
     */
    return data.session;
}



/**
 * ============================================================
 * LOGOUT
 * ============================================================
 */


/**
 * Ends the current Supabase login session.
 */
export async function logout() {

    const {

        error

    } =
        await supabase.auth.signOut();


    if (error) {

        console.error(
            'Supabase logout error:',
            error
        );


        throw error;
    }


    return true;
}



/**
 * ============================================================
 * ADMIN WRITE GUARD
 * ============================================================
 */


/**
 * assertAdmin()
 *
 * dataService.js calls this before:
 *
 * INSERT
 * UPDATE
 * DELETE
 *
 *
 * It is an application-level check.
 *
 * RLS remains the real database security boundary.
 */
export async function assertAdmin() {

    const authorized =
        await isAdmin();


    if (!authorized) {

        throw new Error(
            'Administrator authorization is required for this action.'
        );
    }


    return true;
}



/**
 * ============================================================
 * AUTH STATE LISTENER
 * ============================================================
 */


/**
 * Allows other components to listen for:
 *
 * SIGNED_IN
 * SIGNED_OUT
 * TOKEN_REFRESHED
 * etc.
 */
export function onAuthStateChange(callback) {

    const {

        data

    } =
        supabase.auth.onAuthStateChange(

            (event, session) => {

                if (
                    typeof callback === 'function'
                ) {

                    callback(
                        event,
                        session
                    );
                }
            }
        );


    return data.subscription;
}