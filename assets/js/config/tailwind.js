/**
 * ============================================================
 * ETU PORTAL - TAILWIND CONFIGURATION
 * ============================================================
 *
 * Purpose:
 * This file stores the shared Tailwind CSS theme used by every
 * page in the ETU Student Showcase Portal.
 *
 * Why separate this?
 * Previously every HTML page contained its own copy of the
 * Tailwind configuration. If a colour changed, every HTML file
 * had to be edited.
 *
 * Now all pages load this ONE configuration file.
 * ============================================================
 */

tailwind.config = {

    // --------------------------------------------------------
    // THEME
    // --------------------------------------------------------
    // Extend Tailwind's default theme instead of replacing it.
    // This means normal Tailwind colours/classes still work.
    // --------------------------------------------------------

    theme: {

        extend: {

            // ------------------------------------------------
            // OFFICIAL PORTAL COLOURS
            // ------------------------------------------------
            // These colours preserve the current visual identity
            // used throughout the original ETU website.
            // ------------------------------------------------

            colors: {

                navy: {

                    // Used for secondary dark backgrounds.
                    800: '#14294a',

                    // Main ETU navigation / header colour.
                    900: '#0c1b33',

                    // Darkest navy used for footer and overlays.
                    950: '#071021'
                },

                accent: {

                    // Primary gold accent.
                    gold: '#d4a340',

                    // Slightly darker gold used for hover states.
                    goldHover: '#b88c32'
                }
            },

            // ------------------------------------------------
            // FONT FAMILIES
            // ------------------------------------------------
            // Inter is used for normal interface/body text.
            // Playfair Display is used for formal headings.
            // ------------------------------------------------

            fontFamily: {

                sans: [
                    'Inter',
                    'sans-serif'
                ],

                serif: [
                    'Playfair Display',
                    'serif'
                ]
            }
        }
    }
};