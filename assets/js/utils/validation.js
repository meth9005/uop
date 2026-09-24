/**
 * ============================================================
 * ETU PORTAL - FORM VALIDATION UTILITIES
 * ============================================================
 *
 * Purpose:
 * Provides small reusable helpers for validating and cleaning
 * administrator form input before sending it to Supabase.
 *
 * This avoids repeating the same validation code in:
 *
 * - Group forms
 * - Member forms
 * - Project forms
 * - Media forms
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * required()
 * ------------------------------------------------------------
 *
 * Cleans a required text field.
 *
 * Throws an error if the field is empty.
 */
export function required(

    value,

    label = 'This field'
) {

    const cleaned =
        String(value || '')
            .trim();


    if (!cleaned) {

        throw new Error(
            `${label} is required.`
        );
    }


    return cleaned;
}


/**
 * ------------------------------------------------------------
 * optionalText()
 * ------------------------------------------------------------
 *
 * Cleans optional text.
 *
 * Empty input becomes:
 *
 *     null
 *
 * instead of:
 *
 *     ""
 *
 * This keeps database values cleaner.
 */
export function optionalText(value) {

    const cleaned =
        String(value || '')
            .trim();


    return cleaned || null;
}


/**
 * ------------------------------------------------------------
 * slugify()
 * ------------------------------------------------------------
 *
 * Converts text into a URL-safe group slug.
 *
 * Example:
 *
 *     Group AB05
 *
 * becomes:
 *
 *     group-ab05
 *
 * If the administrator manually enters "ab05", it remains
 * "ab05".
 */
export function slugify(value) {

    return String(value || '')

        .trim()

        .toLowerCase()

        // Replace groups of non-alphanumeric characters
        // with one hyphen.
        .replace(
            /[^a-z0-9]+/g,
            '-'
        )

        // Remove leading/trailing hyphens.
        .replace(
            /^-+|-+$/g,
            ''
        );
}


/**
 * ------------------------------------------------------------
 * normalizeInteger()
 * ------------------------------------------------------------
 *
 * Converts form input into an integer.
 *
 * Used for sort_order fields.
 */
export function normalizeInteger(

    value,

    fallback = 0
) {

    const parsed =
        Number.parseInt(
            value,
            10
        );


    return Number.isFinite(parsed)
        ? parsed
        : fallback;
}


/**
 * ------------------------------------------------------------
 * normalizeBoolean()
 * ------------------------------------------------------------
 *
 * Converts a value into true/false.
 */
export function normalizeBoolean(value) {

    return Boolean(value);
}


/**
 * ------------------------------------------------------------
 * urlOrPath()
 * ------------------------------------------------------------
 *
 * Accepts either:
 *
 * 1. A normal web URL:
 *
 *    https://example.com/image.jpg
 *
 * 2. A local project path:
 *
 *    assets/images/AB01.jpeg
 *
 * This is important because the current project already uses
 * local images as well as external URLs.
 */
export function urlOrPath(

    value,

    label = 'URL or path'
) {

    const cleaned =
        optionalText(value);


    // Optional field was left blank.
    if (!cleaned) {

        return null;
    }


    // Accept normal HTTP / HTTPS URLs.
    if (
        /^https?:\/\//i.test(cleaned)
    ) {

        return cleaned;
    }


    // Accept local project paths.
    if (
        /^(assets\/|\.\/|\.\.\/|\/)/i.test(cleaned)
    ) {

        return cleaned;
    }


    throw new Error(
        `${label} must be an http(s) URL or a local path such as assets/images/photo.jpg.`
    );
}