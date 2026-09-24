/**
 * ============================================================
 * ETU PORTAL - SUPABASE CLIENT
 * ============================================================
 *
 * File:
 * assets/js/services/supabase.js
 *
 *
 * PURPOSE:
 *
 * Creates ONE shared Supabase browser client.
 *
 * Authentication services and data services both import this
 * client instead of creating separate connections.
 *
 * IMPORTANT:
 *
 * The key below is the browser/publishable key.
 *
 * It is NOT the service_role secret.
 *
 * Actual protection comes from Supabase Row Level Security.
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * SUPABASE PROJECT INFORMATION
 * ------------------------------------------------------------
 */

const SUPABASE_URL =
    'https://dbfnjoejntbxdnzixpls.supabase.co';


const SUPABASE_PUBLISHABLE_KEY =
    'sb_publishable_YjlyCxHROS4bddkt0T7A1A_PqkjBQEk';


/**
 * ------------------------------------------------------------
 * VERIFY SUPABASE CDN
 * ------------------------------------------------------------
 *
 * Every HTML page using this service must first contain:
 *
 * <script
 *   src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2">
 * </script>
 *
 * That script creates:
 *
 * window.supabase
 */
if (
    !window.supabase ||
    typeof window.supabase.createClient !== 'function'
) {

    throw new Error(
        'Supabase JavaScript library was not loaded.'
    );
}


/**
 * ------------------------------------------------------------
 * CREATE SHARED CLIENT
 * ------------------------------------------------------------
 */

export const supabase =
    window.supabase.createClient(

        SUPABASE_URL,

        SUPABASE_PUBLISHABLE_KEY
    );