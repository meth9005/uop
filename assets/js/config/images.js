/**
 * ============================================================
 * ETU PORTAL - IMAGE CONFIGURATION
 * ============================================================
 *
 * PURPOSE:
 *
 * All image-related limits and recommendations are stored here.
 *
 * This means:
 *
 * - file validation
 * - upload UI
 * - help text
 * - gallery limits
 *
 * all use the same values.
 * ============================================================
 */


/**
 * Supabase Storage bucket used by the ETU portal.
 */
export const IMAGE_BUCKET =
    'etu-images';


/**
 * Maximum size of ONE uploaded image.
 *
 * 2 MB = 2 × 1024 × 1024 bytes.
 */
export const MAX_IMAGE_SIZE =
    2 * 1024 * 1024;


/**
 * Human-readable version shown in forms.
 */
export const MAX_IMAGE_SIZE_LABEL =
    '2 MB';


/**
 * Only these browser MIME types are accepted.
 *
 * JPG and JPEG both normally report:
 *
 *     image/jpeg
 */
export const ALLOWED_IMAGE_TYPES = [

    'image/jpeg',

    'image/png',

    'image/webp'
];


/**
 * Extra extension validation.
 *
 * MIME validation is primary, but checking the extension gives
 * users a clearer error when an unsupported file is selected.
 */
export const ALLOWED_IMAGE_EXTENSIONS = [

    'jpg',

    'jpeg',

    'png',

    'webp'
];


/**
 * Maximum number of gallery images belonging to one group.
 */
export const MAX_GALLERY_IMAGES =
    30;


/**
 * ============================================================
 * IMAGE DIMENSION RECOMMENDATIONS
 * ============================================================
 *
 * These are recommendations rather than strict upload
 * requirements.
 *
 * We do NOT reject a photo just because its dimensions differ.
 */


/**
 * Wide banner on individual group pages.
 */
export const GROUP_COVER_RECOMMENDATION = {

    label:
        'Recommended: 1600 × 700 px',

    width:
        1600,

    height:
        700
};


/**
 * Group cards.
 */
export const GROUP_CARD_RECOMMENDATION = {

    label:
        'Recommended: 1200 × 750 px',

    width:
        1200,

    height:
        750
};


/**
 * Project cards.
 *
 * 16:9 works well with the current project card layout.
 */
export const PROJECT_IMAGE_RECOMMENDATION = {

    label:
        'Recommended: 1280 × 720 px',

    width:
        1280,

    height:
        720
};


/**
 * Gallery images may be landscape or portrait.
 */
export const GALLERY_IMAGE_RECOMMENDATION = {

    label:
        'Recommended: 1600 × 1200 px landscape or 1200 × 1600 px portrait'
};