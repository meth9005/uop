/**
 * ============================================================
 * ETU PORTAL - INDIVIDUAL GROUP PAGE CONTROLLER
 * ============================================================
 *
 * File:
 * assets/js/pages/groupPage.js
 *
 *
 * PURPOSE
 * ------------------------------------------------------------
 *
 * Controls:
 *
 *     group.html?group=ab01
 *     group.html?group=ab02
 *     group.html?group=ab03
 *     group.html?group=ab04
 *
 *
 * ONE HTML PAGE handles every student group.
 *
 * We do NOT need:
 *
 *     groupab01.html
 *     groupab02.html
 *     groupab03.html
 *     ...
 *
 *
 * The current group is selected using the URL:
 *
 *     ?group=ab04
 *
 *
 * PUBLIC VISITORS CAN:
 *
 * - View group information
 * - View student roster
 * - View projects
 * - Filter projects by category
 * - View gallery/media
 *
 *
 * AUTHORIZED ADMINISTRATOR CAN:
 *
 * - Edit group
 * - Delete group
 * - Add/Edit/Delete students
 * - Add/Edit/Delete projects
 * - Add/Edit/Delete gallery media
 * - Publish/unpublish content
 *
 *
 * IMPORTANT ARCHITECTURE:
 *
 * group.html
 *      ↓
 * groupPage.js
 *      ↓
 * reusable components
 *      ↓
 * dataService.js
 *      ↓
 * Supabase
 *
 * ============================================================
 */

/**
 * ============================================================
 * CATEGORY CONFIGURATION
 * ============================================================
 */

import { CATEGORIES } from "../config/categories.js";

/**
 * Recommended dimensions shown inside image pickers.
 */
/**
 * Image-dimension guidance shown to administrators.
 */
import {
  GROUP_COVER_RECOMMENDATION,
  GROUP_CARD_RECOMMENDATION,
  PROJECT_IMAGE_RECOMMENDATION,
  GALLERY_IMAGE_RECOMMENDATION,
  MAX_GALLERY_IMAGES,
} from "../config/images.js";

/**
 * ============================================================
 * SHARED COMPONENTS
 * ============================================================
 */

/**
 * Shared navigation bar.
 */
import { renderNavbar } from "../components/navbar.js";

/**
 * Reusable drag/drop image selector.
 */
import { createImagePicker } from "../components/imagePicker.js";

/**
 * Shared footer.
 */
import { renderFooter } from "../components/footer.js";

/**
 * Administrator banner.
 */
import { renderAdminBanner } from "../components/adminBanner.js";

/**
 * Creates one student table row.
 */
import { createMemberRow } from "../components/memberRow.js";

/**
 * Creates one project card.
 */
import { createProjectCard } from "../components/projectCard.js";

/**
 * Creates one gallery/media card.
 */
import { createMediaCard } from "../components/mediaCard.js";

/**
 * Empty section message.
 */
import { createEmptyState } from "../components/emptyState.js";

/**
 * Shared modal functions.
 */
import { openModal, closeModal, initModalSystem } from "../components/modal.js";

/**
 * Success/error popup messages.
 */
import { showToast } from "../components/toast.js";

/**
 * ============================================================
 * DOM UTILITIES
 * ============================================================
 */

import { el, clear, setText, setImageWithFallback } from "../utils/dom.js";

/**
 * ============================================================
 * PRESENTATION / FORMAT HELPERS
 * ============================================================
 */

import { DEFAULT_GROUP_IMAGE, groupCode } from "../utils/format.js";

/**
 * ============================================================
 * FORM VALIDATION
 * ============================================================
 */

import {
  required,
  optionalText,
  slugify,
  normalizeInteger,
  urlOrPath,
} from "../utils/validation.js";

/**
 * ============================================================
 * DATABASE SERVICE
 * ============================================================
 */

import {
  getGroupDetails,
  updateGroup,
  deleteGroup,
  createMember,
  updateMember,
  deleteMember,
  createProject,
  updateProject,
  deleteProject,
  createMediaBatch,
  updateMedia,
  deleteMedia,
} from "../services/dataService.js";

/**
 * Handles upload/URL/preserve-current logic.
 */
import {
  resolveSingleImageChoice,
  rollbackNewImageChoices,
  cleanupReplacedImageChoices,
} from "../services/imageChoiceService.js";

/**
 * Gallery needs multi-upload and multi-file cleanup.
 */
import {
  uploadImages,
  removeImage,
  removeImages,
} from "../services/storageService.js";

/**
 * ============================================================
 * AUTHENTICATION SERVICE
 * ============================================================
 */

import { isAdmin, logout } from "../services/authService.js";

/**
 * ============================================================
 * PAGE STATE
 * ============================================================
 *
 * Everything currently loaded for this page is stored here.
 *
 * This replaces many separate global variables from the old
 * group.html.
 */

const state = {
  /**
   * Is current user the authorized administrator?
   */
  admin: false,

  /**
   * Current group database record.
   */
  group: null,

  /**
   * Students belonging to the group.
   */
  members: [],

  /**
   * Projects belonging to the group.
   */
  projects: [],

  /**
   * Gallery items belonging to the group.
   */
  media: [],

  /**
   * Current project category filter.
   */
  activeFilter: "all",
};

/**
 * ============================================================
 * GROUP IMAGE PICKERS
 * ============================================================
 *
 * These manage the two single-image fields inside the
 * Edit Group modal.
 */

let editGroupCoverPicker = null;

let editGroupCardPicker = null;

/**
 * ============================================================
 * PROJECT COVER IMAGE PICKER
 * ============================================================
 *
 * This picker is reused for:
 *
 * + Add Project
 * Edit Project
 */

let projectImagePicker = null;

/**
 * ============================================================
 * GALLERY IMAGE PICKERS
 * ============================================================
 */

/**
 * Multi-image picker used by + Add Media.
 */
let galleryUploadPicker = null;

/**
 * Single-image picker used when replacing an existing gallery
 * image.
 */
let editMediaPicker = null;

/**
 * ============================================================
 * GET CURRENT GROUP SLUG
 * ============================================================
 */

/**
 * getSlug()
 *
 * Reads:
 *
 *     group.html?group=ab04
 *
 * and returns:
 *
 *     ab04
 *
 *
 * If no group parameter is provided, AB01 is used as the
 * temporary default for backward compatibility.
 */
function getSlug() {
  return (new URLSearchParams(window.location.search).get("group") || "ab01")
    .trim()
    .toLowerCase();
}

/**
 * ============================================================
 * GROUP HEADER / OVERVIEW
 * ============================================================
 */

/**
 * renderGroupHeader()
 *
 * Updates:
 *
 * - browser title
 * - group name
 * - tagline
 * - description
 * - cover image
 * - group badge
 * - project count
 * - student count
 * - category count
 */
