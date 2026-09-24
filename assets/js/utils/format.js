/**
 * ============================================================
 * ETU PORTAL - FORMATTING UTILITIES
 * ============================================================
 *
 * Purpose:
 * Contains presentation helpers that are reused across the UI.
 *
 * These functions DO NOT modify the database.
 * They only determine how information should be displayed.
 * ============================================================
 */


// Import category information.
import {
    getCategoryByName
} from '../config/categories.js';


/**
 * ------------------------------------------------------------
 * DEFAULT IMAGES
 * ------------------------------------------------------------
 *
 * Used whenever an administrator has not yet assigned an image
 * to a group/project.
 *
 * The fallback image is presentation-only.
 * It is NOT written into Supabase automatically.
 */
export const DEFAULT_GROUP_IMAGE =
    'assets/images/uopefac.jpg';


export const DEFAULT_PROJECT_IMAGE =
    'assets/images/uopefac.jpg';


/**
 * ------------------------------------------------------------
 * groupCode()
 * ------------------------------------------------------------
 *
 * Converts:
 *
 *     ab01
 *
 * into:
 *
 *     AB01
 *
 * Used for small group badges.
 */
export function groupCode(groupOrSlug) {

    const slug =
        typeof groupOrSlug === 'string'

            ? groupOrSlug

            : groupOrSlug?.slug;


    return String(
        slug || 'group'
    ).toUpperCase();
}


/**
 * ------------------------------------------------------------
 * categoryIcon()
 * ------------------------------------------------------------
 *
 * Gets the icon associated with a project category.
 *
 * Example:
 *
 * Presentations → 📊
 */
export function categoryIcon(categoryName) {

    return (
        getCategoryByName(categoryName)?.icon ||
        '📁'
    );
}


/**
 * ------------------------------------------------------------
 * isIncompleteRegistration()
 * ------------------------------------------------------------
 *
 * Checks whether a student's registration number appears
 * incomplete.
 *
 * IMPORTANT:
 *
 * This does NOT modify or reject existing records.
 *
 * We already discovered legitimate database rows containing:
 *
 *     E
 *     E/
 *     E/25/---
 *
 * The portal will preserve them but show a "Needs review"
 * warning to the administrator.
 */
export function isIncompleteRegistration(regNo) {

    const value =
        String(regNo || '')
            .trim()
            .toUpperCase();


    // Missing registration number.
    if (!value) {

        return true;
    }


    // Known incomplete placeholders.
    if (
        value === 'E' ||
        value === 'E/' ||
        value.includes('---')
    ) {

        return true;
    }


    // Extremely short values are probably incomplete.
    if (value.length < 5) {

        return true;
    }


    return false;
}


/**
 * ------------------------------------------------------------
 * toYouTubeEmbedUrl()
 * ------------------------------------------------------------
 *
 * Converts normal YouTube URLs into iframe-friendly embed URLs.
 *
 * Supports examples such as:
 *
 * https://youtu.be/VIDEO_ID
 *
 * https://www.youtube.com/watch?v=VIDEO_ID
 *
 * https://www.youtube.com/shorts/VIDEO_ID
 */
export function toYouTubeEmbedUrl(url) {

    const value =
        String(url || '')
            .trim();


    // No URL provided.
    if (!value) {

        return '';
    }


    try {

        const parsed =
            new URL(value);


        /**
         * Handle:
         *
         * https://youtu.be/VIDEO_ID
         */
        if (
            parsed.hostname.includes('youtu.be')
        ) {

            const id =
                parsed.pathname
                    .replace('/', '')
                    .trim();


            return id
                ? `https://www.youtube.com/embed/${id}`
                : '';
        }


        /**
         * Handle standard YouTube domain.
         */
        if (
            parsed.hostname.includes('youtube.com')
        ) {

            /**
             * Already an embed URL.
             */
            if (
                parsed.pathname.startsWith('/embed/')
            ) {

                return value;
            }


            /**
             * Standard:
             *
             * youtube.com/watch?v=...
             */
            const id =
                parsed.searchParams.get('v');


            if (id) {

                return `https://www.youtube.com/embed/${id}`;
            }


            /**
             * YouTube Shorts.
             */
            const shortsMatch =
                parsed.pathname.match(
                    /^\/shorts\/([^/?]+)/
                );


            if (shortsMatch) {

                return (
                    `https://www.youtube.com/embed/` +
                    shortsMatch[1]
                );
            }
        }
    }

    catch {

        return '';
    }


    return '';
}


/**
 * ------------------------------------------------------------
 * formatCount()
 * ------------------------------------------------------------
 *
 * Handles singular/plural display.
 *
 * Examples:
 *
 * formatCount(1, 'project')
 * → "1 project"
 *
 * formatCount(4, 'project')
 * → "4 projects"
 */
export function formatCount(

    count,

    singular,

    plural = `${singular}s`
) {

    const value =
        Number(count || 0);


    return (
        `${value} ` +
        (
            value === 1
                ? singular
                : plural
        )
    );
}