/**
 * ============================================================
 * ETU PORTAL - REUSABLE PROJECT CARD
 * ============================================================
 *
 * Purpose:
 * Creates one standard project card.
 *
 * Used by:
 *
 * - Homepage latest projects
 * - groups.html project browser
 * - individual group page
 *
 * Administrator mode can additionally display:
 *
 * - Edit
 * - Delete
 * - Draft state
 *
 * This removes repeated project-card HTML from multiple pages.
 * ============================================================
 */

import { el, setImageWithFallback } from "../utils/dom.js";

import {
  DEFAULT_PROJECT_IMAGE,
  groupCode,
  toYouTubeEmbedUrl,
} from "../utils/format.js";

/**
 * ------------------------------------------------------------
 * createProjectCard()
 * ------------------------------------------------------------
 *
 * project:
 * A project record from Supabase.
 *
 * options.showGroup:
 * Shows/hides group badge/link.
 *
 * options.group:
 * Group object when the page already knows the current group.
 *
 * options.admin:
 * Enables management buttons.
 *
 * options.onEdit:
 * Callback executed when Edit is clicked.
 *
 * options.onDelete:
 * Callback executed when Delete is clicked.
 */
export function createProjectCard(
  project,

  options = {},
) {
  const card = el(
    "article",

    {
      className: "etu-card project-card reveal",
    },
  );

  const detailUrl = `project.html?id=${encodeURIComponent(project.id)}`;

  card.classList.add("project-card-clickable");

  card.setAttribute("role", "link");

  card.setAttribute("tabindex", "0");

  card.setAttribute(
  "aria-label",
  `Open project: ${project.title || "Student project"}`,
);

  function openProject() {
    window.location.href = detailUrl;
  }

  card.addEventListener("click", (event) => {
    // Do not open detail page when user clicked
    // an existing button or link.
    if (event.target.closest("a, button, input, select, textarea")) {
      return;
    }

    openProject();
  });

  card.addEventListener("keydown", (event) => {
    if (event.target !== card) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      openProject();
    }
  });

  /**
   * ========================================================
   * IMAGE SECTION
   * ========================================================
   */

  const imageWrap = el(
    "div",

    {
      className: "project-card-media",
    },
  );

  const image = el(
    "img",

    {
      attrs: {
        loading: "lazy",
        decoding: "async",
        alt: project.title || "Student project",
      },
    },
  );

  /**
   * projects.file_url contains the project's image.
   *
   * We intentionally keep the existing database field name
   * instead of renaming it during this refactor.
   */
  setImageWithFallback(
    image,

    project.file_url,

    DEFAULT_PROJECT_IMAGE,
  );

  imageWrap.append(image);

  /**
   * Project may contain related group information from:
   *
   * getAllProjects()
   *
   * or the group can be supplied explicitly by group.html.
   */
  const group = project.groups || options.group || null;

  /**
   * Show group badge when this project appears outside its
   * own group page.
   */
  if (options.showGroup !== false && group) {
    imageWrap.append(
      el(
        "a",

        {
          className: "project-badge",

          text: groupCode(group),

          attrs: {
            href: `group.html?group=` + encodeURIComponent(group.slug),
          },
        },
      ),
    );
  }

  /**
   * Optional duration label.
   *
   * Example:
   *
   * 08:20
   */
  if (project.duration_label) {
    imageWrap.append(
      el(
        "span",

        {
          className: "project-card-duration",

          text: project.duration_label,
        },
      ),
    );
  }

  /**
   * Draft badge visible only to admin.
   */
  if (options.admin && project.is_published === false) {
    imageWrap.append(
      el(
        "span",

        {
          className: "project-badge project-badge-draft",

          text: "DRAFT",
        },
      ),
    );
  }

  /**
   * ========================================================
   * PROJECT INFORMATION
   * ========================================================
   */

  const body = el(
    "div",

    {
      className: "project-card-body",
    },

    [
      /**
       * Category label.
       */
      el(
        "span",

        {
          className: "project-badge project-badge-category",

          text: project.category || "Project",
        },
      ),

      /**
       * Project title.
       */
      el(
        "h3",

        {
          className: "project-card-title",

          text: project.title,
        },
      ),

      /**
       * Description.
       */
      el(
        "p",

        {
          className: "project-card-desc",

          text:
            project.description ||
            "Project details will be added by the group administrator.",
        },
      ),
    ],
  );

  /**
   * Featured project marker.
   */
  if (project.is_featured) {
    body.append(
      el(
        "span",

        {
          className: "project-badge project-badge-featured",

          text: "Featured",
        },
      ),
    );
  }

  /**
   * ========================================================
   * CARD FOOTER
   * ========================================================
   */

  const footer = el(
    "div",

    {
      className: "project-card-footer",
    },
  );

  

  /**
   * Direct YouTube link if the project contains a video.
   */
  if (toYouTubeEmbedUrl(project.youtube_url)) {
    footer.append(
      el(
        "a",

        {
          className: "project-view-link",

          text: "Watch video",

          attrs: {
            href: project.youtube_url,

            target: "_blank",

            rel: "noopener noreferrer",
          },
        },
      ),
    );
  }

  /**
   * ========================================================
   * ADMIN ACTIONS
   * ========================================================
   */

  if (options.admin) {
    const actions = el(
      "div",

      {
        className: "project-card-actions",
      },
    );

    /**
     * Edit button.
     */
    if (options.onEdit) {
      actions.append(
        el(
          "button",

          {
            className: "btn btn-ghost",

            text: "Edit",

            attrs: {
              type: "button",
            },

            on: {
              click: () => options.onEdit(project),
            },
          },
        ),
      );
    }

    /**
     * Delete button.
     */
    if (options.onDelete) {
      actions.append(
        el(
          "button",

          {
            className: "btn btn-danger",

            text: "Delete",

            attrs: {
              type: "button",
            },

            on: {
              click: () => options.onDelete(project),
            },
          },
        ),
      );
    }

    footer.append(actions);
  }

  const projectOpenIndicator = el(
  "span",

  {
    className: "project-open-indicator",

    attrs: {
      "aria-hidden": "true",
    },
  },

  [
    el(
      "span",

      {
        className: "project-open-arrow",

        text: "→",
      },
    ),
  ],
);


card.append(
  projectOpenIndicator
);

  card.append(
  imageWrap,
  body,
  footer,
  projectOpenIndicator,
);

  return card;
}