function renderGroupHeader() {
  const {
    group,

    members,

    projects,
  } = state;

  /**
   * Browser tab title.
   */
  document.title = `${group.name} | English Teaching Unit - UoP`;

  /**
   * Breadcrumb.
   */
  setText(
    "#breadcrumb-group",

    group.name,
  );

  /**
   * Main heading.
   *
   * Use tagline when available.
   *
   * If no tagline has been entered yet, simply use group name.
   */
  setText(
    "#group-title",

    group.tagline || group.name,
  );

  /**
   * Group overview name.
   */
  setText(
    "#group-name",

    group.name,
  );

  /**
   * Group description.
   *
   * Do NOT fabricate group content.
   *
   * If description has not been entered yet, show a neutral
   * message.
   */
  setText(
    "#group-description",

    group.description ||
      `Student work and member information for ` + `${group.name}.`,
  );

  /**
   * AB01 / AB02 / etc.
   */
  setText(
    "#group-code",

    groupCode(group),
  );

  setText(
    "#student-group-code",

    groupCode(group),
  );

  /**
   * Student section heading.
   */
  setText(
    "#student-heading",

    `${group.name} Student List`,
  );

  /**
   * --------------------------------------------------------
   * STATISTICS
   * --------------------------------------------------------
   */

  /**
   * Number of projects currently visible to this user.
   *
   * Public:
   * published projects only because RLS filters records.
   *
   * Admin:
   * includes drafts because administrator can see them.
   */
  setText(
    "#stat-projects",

    projects.length,
  );

  /**
   * Number of members.
   */
  setText(
    "#stat-students",

    members.length,
  );

  /**
   * Number of unique project categories used by this group.
   */
  const categoryCount = new Set(
    projects.map((project) => project.category).filter(Boolean),
  ).size;

  setText(
    "#stat-categories",

    categoryCount,
  );

  /**
   * --------------------------------------------------------
   * COVER IMAGE
   * --------------------------------------------------------
   */

  const cover = document.getElementById("group-cover-image");

  if (cover) {
    cover.alt = `${group.name} cover`;

    /**
     * Priority:
     *
     * cover_image
     * card_image
     * default faculty image
     */
    setImageWithFallback(
      cover,

      group.cover_image || group.card_image,

      DEFAULT_GROUP_IMAGE,
    );
  }

  /**
   * --------------------------------------------------------
   * ADMIN GROUP BUTTONS
   * --------------------------------------------------------
   */

  const editButton = document.getElementById("edit-group-btn");

  const deleteButton = document.getElementById("delete-group-btn");

  if (editButton) {
    editButton.hidden = !state.admin;
  }

  if (deleteButton) {
    deleteButton.hidden = !state.admin;
  }
}

/**
 * ============================================================
 * STUDENT ROSTER
 * ============================================================
 */

/**
 * renderMembers()
 *
 * Displays student rows using memberRow.js.
 */
function renderMembers() {
  const tbody = clear("#members-body");

  if (!tbody) {
    return;
  }

  /**
   * Update student count label.
   */
  setText(
    "#student-count",

    `${state.members.length} ${
      state.members.length === 1 ? "Student" : "Students"
    }`,
  );

  /**
   * Show Action table heading only to administrator.
   */
  const actionHeader = document.getElementById("member-action-header");

  if (actionHeader) {
    actionHeader.hidden = !state.admin;
  }

  /**
   * --------------------------------------------------------
   * EMPTY STUDENT LIST
   * --------------------------------------------------------
   */
  if (state.members.length === 0) {
    const row = el("tr");

    row.append(
      el(
        "td",

        {
          className: "py-8 " + "text-center " + "text-slate-400",

          text: "No students have been added to this group yet.",

          attrs: {
            /**
             * Administrator has one extra Action
             * column.
             */
            colspan: state.admin ? "5" : "4",
          },
        },
      ),
    );

    tbody.append(row);

    return;
  }

  /**
   * --------------------------------------------------------
   * BUILD STUDENT ROWS
   * --------------------------------------------------------
   */

  state.members.forEach((member) => {
    tbody.append(
      createMemberRow(
        member,

        {
          /**
           * Controls Edit/Delete column.
           */
          admin: state.admin,

          /**
           * Clicking Edit opens the same form
           * already filled with student data.
           */
          onEdit: openMemberEditor,

          /**
           * Clicking Delete runs confirmation and
           * removes the row from Supabase.
           */
          onDelete: handleDeleteMember,
        },
      ),
    );
  });
}

/**
 * ============================================================
 * PROJECT FILTERS
 * ============================================================
 */

/**
 * renderProjectFilters()
 *
 * Creates:
 *
 * All Work
 * Group Activities
 * Presentations
 * Documentaries
 * Art & Explorer
 *
 * including real project counts.
 */
function renderProjectFilters() {
  const container = clear("#project-filters");

  if (!container) {
    return;
  }

  /**
   * --------------------------------------------------------
   * ALL WORK
   * --------------------------------------------------------
   */

  const allCount = state.projects.length;

  container.append(
    el(
      "button",

      {
        className:
          state.activeFilter === "all"
            ? "bg-navy-900 " +
              "text-white " +
              "font-semibold " +
              "text-xs " +
              "px-4 py-2 " +
              "rounded-full " +
              "shadow-sm"
            : "bg-slate-200 " +
              "text-slate-700 " +
              "hover:bg-slate-300 " +
              "font-medium " +
              "text-xs " +
              "px-4 py-2 " +
              "rounded-full",

        text: `All Work (${allCount})`,

        attrs: {
          type: "button",
          "aria-pressed": String(state.activeFilter === "all"),
        },

        on: {
          click: () => {
            state.activeFilter = "all";

            renderProjectFilters();

            renderProjects();
          },
        },
      },
    ),
  );

  /**
   * --------------------------------------------------------
   * CATEGORY FILTERS
   * --------------------------------------------------------
   */

  CATEGORIES.forEach((category) => {
    /**
     * Count how many projects use this category.
     */
    const count = state.projects.filter(
      (project) => project.category === category.name,
    ).length;

    container.append(
      el(
        "button",

        {
          className:
            state.activeFilter === category.name
              ? "bg-navy-900 " +
                "text-white " +
                "font-semibold " +
                "text-xs " +
                "px-4 py-2 " +
                "rounded-full " +
                "shadow-sm"
              : "bg-slate-200 " +
                "text-slate-700 " +
                "hover:bg-slate-300 " +
                "font-medium " +
                "text-xs " +
                "px-4 py-2 " +
                "rounded-full",

          text: `${category.name} (${count})`,

          attrs: {
            type: "button",
          "aria-pressed": String(state.activeFilter === category.name),
          },

          on: {
            click: () => {
              state.activeFilter = category.name;

              renderProjectFilters();

              renderProjects();
            },
          },
        },
      ),
    );
  });
}

/**
 * ============================================================
 * PROJECT CARDS
 * ============================================================
 */

/**
 * renderProjects()
 *
 * Shows projects matching the current selected filter.
 */
function renderProjects() {
  const container = clear("#projects-grid");

  if (!container) {
    return;
  }

  /**
   * Determine which projects should appear.
   */
  const visibleProjects =
    state.activeFilter === "all"
      ? state.projects
      : state.projects.filter(
          (project) => project.category === state.activeFilter,
        );

  /**
   * Update text above the project grid.
   */
  setText(
    "#project-count",

    `Showing ${visibleProjects.length} ${
      visibleProjects.length === 1 ? "project" : "projects"
    }`,
  );

  /**
   * Create reusable project cards.
   */
  visibleProjects.forEach((project) => {
    container.append(
      createProjectCard(
        project,

        {
          /**
           * We are already inside this project's
           * group, so group badge is unnecessary.
           */
          showGroup: false,

          /**
           * Allows Edit/Delete buttons.
           */
          admin: state.admin,

          /**
           * Open project edit form.
           */
          onEdit: openProjectEditor,

          /**
           * Delete project.
           */
          onDelete: handleDeleteProject,
        },
      ),
    );
  });

  /**
   * Empty category/project state.
   */
  if (visibleProjects.length === 0) {
    container.append(
      createEmptyState("No projects are available in this selection."),
    );
  }
}

/**
 * ============================================================
 * RENDER MEDIA GALLERY
 * ============================================================
 */
