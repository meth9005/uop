/**
 * ============================================================
 * ETU PORTAL - CATEGORY CONFIGURATION
 * ============================================================
 *
 * Purpose:
 * Stores the official project categories used throughout
 * the student showcase.
 *
 * These categories are currently fixed because they represent
 * the structure of the ETU showcase rather than user-created
 * content.
 *
 * The same category list will be reused by:
 *
 * - categories.html
 * - groups.html filters
 * - group.html filters
 * - Add/Edit Project form
 * - Add/Edit Media form
 * - project cards
 *
 * This prevents category names from being hardcoded in many
 * different files.
 * ============================================================
 */


/**
 * Main category definitions.
 *
 * key
 *   Internal JavaScript identifier.
 *
 * name
 *   Exact value saved in the Supabase projects.category field.
 *
 * slug
 *   URL / filtering friendly version of the name.
 *
 * icon
 *   Small visual icon displayed on project cards and filters.
 *
 * description
 *   Static official description shown on categories.html.
 *
 * image
 *   Presentation image used by the category overview.
 */
export const CATEGORIES = [

    {
        key: 'group',

        name: 'Group Activities',

        slug: 'group-activities',

        icon: '🎭',

        description:
            'Group activities form the backbone of the ETU experience. ' +
            'Students engage in debates, role-plays, workshops, and ' +
            'community outreach programs that build teamwork, fluency, ' +
            'and cultural understanding through hands-on English communication.',

        image:
            'https://images.unsplash.com/photo-1523240795612-9a054b0db644' +
            '?auto=format&fit=crop&w=1000&q=80'
    },

    {
        key: 'presentations',

        name: 'Presentations',

        slug: 'presentations',

        icon: '📊',

        description:
            'From technical research presentations to creative storytelling ' +
            'sessions, students develop their public speaking and visual ' +
            'communication skills.',

        image:
            'https://images.unsplash.com/photo-1475721027785-f74eccf877e2' +
            '?auto=format&fit=crop&w=1000&q=80'
    },

    {
        key: 'documentaries',

        name: 'Documentaries',

        slug: 'documentaries',

        icon: '🎬',

        description:
            'Student-produced short documentaries exploring themes ranging ' +
            'from campus life and engineering innovation to social issues.',

        image:
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570' +
            '?auto=format&fit=crop&w=1000&q=80'
    },

    {
        key: 'art',

        name: 'Art & Explorer',

        slug: 'art-explorer',

        icon: '🎨',

        description:
            'The Art & Explorer category celebrates creative expression in ' +
            'all its forms — from digital illustrations and mixed-media ' +
            'paintings to photography series.',

        image:
            'https://images.unsplash.com/photo-1513364776144-60967b0f800f' +
            '?auto=format&fit=crop&w=1000&q=80'
    }
];


/**
 * ------------------------------------------------------------
 * getCategoryByName()
 * ------------------------------------------------------------
 *
 * Searches for a category using the exact database category
 * name.
 *
 * Example:
 *
 * getCategoryByName('Presentations')
 *
 * returns the Presentations category object.
 */
export function getCategoryByName(name) {

    return CATEGORIES.find(
        category => category.name === name
    ) || null;
}


/**
 * ------------------------------------------------------------
 * getCategoryBySlug()
 * ------------------------------------------------------------
 *
 * Searches using the URL-friendly slug.
 *
 * Example:
 *
 * getCategoryBySlug('art-explorer')
 */
export function getCategoryBySlug(slug) {

    return CATEGORIES.find(
        category => category.slug === slug
    ) || null;
}