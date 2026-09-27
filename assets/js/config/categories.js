/**
 * Official showcase categories used throughout the ETU portal.
 * `icon` stores a semantic SVG icon key instead of an emoji.
 */
export const CATEGORIES = [
    {
        key: 'group',
        name: 'Group Activities',
        slug: 'group-activities',
        icon: 'users',
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
        icon: 'presentation',
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
        icon: 'film',
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
        icon: 'palette',
        description:
            'The Art & Explorer category celebrates creative expression in ' +
            'all its forms — from digital illustrations and mixed-media ' +
            'paintings to photography series.',
        image:
            'https://images.unsplash.com/photo-1513364776144-60967b0f800f' +
            '?auto=format&fit=crop&w=1000&q=80'
    }
];

export function getCategoryByName(name) {
    return CATEGORIES.find(category => category.name === name) || null;
}

export function getCategoryBySlug(slug) {
    return CATEGORIES.find(category => category.slug === slug) || null;
}