function renderMedia() {
  const container = clear("#media-grid");

  if (!container) {
    return;
  }

  const used = state.media.length;

  const remaining = Math.max(
    0,

    MAX_GALLERY_IMAGES - used,
  );

  /**
   * --------------------------------------------------------
   * CAPACITY LABEL
   * --------------------------------------------------------
   *
   * Visitors do not need to know our CMS storage limit.
   *
   * Administrator does.
   */

  setText(
    "#media-count",

    state.admin
      ? `${used} / ${MAX_GALLERY_IMAGES} images used`
      : `${used} ${used === 1 ? "image" : "images"}`,
  );

  /**
   * --------------------------------------------------------
   * ADD MEDIA BUTTON CAPACITY
   * --------------------------------------------------------
   */

  const addButton = document.getElementById("add-media-btn");

  if (addButton && state.admin) {
    if (remaining === 0) {
      addButton.disabled = true;

      addButton.textContent = `Gallery Full (${MAX_GALLERY_IMAGES}/${MAX_GALLERY_IMAGES})`;

      addButton.classList.add("opacity-50", "cursor-not-allowed");
    } else {
      addButton.disabled = false;

      addButton.textContent = `+ Add Media (${remaining} slots)`;

      addButton.classList.remove("opacity-50", "cursor-not-allowed");
    }
  }

  /**
   * --------------------------------------------------------
   * MEDIA CARDS
   * --------------------------------------------------------
   */

  state.media.forEach((media) => {
    container.append(
      createMediaCard(
        media,

        {
          admin: state.admin,

          onOpen: openLightbox,

          onEdit: openMediaEditor,

          onDelete: handleDeleteMedia,
        },
      ),
    );
  });

  /**
   * --------------------------------------------------------
   * EMPTY GALLERY
   * --------------------------------------------------------
   */

  if (state.media.length === 0) {
    container.append(
      createEmptyState(
        "No gallery media has been published for this group yet.",
      ),
    );
  }
}

/**
 * ============================================================
 * ADMIN BUTTON VISIBILITY
 * ============================================================
 */

/**
 * renderAdminControls()
 *
 * These buttons start with hidden in HTML.
 *
 * They appear only after isAdmin() returns true.
 */
function renderAdminControls() {
  const adminButtonIds = ["add-member-btn", "add-project-btn", "add-media-btn"];

  adminButtonIds.forEach((id) => {
    const button = document.getElementById(id);

    if (button) {
      button.hidden = !state.admin;
    }
  });
}

/**
 * ============================================================
 * FOOTER
 * ============================================================
 */

/**
 * renderFooterForPage()
 *
 * Render administrator access for the current page.
 */
function renderFooterForPage() {

  renderFooter(
    {
      admin: state.admin,

      onLogout: handleLogout,
    },
  );
}

/**
 * ============================================================
 * REFRESH CURRENT GROUP
 * ============================================================
 */

/**
 * refresh()
 *
 * Reloads all current group information from Supabase.
 *
 * Called:
 *
 * - page startup
 * - after adding/editing student
 * - after project changes
 * - after media changes
 * - after group editing
 */
async function refresh() {
  const details = await getGroupDetails(getSlug());

  /**
   * --------------------------------------------------------
   * GROUP NOT FOUND
   * --------------------------------------------------------
   *
   * This can happen when:
   *
   * - slug does not exist
   * - group is unpublished and visitor is public
   */
  if (!details) {
    const content = document.getElementById("group-page-content");

    const notFound = document.getElementById("group-not-found");

    if (content) {
      content.hidden = true;
    }

    if (notFound) {
      notFound.hidden = false;
    }

    renderFooterForPage();

    return;
  }

  /**
   * Save newly loaded data.
   */
  state.group = details.group;

  state.members = details.members;

  state.projects = details.projects;

  state.media = details.media;

  /**
   * Show normal page.
   */
  document.getElementById("group-page-content").hidden = false;

  document.getElementById("group-not-found").hidden = true;

  /**
   * Rebuild every dynamic section.
   */
  renderGroupHeader();

  renderMembers();

  renderProjectFilters();

  renderProjects();

  renderMedia();

  renderAdminControls();

  renderFooterForPage();
}

/**
 * ============================================================
 * CATEGORY SELECT HELPER
 * ============================================================
 */

/**
 * fillCategorySelect()
 *
 * Used in:
 *
 * - Project form
 * - Media form
 *
 * so category options always match categories.js.
 */
function fillCategorySelect(
  select,

  includeBlank = false,
) {
  if (!select) {
    return;
  }

  clear(select);

  /**
   * Media category is optional, so media form can request an
   * empty option.
   */
  if (includeBlank) {
    select.append(
      el(
        "option",

        {
          text: "No category",

          attrs: {
            value: "",
          },
        },
      ),
    );
  }

  CATEGORIES.forEach((category) => {
    select.append(
      el(
        "option",

        {
          text: `${category.name}`,

          attrs: {
            value: category.name,
          },
        },
      ),
    );
  });
}

/**
 * ============================================================
 * MEDIA → PROJECT SELECT
 * ============================================================
 *
 * Used by:
 *
 * - multi gallery upload
 * - individual media edit
 *
 * A gallery image does not have to belong to a project.
 */
function fillMediaProjectSelect(
  select,

  selectedId = "",
) {
  if (!select) {
    return;
  }

  clear(select);

  /**
   * General group image.
   */
  select.append(
    el(
      "option",

      {
        text: "General group media",

        attrs: {
          value: "",
        },
      },
    ),
  );

  /**
   * Add current group's projects.
   */
  state.projects.forEach((project) => {
    const option = el(
      "option",

      {
        text: project.title,

        attrs: {
          value: project.id,
        },
      },
    );

    if (project.id === selectedId) {
      option.selected = true;
    }

    select.append(option);
  });
}

/**
 * ============================================================
 * CONVERT IMAGE FILENAME INTO A FRIENDLY TITLE
 * ============================================================
 *
 * Example:
 *
 * group-presentation_01.jpg
 *
 * becomes:
 *
 * Group Presentation 01
 */
function fileNameToMediaTitle(fileName) {
  const withoutExtension = String(fileName || "").replace(/\.[^.]+$/, "");

  const cleaned = withoutExtension

    .replace(/[-_]+/g, " ")

    .replace(/\s+/g, " ")

    .trim();

  if (!cleaned) {
    return "Gallery Image";
  }

  /**
   * Capitalize each word.
   */
  return cleaned.replace(
    /\b\w/g,

    (character) => character.toUpperCase(),
  );
}

/**
 * ============================================================
 * GROUP EDITOR
 * ============================================================
 *
 * Opens the edit form and shows current saved images.
 */
function openGroupEditor() {
  const group = state.group;

  /**
   * --------------------------------------------------------
   * BASIC GROUP DATA
   * --------------------------------------------------------
   */

  document.getElementById("edit-group-name").value = group.name || "";

  document.getElementById("edit-group-slug").value = group.slug || "";

  document.getElementById("edit-group-tagline").value = group.tagline || "";

  document.getElementById("edit-group-description").value =
    group.description || "";

  document.getElementById("edit-group-sort").value = group.sort_order ?? 0;

  document.getElementById("edit-group-published").checked =
    group.is_published !== false;

  /**
   * --------------------------------------------------------
   * RESET IMAGE PICKERS
   * --------------------------------------------------------
   *
   * This ensures an image selected during an earlier edit
   * session is not accidentally reused.
   */

  editGroupCoverPicker.reset();

  editGroupCardPicker.reset();

  /**
   * --------------------------------------------------------
   * CURRENT COVER IMAGE PREVIEW
   * --------------------------------------------------------
   */

  const coverWrap = document.getElementById("current-group-cover-wrap");

  const coverPreview = document.getElementById("current-group-cover-preview");

  if (group.cover_image) {
    coverWrap.hidden = false;

    coverPreview.src = group.cover_image;
  } else {
    coverWrap.hidden = true;

    coverPreview.removeAttribute("src");
  }

  /**
   * --------------------------------------------------------
   * CURRENT CARD IMAGE PREVIEW
   * --------------------------------------------------------
   */

  const cardWrap = document.getElementById("current-group-card-wrap");

  const cardPreview = document.getElementById("current-group-card-preview");

  if (group.card_image) {
    cardWrap.hidden = false;

    cardPreview.src = group.card_image;
  } else {
    cardWrap.hidden = true;

    cardPreview.removeAttribute("src");
  }

  /**
   * Open edit modal.
   */
  openModal("group-edit-modal");
}

