/**
 * ============================================================
 * ETU PORTAL - DOM UTILITIES
 * ============================================================
 *
 * Purpose:
 * Provides small reusable functions for safely creating and
 * manipulating HTML elements.
 *
 * Important security improvement:
 *
 * Instead of repeatedly doing:
 *
 *     container.innerHTML += `${databaseValue}`
 *
 * we can create elements and assign textContent.
 *
 * That prevents database text from automatically being treated
 * as executable HTML.
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * el()
 * ------------------------------------------------------------
 *
 * Creates a DOM element.
 *
 * Example:
 *
 * const heading = el(
 *     'h2',
 *     {
 *         className: 'font-bold',
 *         text: 'Student Projects'
 *     }
 * );
 */
export function el(

    tag,

    options = {},

    children = []
) {

    // Create requested HTML element.
    const node =
        document.createElement(tag);


    /**
     * Apply CSS classes.
     */
    if (options.className) {

        node.className =
            options.className;
    }


    /**
     * Use textContent instead of innerHTML for normal text.
     *
     * This means text coming from Supabase is displayed as
     * text rather than being interpreted as HTML.
     */
    if (
        options.text !== undefined &&
        options.text !== null
    ) {

        node.textContent =
            String(options.text);
    }


    /**
     * Set normal HTML attributes.
     *
     * Example:
     *
     * attrs: {
     *     href: 'groups.html',
     *     type: 'button'
     * }
     */
    if (options.attrs) {

        Object.entries(
            options.attrs
        ).forEach(
            ([name, value]) => {

                if (
                    value !== undefined &&
                    value !== null &&
                    value !== false
                ) {

                    node.setAttribute(
                        name,
                        String(value)
                    );
                }
            }
        );
    }


    /**
     * Set data-* attributes.
     *
     * Example:
     *
     * dataset: {
     *     category: 'Presentations'
     * }
     *
     * becomes:
     *
     * data-category="Presentations"
     */
    if (options.dataset) {

        Object.entries(
            options.dataset
        ).forEach(
            ([name, value]) => {

                node.dataset[name] =
                    String(value);
            }
        );
    }


    /**
     * Register event listeners.
     *
     * Example:
     *
     * on: {
     *     click: handleClick
     * }
     */
    if (options.on) {

        Object.entries(
            options.on
        ).forEach(
            ([eventName, handler]) => {

                node.addEventListener(
                    eventName,
                    handler
                );
            }
        );
    }


    /**
     * Convert a single child into an array so both of these work:
     *
     * el('div', {}, child)
     *
     * and
     *
     * el('div', {}, [child1, child2])
     */
    const normalizedChildren =
        Array.isArray(children)
            ? children
            : [children];


    /**
     * Add children to the new element.
     */
    normalizedChildren.forEach(
        child => {

            // Ignore empty children.
            if (
                child === null ||
                child === undefined ||
                child === false
            ) {

                return;
            }


            /**
             * If the child is already a DOM element,
             * append it directly.
             */
            if (child instanceof Node) {

                node.append(child);
            }

            /**
             * Otherwise convert the value into plain text.
             */
            else {

                node.append(
                    document.createTextNode(
                        String(child)
                    )
                );
            }
        }
    );


    return node;
}


/**
 * ------------------------------------------------------------
 * clear()
 * ------------------------------------------------------------
 *
 * Removes everything inside an element.
 *
 * Accepts:
 *
 *     clear('#projects-grid')
 *
 * or:
 *
 *     clear(projectsContainer)
 */
export function clear(nodeOrSelector) {

    const node =
        typeof nodeOrSelector === 'string'
            ? document.querySelector(nodeOrSelector)
            : nodeOrSelector;


    if (node) {

        node.replaceChildren();
    }


    return node;
}


/**
 * ------------------------------------------------------------
 * show()
 * ------------------------------------------------------------
 *
 * Removes the HTML hidden state from an element.
 */
export function show(nodeOrSelector) {

    const node =
        typeof nodeOrSelector === 'string'
            ? document.querySelector(nodeOrSelector)
            : nodeOrSelector;


    if (node) {

        node.hidden = false;
    }
}


/**
 * ------------------------------------------------------------
 * hide()
 * ------------------------------------------------------------
 *
 * Hides an element using the standard HTML hidden attribute.
 */
export function hide(nodeOrSelector) {

    const node =
        typeof nodeOrSelector === 'string'
            ? document.querySelector(nodeOrSelector)
            : nodeOrSelector;


    if (node) {

        node.hidden = true;
    }
}


/**
 * ------------------------------------------------------------
 * setText()
 * ------------------------------------------------------------
 *
 * Safely updates the text of an element.
 *
 * Example:
 *
 * setText('#student-count', '15 Students');
 */
export function setText(selector, value) {

    const node =
        document.querySelector(selector);


    if (node) {

        node.textContent =
            value ?? '';
    }
}


/**
 * ------------------------------------------------------------
 * setImageWithFallback()
 * ------------------------------------------------------------
 *
 * Loads a requested image.
 *
 * If:
 *
 * - no image is provided
 * - the image URL fails
 *
 * a default local image is displayed instead.
 *
 * This means a group without a configured image still has
 * a clean professional-looking card.
 */
export function setImageWithFallback(

    img,

    src,

    fallback
) {

    if (!img) {

        return;
    }


    // Use requested image or default fallback.
    img.src =
        src || fallback;


    /**
     * If loading fails, switch to the fallback image once.
     */
    img.onerror = () => {

        img.onerror = null;

        img.src =
            fallback;
    };
}