/**
 * ============================================================
 * SAVE GROUP CHANGES
 * ============================================================
 *
 * Also handles safe image replacement.
 */
async function saveGroup(event) {
  event.preventDefault();

  const submitButton = event.currentTarget.querySelector(
    'button[type="submit"]',
  );

  /**
   * Store image operations here.
   *
   * Needed for rollback and cleanup.
   */
  let imageChoices = [];

  try {
    if (submitButton) {
      submitButton.disabled = true;

      submitButton.textContent = "Saving...";
    }

    /**
     * ----------------------------------------------------
     * VALIDATE TEXT DATA FIRST
     * ----------------------------------------------------
     */

    const oldSlug = state.group.slug;

    const newSlug = required(
      slugify(document.getElementById("edit-group-slug").value),

      "Group slug",
    );

    const name = required(
      document.getElementById("edit-group-name").value,

      "Group name",
    );

    /**
     * ----------------------------------------------------
     * RESOLVE COVER IMAGE
     * ----------------------------------------------------
     *
     * If administrator does nothing:
     *
     *     current image remains unchanged.
     *
     * If they upload:
     *
     *     new file goes to Supabase Storage.
     *
     * If they enter URL:
     *
     *     URL becomes new image.
     */

    const coverChoice = await resolveSingleImageChoice({
      picker: editGroupCoverPicker,

      /**
       * Use new slug in path if administrator changed
       * the slug during this update.
       */
      folder: `groups/${newSlug}/cover`,

      existingUrl: state.group.cover_image,

      existingStoragePath: state.group.cover_storage_path,

      label: "Group cover image",
    });

    imageChoices.push(coverChoice);

    /**
     * ----------------------------------------------------
     * RESOLVE CARD IMAGE
     * ----------------------------------------------------
     */

    const cardChoice = await resolveSingleImageChoice({
      picker: editGroupCardPicker,

      folder: `groups/${newSlug}/card`,

      existingUrl: state.group.card_image,

      existingStoragePath: state.group.card_storage_path,

      label: "Group card image",
    });

    imageChoices.push(cardChoice);

    /**
     * ----------------------------------------------------
     * BUILD DATABASE UPDATE
     * ----------------------------------------------------
     */

    const payload = {
      name,

      slug: newSlug,

      tagline: optionalText(
        document.getElementById("edit-group-tagline").value,
      ),

      description: optionalText(
        document.getElementById("edit-group-description").value,
      ),

      /**
       * New image URL or preserved existing URL.
       */
      cover_image: coverChoice.url,

      cover_storage_path: coverChoice.storagePath,

      card_image: cardChoice.url,

      card_storage_path: cardChoice.storagePath,

      sort_order: normalizeInteger(
        document.getElementById("edit-group-sort").value,

        0,
      ),

      is_published: document.getElementById("edit-group-published").checked,
    };

    /**
     * ----------------------------------------------------
     * UPDATE DATABASE
     * ----------------------------------------------------
     */

    await updateGroup(
      state.group.id,

      payload,
    );

    /**
     * ----------------------------------------------------
     * DELETE OLD REPLACED STORAGE FILES
     * ----------------------------------------------------
     *
     * IMPORTANT:
     *
     * We do this only AFTER the database update succeeded.
     *
     * This avoids displaying a broken old URL if the DB
     * operation fails.
     */
    await cleanupReplacedImageChoices(imageChoices);

    closeModal("group-edit-modal");

    showToast("Group details updated.");

    /**
     * ----------------------------------------------------
     * SLUG CHANGE
     * ----------------------------------------------------
     */

    if (newSlug !== oldSlug) {
      window.location.href = `group.html?group=` + encodeURIComponent(newSlug);

      return;
    }

    /**
     * Reload updated group information.
     */
    await refresh();
  } catch (error) {
    console.error("Could not update group:", error);

    /**
     * ----------------------------------------------------
     * ROLLBACK NEW STORAGE OBJECTS
     * ----------------------------------------------------
     *
     * Example:
     *
     * New image uploaded ✅
     * Database update failed ❌
     *
     * Remove new unused image again.
     */
    await rollbackNewImageChoices(imageChoices);

    showToast(
      error.message || "Could not update the group.",

      "error",
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;

      submitButton.textContent = "Save Changes";
    }
  }
}

/**
 * ============================================================
 * DELETE GROUP
 * ============================================================
 */

/**
 * handleDeleteGroup()
 *
 * Group deletion is intentionally strongly confirmed because
 * the database relationships are:
 *
 * group
 *   ↓ CASCADE
 * members
 * projects
 * media
 */
async function handleDeleteGroup() {
  /**
   * User must type exact group name.
   *
   * Example:
   *
   * Group AB04
   */
  const confirmation = window.prompt(
    `Deleting ${state.group.name} will also delete ` +
      `its members, projects and group media.\n\n` +
      `Type "${state.group.name}" to confirm.`,
  );

  if (confirmation !== state.group.name) {
    return;
  }

  try {
    await deleteGroup(state.group.id);

    showToast("Group deleted.");

    /**
     * Return to groups list.
     */
    window.location.href = "groups.html";
  } catch (error) {
    console.error("Could not delete group:", error);

    showToast(
      error.message || "Could not delete the group.",

      "error",
    );
  }
}

/**
 * ============================================================
 * MEMBER EDITOR
 * ============================================================
 */

/**
 * openMemberEditor()
 *
 * Called with:
 *
 * no member
 *     → Add Student
 *
 * existing member
 *     → Edit Student
 */
function openMemberEditor(member = null) {
  setText(
    "#member-modal-title",

    member ? "Edit Student" : "Add Student",
  );

  /**
   * Hidden database ID.
   *
   * Empty ID means CREATE.
   *
   * Existing ID means UPDATE.
   */
  document.getElementById("member-id").value = member?.id || "";

  document.getElementById("member-name").value = member?.name || "";

  document.getElementById("member-reg").value = member?.reg_no || "";

  document.getElementById("member-committee").value = member?.committee || "";

  document.getElementById("member-role").value = member?.role || "Member";

  /**
   * New students go to end of current list by default.
   */
  document.getElementById("member-sort").value =
    member?.sort_order ?? state.members.length + 1;

  /**
   * Existing record:
   * preserve current publish state.
   *
   * New record:
   * published by default.
   */
  document.getElementById("member-published").checked = member
    ? member.is_published !== false
    : true;

  openModal("member-modal");
}

/**
 * ============================================================
 * SAVE MEMBER
 * ============================================================
 */

async function saveMember(event) {
  event.preventDefault();

  const submitButton = event.currentTarget.querySelector(
    'button[type="submit"]',
  );

  try {
    if (submitButton) {
      submitButton.disabled = true;

      submitButton.textContent = "Saving...";
    }

    /**
     * Existing student ID or blank for new student.
     */
    const id = document.getElementById("member-id").value;

    const payload = {
      /**
       * Needed only when inserting a new member.
       */
      group_id: state.group.id,

      name: required(
        document.getElementById("member-name").value,

        "Student name",
      ),

      /**
       * Registration number remains optional at database
       * level because existing incomplete records must not
       * be fabricated.
       */
      reg_no: optionalText(document.getElementById("member-reg").value),

      committee: optionalText(
        document.getElementById("member-committee").value,
      ),

      role: optionalText(document.getElementById("member-role").value),

      sort_order: normalizeInteger(
        document.getElementById("member-sort").value,

        0,
      ),

      is_published: document.getElementById("member-published").checked,
    };

    /**
     * ----------------------------------------------------
     * UPDATE EXISTING STUDENT
     * ----------------------------------------------------
     */
    if (id) {
      /**
       * group_id should not be changed during normal
       * editing, so remove it from update payload.
       */
      const {
        group_id,

        ...changes
      } = payload;

      await updateMember(
        id,

        changes,
      );

      showToast("Student updated.");
    } else {
      /**
       * ----------------------------------------------------
       * CREATE NEW STUDENT
       * ----------------------------------------------------
       */
      await createMember(payload);

      showToast("Student added.");
    }

    closeModal("member-modal");

    await refresh();
  } catch (error) {
    console.error("Could not save student:", error);

    showToast(
      error.message || "Could not save the student.",

      "error",
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;

      submitButton.textContent = "Save Student";
    }
  }
}

/**
 * ============================================================
 * DELETE MEMBER
 * ============================================================
 */

async function handleDeleteMember(member) {
  const confirmed = window.confirm(
    `Delete ${member.name} from ${state.group.name}?`,
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteMember(member.id);

    showToast("Student removed.");

    await refresh();
  } catch (error) {
    console.error("Could not delete student:", error);

    showToast(
      error.message || "Could not delete the student.",

      "error",
    );
  }
}

/**
 * ============================================================
 * PROJECT EDITOR
 * ============================================================
 *
 * Calling without a project:
 *
 *     Add Project
 *
 * Calling with an existing project:
 *
 *     Edit Project
 */
function openProjectEditor(project = null) {
  /**
   * --------------------------------------------------------
   * MODAL TITLE
   * --------------------------------------------------------
   */

  setText(
    "#project-modal-title",

    project ? "Edit Project" : "Add Project",
  );

  /**
   * --------------------------------------------------------
   * PROJECT ID
   * --------------------------------------------------------
   *
   * Blank:
   *
   *     CREATE
   *
   * UUID:
   *
   *     UPDATE
   */

  document.getElementById("project-id").value = project?.id || "";

  /**
   * --------------------------------------------------------
   * CATEGORY OPTIONS
   * --------------------------------------------------------
   */

  const categorySelect = document.getElementById("project-category");

  fillCategorySelect(categorySelect);

  /**
   * --------------------------------------------------------
   * PROJECT TEXT INFORMATION
   * --------------------------------------------------------
   */

  document.getElementById("project-title").value = project?.title || "";

  categorySelect.value = project?.category || CATEGORIES[0].name;

  document.getElementById("project-description").value =
    project?.description || "";

  document.getElementById("project-youtube").value = project?.youtube_url || "";

  document.getElementById("project-duration").value =
    project?.duration_label || "";

  document.getElementById("project-sort").value =
    project?.sort_order ?? state.projects.length + 1;

  /**
   * --------------------------------------------------------
   * FEATURED
   * --------------------------------------------------------
   */

  document.getElementById("project-featured").checked = project
    ? Boolean(project.is_featured)
    : false;

  /**
   * --------------------------------------------------------
   * PUBLISHED
   * --------------------------------------------------------
   */

  document.getElementById("project-published").checked = project
    ? project.is_published !== false
    : true;

  /**
   * ========================================================
   * PROJECT IMAGE
   * ========================================================
   */

  /**
   * Always clear any image selected during an earlier opening
   * of the modal.
   */
  projectImagePicker.reset();

  const currentImageWrap = document.getElementById(
    "current-project-image-wrap",
  );

  const currentImagePreview = document.getElementById(
    "current-project-image-preview",
  );

  /**
   * --------------------------------------------------------
   * EDITING EXISTING PROJECT WITH IMAGE
   * --------------------------------------------------------
   */

  if (project?.file_url) {
    currentImageWrap.hidden = false;

    currentImagePreview.src = project.file_url;

    currentImagePreview.alt = `${project.title} cover image`;
  } else {
    /**
     * --------------------------------------------------------
     * NEW PROJECT / PROJECT WITHOUT IMAGE
     * --------------------------------------------------------
     */
    currentImageWrap.hidden = true;

    currentImagePreview.removeAttribute("src");
  }

  /**
   * Finally show modal.
   */
  openModal("project-modal");
}
/**
 * ============================================================
 * SAVE PROJECT
 * ============================================================
 *
 * Handles both:
 *
 * CREATE project
 * UPDATE project
 *
 * and:
 *
 * Upload cover
 * Use URL
 * Replace cover
 * Preserve existing cover
 * Roll back failed uploads
 * Delete replaced Storage images
 */
async function saveProject(event) {
  event.preventDefault();

  const submitButton = event.currentTarget.querySelector(
    'button[type="submit"]',
  );

  /**
   * Used to clean up an uploaded image if the subsequent
   * database operation fails.
   */
  let imageChoices = [];

  try {
    if (submitButton) {
      submitButton.disabled = true;

      submitButton.textContent = "Saving...";
    }

    /**
     * ----------------------------------------------------
     * EXISTING PROJECT ID
     * ----------------------------------------------------
     */

    const id = document.getElementById("project-id").value;

    /**
     * Find existing project when editing.
     */
    const existingProject = id
      ? state.projects.find((project) => project.id === id)
      : null;

    /**
     * ----------------------------------------------------
     * VALIDATE TEXT BEFORE UPLOADING
     * ----------------------------------------------------
     */

    const title = required(
      document.getElementById("project-title").value,

      "Project title",
    );

    const category = required(
      document.getElementById("project-category").value,

      "Category",
    );

    /**
     * ----------------------------------------------------
     * RESOLVE PROJECT IMAGE
     * ----------------------------------------------------
     *
     * CREATE:
     *
     * no selection
     *      → null
     *
     * upload
     *      → Supabase URL + Storage path
     *
     * URL
     *      → external URL + null path
     *
     *
     * EDIT:
     *
     * no selection
     *      → current image stays
     *
     * upload
     *      → replace current image
     *
     * URL
     *      → replace current image with URL
     */

    const imageChoice = await resolveSingleImageChoice({
      picker: projectImagePicker,

      /**
       * Unique filenames mean all project images can
       * safely share this project folder.
       */
      folder: `groups/` + `${state.group.slug}/` + `projects`,

      existingUrl: existingProject?.file_url || null,

      existingStoragePath: existingProject?.file_storage_path || null,

      label: "Project cover image",
    });

    imageChoices.push(imageChoice);

    /**
     * ----------------------------------------------------
     * DATABASE PAYLOAD
     * ----------------------------------------------------
     */

    const payload = {
      group_id: state.group.id,

      title,

      category,

      description: optionalText(
        document.getElementById("project-description").value,
      ),

      /**
       * Public URL displayed by projectCard.js.
       */
      file_url: imageChoice.url,

      /**
       * Supabase Storage object path.
       *
       * null when external URL is used.
       */
      file_storage_path: imageChoice.storagePath,

      youtube_url: optionalText(
        document.getElementById("project-youtube").value,
      ),

      duration_label: optionalText(
        document.getElementById("project-duration").value,
      ),

      sort_order: normalizeInteger(
        document.getElementById("project-sort").value,

        0,
      ),

      is_featured: document.getElementById("project-featured").checked,

      is_published: document.getElementById("project-published").checked,
    };

    /**
     * ====================================================
     * UPDATE PROJECT
     * ====================================================
     */

    if (id) {
      /**
       * Project must remain inside its current group.
       */
      const {
        group_id,

        ...changes
      } = payload;

      await updateProject(
        id,

        changes,
      );

      /**
       * Database has successfully switched to the new
       * image.
       *
       * We may now remove the old Storage object.
       */
      await cleanupReplacedImageChoices(imageChoices);

      showToast("Project updated.");
    } else {
      /**
       * ====================================================
       * CREATE PROJECT
       * ====================================================
       */
      await createProject(payload);

      showToast("Project added.");
    }

    /**
     * Close form after successful save.
     */
    closeModal("project-modal");

    /**
     * Remove picker selection from browser memory.
     */
    projectImagePicker.reset();

    /**
     * Reload projects from Supabase.
     */
    await refresh();
  } catch (error) {
    console.error("Could not save project:", error);

    /**
     * ====================================================
     * STORAGE ROLLBACK
     * ====================================================
     *
     * Example:
     *
     * file uploaded ✅
     *
     * database update ❌
     *
     * remove new uploaded file again.
     */
    await rollbackNewImageChoices(imageChoices);

    showToast(
      error.message || "Could not save the project.",

      "error",
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;

      submitButton.textContent = "Save Project";
    }
  }
}

/**
 * ============================================================
 * DELETE PROJECT
 * ============================================================
 *
 * Database relationship:
 *
 * project deleted
 *       ↓
 * linked media.project_id becomes NULL
 *
 * Gallery media itself remains.
 *
 *
 * If the project owns a Supabase Storage cover image, that
 * cover file is removed after the database row is deleted.
 */
async function handleDeleteProject(project) {
  const confirmed = window.confirm(
    `Delete "${project.title}"?\n\n` +
      `Gallery media linked to this project will remain ` +
      `in the group gallery.`,
  );

  if (!confirmed) {
    return;
  }

  try {
    /**
     * Save Storage path before deleting database row.
     */
    const storagePath = project.file_storage_path || null;

    /**
     * ----------------------------------------------------
     * DELETE DATABASE RECORD FIRST
     * ----------------------------------------------------
     *
     * We don't delete the image first because if database
     * deletion failed, the existing project would then have
     * a broken image.
     */

    await deleteProject(project.id);

    /**
     * ----------------------------------------------------
     * CLEAN UP STORAGE
     * ----------------------------------------------------
     */

    if (storagePath) {
      try {
        await removeImage(storagePath);
      } catch (storageError) {
        /**
         * Project is already deleted successfully.
         *
         * Therefore Storage cleanup failure should not
         * make the user think project deletion failed.
         */
        console.warn(
          "Project deleted but its old cover image could not be removed:",
          storageError,
        );
      }
    }

    showToast("Project deleted.");

    await refresh();
  } catch (error) {
    console.error("Could not delete project:", error);

    showToast(
      error.message || "Could not delete the project.",

      "error",
    );
  }
}

/**
 * ============================================================
 * OPEN MULTI-IMAGE GALLERY UPLOADER
 * ============================================================
 */
function openGalleryUploader() {
  const used = state.media.length;

  const remaining = Math.max(
    0,

    MAX_GALLERY_IMAGES - used,
  );

  /**
   * Gallery is already full.
   */
  if (remaining <= 0) {
    showToast(
      `This group already has the maximum of ` +
        `${MAX_GALLERY_IMAGES} gallery images.`,

      "error",
    );

    return;
  }

  /**
   * Start with a clean picker.
   */
  galleryUploadPicker.reset();

  /**
   * Example:
   *
   * 23 existing
   *
   * 30 - 23 = 7
   *
   * picker accepts maximum 7.
   */
  galleryUploadPicker.setMaxFiles(remaining);

  /**
   * --------------------------------------------------------
   * CAPACITY GUIDANCE
   * --------------------------------------------------------
   */

  setText(
    "#gallery-capacity-status",

    `${used} of ${MAX_GALLERY_IMAGES} images are currently used. ` +
      `${remaining} upload ${
        remaining === 1 ? "slot remains" : "slots remain"
      }.`,
  );

  /**
   * URL-title input starts empty.
   */
  document.getElementById("gallery-url-title").value = "";

  /**
   * --------------------------------------------------------
   * CATEGORY SELECT
   * --------------------------------------------------------
   */

  const categorySelect = document.getElementById("gallery-category");

  fillCategorySelect(
    categorySelect,

    true,
  );

  /**
   * --------------------------------------------------------
   * RELATED PROJECT SELECT
   * --------------------------------------------------------
   */

  fillMediaProjectSelect(document.getElementById("gallery-project-id"));

  /**
   * Standard layout by default.
   */
  document.getElementById("gallery-size").value = "standard";

  /**
   * New gallery images are public by default.
   */
  document.getElementById("gallery-published").checked = true;

  openModal("gallery-upload-modal");
}

/**
 * ============================================================
 * SAVE MULTIPLE GALLERY IMAGES
 * ============================================================
 *
 * UPLOAD MODE:
 *
 * Files
 *   ↓
 * Supabase Storage
 *   ↓
 * public URLs
 *   ↓
 * batch INSERT media rows
 *
 *
 * URL MODE:
 *
 * one public URL
 *   ↓
 * one media row
 */
async function saveGalleryBatch(event) {
  event.preventDefault();

  const submitButton = event.currentTarget.querySelector(
    'button[type="submit"]',
  );

  /**
   * Files successfully uploaded during this operation.
   *
   * If the database INSERT fails, these are removed again.
   */
  let uploadedPaths = [];

  /**
   * Once the database records are successfully created we
   * must NOT roll those files back just because a later UI
   * refresh happens to fail.
   */
  let databaseSaved = false;

  try {
    if (submitButton) {
      submitButton.disabled = true;

      submitButton.textContent = "Uploading...";
    }

    /**
     * ----------------------------------------------------
     * CHECK CURRENT CAPACITY AGAIN
     * ----------------------------------------------------
     */

    const remaining = MAX_GALLERY_IMAGES - state.media.length;

    if (remaining <= 0) {
      throw new Error(
        `This group already contains the maximum of ${MAX_GALLERY_IMAGES} gallery images.`,
      );
    }

    /**
     * ----------------------------------------------------
     * COMMON MEDIA SETTINGS
     * ----------------------------------------------------
     */

    const category = optionalText(
      document.getElementById("gallery-category").value,
    );

    const projectId = optionalText(
      document.getElementById("gallery-project-id").value,
    );

    const displaySize =
      optionalText(document.getElementById("gallery-size").value) || "standard";

    const published = document.getElementById("gallery-published").checked;

    const source = galleryUploadPicker.getSource();

    /**
     * ====================================================
     * FILE UPLOAD MODE
     * ====================================================
     */

    if (source === "upload") {
      const files = galleryUploadPicker.getFiles();

      if (files.length === 0) {
        throw new Error("Please select at least one gallery image.");
      }

      /**
       * Capacity check before uploading anything.
       */
      if (files.length > remaining) {
        throw new Error(
          `Only ${remaining} gallery ` +
            `${remaining === 1 ? "slot is" : "slots are"} ` +
            `available.`,
        );
      }

      /**
       * ------------------------------------------------
       * UPLOAD ALL SELECTED FILES
       * ------------------------------------------------
       *
       * storageService validates:
       *
       * JPG/JPEG/PNG/WEBP
       * ≤ 2 MB each
       */

      const uploaded = await uploadImages(
        files,

        `groups/` + `${state.group.slug}/` + `gallery`,
      );

      uploadedPaths = uploaded.map((item) => item.storagePath);

      /**
       * ------------------------------------------------
       * BUILD MEDIA DATABASE ROWS
       * ------------------------------------------------
       */

      const startingOrder = state.media.length + 1;

      const records = uploaded.map((item, index) => ({
        group_id: state.group.id,

        project_id: projectId,

        /**
         * Full public Storage URL.
         */
        media_url: item.publicUrl,

        /**
         * Storage path needed for later removal.
         */
        storage_path: item.storagePath,

        /**
         * No separate thumbnail is necessary.
         *
         * mediaCard.js automatically falls back
         * to media_url.
         */
        thumbnail_url: null,

        /**
         * Filename becomes initial title.
         *
         * Example:
         *
         * presentation-day-01.jpg
         *
         * →
         *
         * Presentation Day 01
         */
        title: fileNameToMediaTitle(item.file.name),

        category,

        display_size: displaySize,

        sort_order: startingOrder + index,

        is_published: published,
      }));

      /**
       * Insert all rows together.
       */
      await createMediaBatch(records);

      databaseSaved = true;

      showToast(
        `${records.length} ${
          records.length === 1 ? "image" : "images"
        } added to the gallery.`,
      );
    } else if (source === "url") {
      /**
       * ====================================================
       * EXTERNAL URL MODE
       * ====================================================
       *
       * URL mode adds ONE image.
       */
      const imageUrl = urlOrPath(
        galleryUploadPicker.getUrl(),

        "Gallery image URL",
      );

      if (!imageUrl) {
        throw new Error("Please enter an image URL.");
      }

      const title = required(
        document.getElementById("gallery-url-title").value,

        "Gallery image title",
      );

      await createMediaBatch([
        {
          group_id: state.group.id,

          project_id: projectId,

          media_url: imageUrl,

          storage_path: null,

          thumbnail_url: null,

          title,

          category,

          display_size: displaySize,

          sort_order: state.media.length + 1,

          is_published: published,
        },
      ]);

      databaseSaved = true;

      showToast("Gallery image added.");
    } else {
      throw new Error("Please select an image source.");
    }

    /**
     * ----------------------------------------------------
     * SUCCESSFUL SAVE
     * ----------------------------------------------------
     */

    closeModal("gallery-upload-modal");

    galleryUploadPicker.reset();

    await refresh();
  } catch (error) {
    console.error("Could not add gallery images:", error);

    /**
     * ----------------------------------------------------
     * STORAGE ROLLBACK
     * ----------------------------------------------------
     *
     * Only delete uploaded files when the database rows
     * were NOT successfully created.
     */

    if (!databaseSaved && uploadedPaths.length > 0) {
      try {
        await removeImages(uploadedPaths);
      } catch (cleanupError) {
        console.warn(
          "Gallery upload failed and some temporary Storage files could not be removed:",
          cleanupError,
        );
      }
    }

    showToast(
      error.message || "Could not add the gallery images.",

      "error",
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;

      submitButton.textContent = "Upload & Save";
    }
  }
}

/**
 * ============================================================
 * OPEN INDIVIDUAL MEDIA EDITOR
 * ============================================================
 */
function openMediaEditor(media) {
  /**
   * Store record UUID.
   */
  document.getElementById("media-edit-id").value = media.id;

  /**
   * --------------------------------------------------------
   * CURRENT IMAGE
   * --------------------------------------------------------
   */

  const preview = document.getElementById("current-media-image-preview");

  preview.src = media.media_url;

  preview.alt = media.title || "Current gallery image";

  /**
   * New replacement selection starts empty.
   *
   * Empty means:
   *
   * KEEP CURRENT IMAGE.
   */
  editMediaPicker.reset();

  /**
   * --------------------------------------------------------
   * TITLE
   * --------------------------------------------------------
   */

  document.getElementById("media-edit-title").value = media.title || "";

  /**
   * --------------------------------------------------------
   * CATEGORY
   * --------------------------------------------------------
   */

  const categorySelect = document.getElementById("media-edit-category");

  fillCategorySelect(
    categorySelect,

    true,
  );

  categorySelect.value = media.category || "";

  /**
   * --------------------------------------------------------
   * RELATED PROJECT
   * --------------------------------------------------------
   */

  fillMediaProjectSelect(
    document.getElementById("media-edit-project-id"),

    media.project_id || "",
  );

  /**
   * --------------------------------------------------------
   * DISPLAY SETTINGS
   * --------------------------------------------------------
   */

  document.getElementById("media-edit-size").value =
    media.display_size || "standard";

  document.getElementById("media-edit-sort").value = media.sort_order ?? 0;

  document.getElementById("media-edit-published").checked =
    media.is_published !== false;

  openModal("media-edit-modal");
}

/**
 * ============================================================
 * SAVE INDIVIDUAL MEDIA EDIT
 * ============================================================
 */
async function saveMediaEdit(event) {
  event.preventDefault();

  const submitButton = event.currentTarget.querySelector(
    'button[type="submit"]',
  );

  let imageChoices = [];

  let databaseSaved = false;

  try {
    if (submitButton) {
      submitButton.disabled = true;

      submitButton.textContent = "Saving...";
    }

    const id = document.getElementById("media-edit-id").value;

    const existing = state.media.find((media) => media.id === id);

    if (!existing) {
      throw new Error("The gallery item could not be found.");
    }

    /**
     * ----------------------------------------------------
     * REPLACEMENT IMAGE
     * ----------------------------------------------------
     *
     * No new selection:
     *
     * keep current image.
     */

    const imageChoice = await resolveSingleImageChoice({
      picker: editMediaPicker,

      folder: `groups/` + `${state.group.slug}/` + `gallery`,

      existingUrl: existing.media_url,

      existingStoragePath: existing.storage_path,

      label: "Gallery image",
    });

    imageChoices.push(imageChoice);

    /**
     * ----------------------------------------------------
     * DATABASE UPDATE
     * ----------------------------------------------------
     */

    const changes = {
      media_url: imageChoice.url,

      storage_path: imageChoice.storagePath,

      /**
       * A replaced image simply uses media_url as its
       * thumbnail.
       *
       * If image was not replaced, preserve any existing
       * thumbnail value.
       */
      thumbnail_url: imageChoice.changed ? null : existing.thumbnail_url,

      title: required(
        document.getElementById("media-edit-title").value,

        "Media title",
      ),

      category: optionalText(
        document.getElementById("media-edit-category").value,
      ),

      project_id: optionalText(
        document.getElementById("media-edit-project-id").value,
      ),

      display_size:
        optionalText(document.getElementById("media-edit-size").value) ||
        "standard",

      sort_order: normalizeInteger(
        document.getElementById("media-edit-sort").value,

        0,
      ),

      is_published: document.getElementById("media-edit-published").checked,
    };

    await updateMedia(
      id,

      changes,
    );

    databaseSaved = true;

    /**
     * Database points to the new image.
     *
     * Old Supabase image can now safely be removed.
     */
    await cleanupReplacedImageChoices(imageChoices);

    closeModal("media-edit-modal");

    showToast("Gallery image updated.");

    await refresh();
  } catch (error) {
    console.error("Could not update gallery image:", error);

    /**
     * Only roll back newly uploaded file when the database
     * update itself never succeeded.
     */
    if (!databaseSaved) {
      await rollbackNewImageChoices(imageChoices);
    }

    showToast(
      error.message || "Could not update the gallery image.",

      "error",
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;

      submitButton.textContent = "Save Changes";
    }
  }
}

/**
 * ============================================================
 * DELETE GALLERY MEDIA
 * ============================================================
 *
 * External URL:
 *
 *     database row deleted only
 *
 * Supabase uploaded image:
 *
 *     database row deleted
 *          ↓
 *     Storage file deleted
 */
async function handleDeleteMedia(media) {
  const confirmed = window.confirm(`Delete gallery item "${media.title}"?`);

  if (!confirmed) {
    return;
  }

  try {
    /**
     * Save Storage path before deleting record.
     */
    const storagePath = media.storage_path || null;

    /**
     * Database first.
     *
     * If database deletion fails, we do NOT want to remove
     * the image and leave a broken media record.
     */
    await deleteMedia(media.id);

    /**
     * Delete actual Storage file when applicable.
     */
    if (storagePath) {
      try {
        await removeImage(storagePath);
      } catch (storageError) {
        console.warn(
          "Gallery record deleted but the Storage file could not be removed:",
          storageError,
        );
      }
    }

    showToast("Gallery image deleted.");

    await refresh();
  } catch (error) {
    console.error("Could not delete gallery image:", error);

    showToast(
      error.message || "Could not delete the gallery image.",

      "error",
    );
  }
}

/**
 * ============================================================
 * GALLERY LIGHTBOX
 * ============================================================
 */

/**
 * openLightbox()
 *
 * Displays the full-size media image.
 */
function openLightbox(media) {
  const image = document.getElementById("lightbox-image");

  if (image) {
    image.src = media.media_url;

    image.alt = media.title || "Gallery image";
  }

  setText(
    "#lightbox-title",

    media.title || "Gallery image",
  );

  setText(
    "#lightbox-category",

    media.category || "Group media",
  );

  /**
   * "View original" link.
   */
  const original = document.getElementById("lightbox-original");

  if (original) {
    original.href = media.media_url;
  }

  openModal("lightbox-modal");
}

/**
 * ============================================================
 * LOGOUT
 * ============================================================
 */

async function handleLogout() {
  try {
    await logout();

    window.location.reload();
  } catch (error) {
    console.error("Could not sign out:", error);

    showToast(
      "Could not sign out.",

      "error",
    );
  }
}

/**
 * ============================================================
 * PAGE EVENT LISTENERS
 * ============================================================
 */

/**
 * ========================================================
 * INITIALIZE GROUP IMAGE PICKERS
 * ========================================================
 */

/**
 * Group page hero / banner.
 */
editGroupCoverPicker = createImagePicker({
  mount: "#edit-group-cover-picker",

  multiple: false,

  maxFiles: 1,

  allowUrl: true,

  recommendation: GROUP_COVER_RECOMMENDATION.label,
});

/**
 * Smaller group card image.
 */
editGroupCardPicker = createImagePicker({
  mount: "#edit-group-card-picker",

  multiple: false,

  maxFiles: 1,

  allowUrl: true,

  recommendation: GROUP_CARD_RECOMMENDATION.label,
});

/**
 * ========================================================
 * PROJECT COVER IMAGE PICKER
 * ========================================================
 *
 * Project cover images use a 16:9 layout.
 *
 * Only ONE image is allowed.
 */

projectImagePicker = createImagePicker({
  mount: "#project-image-picker",

  /**
   * A project has one cover image.
   */
  multiple: false,

  maxFiles: 1,

  /**
   * Administrator may either:
   *
   * upload an image
   *
   * OR
   *
   * use a public image URL.
   */
  allowUrl: true,

  recommendation: PROJECT_IMAGE_RECOMMENDATION.label,
});

/**
 * ========================================================
 * GALLERY MULTI-UPLOAD PICKER
 * ========================================================
 *
 * This picker initially supports up to 30.
 *
 * Every time the modal opens we reduce that maximum based on
 * how many gallery records already exist.
 */

galleryUploadPicker = createImagePicker({
  mount: "#gallery-upload-picker",

  /**
   * Multiple images are allowed here.
   */
  multiple: true,

  maxFiles: MAX_GALLERY_IMAGES,

  /**
   * URL remains available.
   *
   * URL mode adds one image at a time.
   */
  allowUrl: true,

  recommendation: GALLERY_IMAGE_RECOMMENDATION.label,
});

/**
 * ========================================================
 * INDIVIDUAL MEDIA REPLACEMENT PICKER
 * ========================================================
 *
 * Editing one existing gallery item must still accept only ONE
 * replacement image.
 */

editMediaPicker = createImagePicker({
  mount: "#media-edit-image-picker",

  multiple: false,

  maxFiles: 1,

  allowUrl: true,

  recommendation: GALLERY_IMAGE_RECOMMENDATION.label,
});

/**
 * setupEvents()
 *
 * Connects HTML buttons/forms to JavaScript functions.
 *
 * No inline onclick attributes are required.
 */
function setupEvents() {
  /**
   * Edit current group.
   */
  document.getElementById("edit-group-btn")?.addEventListener(
    "click",

    openGroupEditor,
  );

  /**
   * Delete current group.
   */
  document.getElementById("delete-group-btn")?.addEventListener(
    "click",

    handleDeleteGroup,
  );

  /**
   * Add student.
   */
  document.getElementById("add-member-btn")?.addEventListener(
    "click",

    () => openMemberEditor(),
  );

  /**
   * Add project.
   */
  document.getElementById("add-project-btn")?.addEventListener(
    "click",

    () => openProjectEditor(),
  );

  /**
   * Add gallery media.
   */
  /**
   * Open multi-image gallery uploader.
   */
  document.getElementById("add-media-btn")?.addEventListener(
    "click",

    openGalleryUploader,
  );

  /**
   * Group form submit.
   */
  document.getElementById("group-edit-form")?.addEventListener(
    "submit",

    saveGroup,
  );

  /**
   * Member form submit.
   */
  document.getElementById("member-form")?.addEventListener(
    "submit",

    saveMember,
  );

  /**
   * Project form submit.
   */
  document.getElementById("project-form")?.addEventListener(
    "submit",

    saveProject,
  );

  /**
   * Multi-image upload form.
   */
  document.getElementById("gallery-upload-form")?.addEventListener(
    "submit",

    saveGalleryBatch,
  );

  /**
   * Individual gallery item edit form.
   */
  document.getElementById("media-edit-form")?.addEventListener(
    "submit",

    saveMediaEdit,
  );
}

/**
 * ============================================================
 * INITIALIZE GROUP PAGE
 * ============================================================
 */

async function init() {
  /**
   * Shared navbar.
   */
  renderNavbar("groups");

  /**
   * Enable:
   *
   * - modal close buttons
   * - backdrop closing
   * - Escape closing
   */
  initModalSystem();

  try {
    /**
     * Check administrator session.
     */
    state.admin = await isAdmin();

    /**
     * Display administrator banner if applicable.
     */
    renderAdminBanner(
      state.admin,

      handleLogout,
    );

    /**
     * Register button/form events.
     */
    setupEvents();

    /**
     * Load current group and related records.
     */
    await refresh();
  } catch (error) {
    console.error("Group page failed to initialize:", error);

    showToast(
      "Unable to load this group.",

      "error",
    );

    /**
     * Hide incomplete group UI.
     */
    const pageContent = document.getElementById("group-page-content");

    const notFound = document.getElementById("group-not-found");

    if (pageContent) {
      pageContent.hidden = true;
    }

    if (notFound) {
      notFound.hidden = false;
    }

    renderFooter();
  }
}

/**
 * Start page controller.
 */
init();
