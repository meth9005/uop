/**
 * ============================================================
 * ETU PORTAL - GROUPS PAGE CONTROLLER
 * ============================================================
 *
 * File:
 * assets/js/pages/groupsPage.js
 *
 *
 * PURPOSE
 * ------------------------------------------------------------
 *
 * Controls the behaviour of:
 *
 *     groups.html
 *
 *
 * This page has two main public sections:
 *
 * 1. Student Groups
 * 2. All Published Projects
 *
 *
 * When the authorized administrator is signed in, this page
 * additionally allows:
 *
 *     + Add Student Group
 *
 *
 * IMPORTANT:
 *
 * This file DOES NOT contain direct Supabase queries.
 *
 * Database work is delegated to:
 *
 *     dataService.js
 *
 *
 * Authentication is delegated to:
 *
 *     authService.js
 *
 *
 * Reusable UI comes from:
 *
 *     groupCard.js
 *     projectCard.js
 *     navbar.js
 *     footer.js
 *
 *
 * Final flow:
 *
 * groups.html
 *      ↓
 * groupsPage.js
 *      ↓
 * dataService.js
 *      ↓
 * Supabase
 *
 * ============================================================
 */

/**
 * ============================================================
 * IMPORT CONFIGURATION
 * ============================================================
 */

/**
 * Official project category definitions.
 *
 * Used to generate filter buttons automatically.
 */
import { CATEGORIES } from "../config/categories.js";

/**
 * Recommended dimensions for group images.
 */
import {
  GROUP_COVER_RECOMMENDATION,
  GROUP_CARD_RECOMMENDATION,
} from "../config/images.js";

/**
 * ============================================================
 * IMPORT REUSABLE COMPONENTS
 * ============================================================
 */

/**
 * Shared website navigation.
 */
import { renderNavbar } from "../components/navbar.js";

/**
 * Reusable drag/drop image selector.
 */
import { createImagePicker } from "../components/imagePicker.js";

/**
 * Shared website footer.
 */
import { renderFooter } from "../components/footer.js";

/**
 * Administrator mode notification banner.
 */
import { renderAdminBanner } from "../components/adminBanner.js";

/**
 * Reusable student group card.
 */
import { createGroupCard } from "../components/groupCard.js";

/**
 * Reusable project card.
 */
import { createProjectCard } from "../components/projectCard.js";

/**
 * Used when there are no groups/projects to display.
 */
import { createEmptyState } from "../components/emptyState.js";

/**
 * Shared modal management.
 */
import { openModal, closeModal, initModalSystem } from "../components/modal.js";

/**
 * Small success/error notifications.
 */
import { showToast } from "../components/toast.js";

/**
 * ============================================================
 * IMPORT DOM UTILITIES
 * ============================================================
 */

/**
 * el()
 *     safely creates HTML elements.
 *
 * clear()
 *     removes previous content from a container.
 */
import { el, clear } from "../utils/dom.js";

/**
 * ============================================================
 * IMPORT FORM VALIDATION
 * ============================================================
 */

/**
 * required()
 *     validates required text.
 *
 * optionalText()
 *     converts blank optional fields to null.
 *
 * slugify()
 *     converts text into URL-friendly format.
 *
 * normalizeInteger()
 *     validates sort_order.
 *
 * urlOrPath()
 *     accepts either web URLs or local asset paths.
 */
import {
  required,
  optionalText,
  slugify,
  normalizeInteger,
} from "../utils/validation.js";

/**
 * ============================================================
 * IMPORT DATA SERVICE
 * ============================================================
 */

/**
 * getGroups()
 *     gets real groups from Supabase.
 *
 * getAllProjects()
 *     gets real projects from Supabase.
 *
 * createGroup()
 *     allows administrator to create a new group.
 */
import {
  getGroups,
  getAllProjects,
  createGroup,
} from "../services/dataService.js";

/**
 * Converts picker selections into database-ready image values
 * and safely handles Storage rollback/cleanup.
 */
import {
  resolveSingleImageChoice,
  rollbackNewImageChoices,
} from "../services/imageChoiceService.js";

/**
 * ============================================================
 * IMPORT AUTHENTICATION
 * ============================================================
 */

/**
 * isAdmin()
 *     checks whether current authenticated user is the
 *     authorized ETU administrator.
 *
 * logout()
 *     ends administrator session.
 */
import { isAdmin, logout } from "../services/authService.js";

/**
 * ============================================================
 * PAGE STATE
 * ============================================================
 *
 * Instead of using many global variables scattered throughout
 * the HTML page, this controller stores its current data here.
 */

/**
 * Groups loaded from Supabase.
 */
let groups = [];

/**
 * Projects loaded from Supabase.
 */
let projects = [];

/**
 * Whether current visitor is the authorized administrator.
 */
let admin = false;

/**
 * Currently selected project category.
 *
 * Possible examples:
 *
 *     all
 *     Group Activities
 *     Presentations
 *     Documentaries
 *     Art & Explorer
 */
let activeCategory = "all";

/**
 * ============================================================
 * IMAGE PICKER STATE
 * ============================================================
 *
 * These variables hold the reusable image-picker instances.
 */

let groupCoverPicker = null;

let groupCardPicker = null;

/**
 * ============================================================
 * RENDER GROUP CARDS
 * ============================================================
 */

/**
 * renderGroups()
 *
 * Takes the current groups array and displays one reusable
 * GroupCard for each database record.
 */
function renderGroups() {
  /**
   * Find and clear the group-card container.
   */
  const container = clear("#groups-grid");

  /**
   * Safety check.
   *
   * If the HTML container does not exist, stop.
   */
  if (!container) {
    return;
  }

  /**
   * Create one card for every group returned by Supabase.
   */
  groups.forEach((group) => {
    container.append(
      createGroupCard(
        group,

        {
          /**
           * Show:
           *
           * projects count
           * students count
           */
          showStats: true,

          /**
           * Allows draft badge to appear when
           * administrator sees an unpublished group.
           */
          admin,
        },
      ),
    );
  });

  /**
   * If no groups are available, show a clean message instead
   * of leaving the page blank.
   */
  if (groups.length === 0) {
    container.append(createEmptyState("No student groups are published yet."));
  }
}

/**
 * ============================================================
 * PROJECT CATEGORY FILTER BUTTONS
 * ============================================================
 */

/**
 * renderFilterButtons()
 *
 * Dynamically generates the category buttons.
 *
 * This means category names are not duplicated in HTML.
 */
function renderFilterButtons() {
  const container = clear("#project-filters");

  if (!container) {
    return;
  }

  /**
   * --------------------------------------------------------
   * ALL CATEGORIES BUTTON
   * --------------------------------------------------------
   */

  const allButton = el(
    "button",

    {
      /**
       * Active button uses navy background.
       *
       * Inactive button uses light grey.
       */
      className:
        activeCategory === "all"
          ? "bg-navy-900 " +
            "text-white " +
            "text-xs " +
            "font-semibold " +
            "px-4 py-2 " +
            "rounded-full " +
            "shadow-sm"
          : "bg-slate-200 " +
            "text-slate-700 " +
            "text-xs " +
            "font-medium " +
            "px-4 py-2 " +
            "rounded-full " +
            "hover:bg-slate-300 " +
            "transition",

      text: "All Categories",

      attrs: {
        type: "button",
      },

      /**
       * Clicking shows every project.
       */
      on: {
        click: () => applyFilter("all"),
      },
    },
  );

  container.append(allButton);

  /**
   * --------------------------------------------------------
   * OFFICIAL CATEGORY BUTTONS
   * --------------------------------------------------------
   *
   * Categories come from:
   *
   * assets/js/config/categories.js
   */
  CATEGORIES.forEach((category) => {
    const button = el(
      "button",

      {
        className:
          activeCategory === category.name
            ? "bg-navy-900 " +
              "text-white " +
              "text-xs " +
              "font-semibold " +
              "px-4 py-2 " +
              "rounded-full " +
              "shadow-sm"
            : "bg-slate-200 " +
              "text-slate-700 " +
              "text-xs " +
              "font-medium " +
              "px-4 py-2 " +
              "rounded-full " +
              "hover:bg-slate-300 " +
              "transition",

        /**
         * Example:
         *
         * 📊 Presentations
         */
        text: `${category.icon} ${category.name}`,

        attrs: {
          type: "button",
        },

        on: {
          click: () => applyFilter(category.name),
        },
      },
    );

    container.append(button);
  });
}

/**
 * ============================================================
 * RENDER PROJECTS
 * ============================================================
 */

/**
 * renderProjects()
 *
 * Displays projects matching the currently selected category.
 */
function renderProjects() {
  const container = clear("#projects-grid");

  if (!container) {
    return;
  }

  /**
   * --------------------------------------------------------
   * FILTER CURRENT PROJECTS
   * --------------------------------------------------------
   *
   * "all":
   *
   *     show everything
   *
   * another category:
   *
   *     show only matching project.category
   */
  const visibleProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  /**
   * --------------------------------------------------------
   * UPDATE PROJECT COUNTER
   * --------------------------------------------------------
   */

  const countElement = document.getElementById("project-count");

  if (countElement) {
    countElement.textContent = `${visibleProjects.length} ${
      visibleProjects.length === 1 ? "project" : "projects"
    }`;
  }

  /**
   * --------------------------------------------------------
   * BUILD PROJECT CARDS
   * --------------------------------------------------------
   */

  visibleProjects.forEach((project) => {
    container.append(
      createProjectCard(
        project,

        {
          /**
           * groups.html contains projects from
           * different groups, so show group badge.
           */
          showGroup: true,

          /**
           * Editing projects is intentionally done
           * inside group.html.
           *
           * Therefore groups.html project cards
           * remain read-only even when admin is
           * logged in.
           */
          admin: false,
        },
      ),
    );
  });

  /**
   * --------------------------------------------------------
   * EMPTY RESULTS
   * --------------------------------------------------------
   */

  if (visibleProjects.length === 0) {
    const message =
      activeCategory === "all"
        ? "No projects have been published yet."
        : `No ${activeCategory} projects ` + `have been published yet.`;

    container.append(createEmptyState(message));
  }
}

/**
 * ============================================================
 * APPLY PROJECT FILTER
 * ============================================================
 */

/**
 * applyFilter()
 *
 * Changes the selected category and re-renders the project area.
 */
function applyFilter(category) {
  /**
   * Save selected category.
   */
  activeCategory = category;

  /**
   * Rebuild buttons so the correct one appears active.
   */
  renderFilterButtons();

  /**
   * Show projects matching the selected category.
   */
  renderProjects();

  /**
   * --------------------------------------------------------
   * UPDATE URL
   * --------------------------------------------------------
   *
   * Example:
   *
   * groups.html?category=Presentations
   *
   * This allows categories.html to link directly to a filtered
   * view.
   */
  const url = new URL(window.location.href);

  if (category === "all") {
    url.searchParams.delete("category");
  } else {
    url.searchParams.set(
      "category",

      category,
    );
  }

  /**
   * Change address bar without refreshing the page.
   */
  window.history.replaceState(
    {},

    "",

    url,
  );
}

/**
 * ============================================================
 * ADMINISTRATOR UI SETUP
 * ============================================================
 */

/**
 * setupAdminUI()
 *
 * Configures the Add Group feature.
 *
 * Public users:
 *
 *     button hidden
 *
 * Administrator:
 *
 *     button visible
 */
function setupAdminUI() {
  const addButton = document.getElementById("add-group-btn");

  /**
   * Show Add Group only to administrator.
   */
  if (addButton) {
    addButton.hidden = !admin;
  }

  /**
   * ========================================================
   * CREATE GROUP IMAGE PICKERS
   * ========================================================
   *
   * These are created once when the page starts.
   */

  /**
   * Wide banner shown on the individual group page.
   */
  groupCoverPicker = createImagePicker({
    mount: "#group-cover-picker",

    /**
     * Cover accepts only ONE image.
     */
    multiple: false,

    maxFiles: 1,

    /**
     * Administrator may upload OR paste a URL.
     */
    allowUrl: true,

    recommendation: GROUP_COVER_RECOMMENDATION.label,
  });

  /**
   * Smaller image shown on group cards.
   */
  groupCardPicker = createImagePicker({
    mount: "#group-card-picker",

    multiple: false,

    maxFiles: 1,

    allowUrl: true,

    recommendation: GROUP_CARD_RECOMMENDATION.label,
  });

  /**
   * --------------------------------------------------------
   * OPEN CREATE GROUP MODAL
   * --------------------------------------------------------
   */
  addButton?.addEventListener(
    "click",

    () => {
      const form = document.getElementById("group-form");

      /**
       * Clear data from previous use.
       */
      form?.reset();

      /**
       * Clear any image selections left from the previous time
       * the modal was opened.
       */
      groupCoverPicker?.reset();

      groupCardPicker?.reset();

      /**
       * Calculate next display order.
       *
       * Example:
       *
       * AB01 sort 1
       * AB02 sort 2
       * AB03 sort 3
       * AB04 sort 4
       *
       * new group defaults to 5.
       */
      const nextSortOrder =
        groups.length > 0
          ? Math.max(...groups.map((group) => Number(group.sort_order || 0))) +
            1
          : 1;

      const sortInput = document.getElementById("group-sort-order");

      if (sortInput) {
        sortInput.value = String(nextSortOrder);
      }

      /**
       * New groups are published by default.
       *
       * Administrator may uncheck this to create a draft.
       */
      const publishedInput = document.getElementById("group-published");

      if (publishedInput) {
        publishedInput.checked = true;
      }

      /**
       * Reset the slug auto-generation state.
       *
       * This is important if the modal has already been
       * opened before.
       */
      const slugInput = document.getElementById("group-slug");

      if (slugInput) {
        slugInput.dataset.touched = "";
      }

      openModal("group-modal");
    },
  );

  /**
   * --------------------------------------------------------
   * AUTOMATIC SLUG GENERATION
   * --------------------------------------------------------
   *
   * When administrator types:
   *
   *     Group AB05
   *
   * slug initially becomes:
   *
   *     group-ab05
   *
   * Administrator can change this to:
   *
   *     ab05
   *
   * manually if desired.
   */
  const nameInput = document.getElementById("group-name");

  const slugInput = document.getElementById("group-slug");

  nameInput?.addEventListener(
    "input",

    (event) => {
      /**
       * Stop automatic changes after administrator has
       * manually edited the slug field.
       */
      if (slugInput?.dataset.touched === "true") {
        return;
      }

      if (slugInput) {
        slugInput.value = slugify(event.target.value);
      }
    },
  );

  /**
   * Record that administrator manually changed the slug.
   */
  slugInput?.addEventListener(
    "input",

    (event) => {
      event.target.dataset.touched = "true";
    },
  );

  /**
   * --------------------------------------------------------
   * CREATE GROUP FORM SUBMISSION
   * --------------------------------------------------------
   */
  document.getElementById("group-form")?.addEventListener(
    "submit",

    handleCreateGroup,
  );
}

/**
 * ============================================================
 * CREATE NEW GROUP
 * ============================================================
 *
 * This version also handles:
 *
 * - cover image upload / URL
 * - card image upload / URL
 * - automatic Storage cleanup if database creation fails
 */
async function handleCreateGroup(event) {
  event.preventDefault();

  const submitButton = event.currentTarget.querySelector(
    'button[type="submit"]',
  );

  /**
   * Tracks newly uploaded files.
   *
   * If database INSERT fails we will delete them again.
   */
  let imageChoices = [];

  try {
    if (submitButton) {
      submitButton.disabled = true;

      submitButton.textContent = "Creating...";
    }

    /**
     * ----------------------------------------------------
     * VALIDATE BASIC GROUP INFORMATION FIRST
     * ----------------------------------------------------
     *
     * Do this BEFORE uploading images.
     *
     * That prevents uploading files when the form itself is
     * already invalid.
     */

    const name = required(
      document.getElementById("group-name").value,

      "Group name",
    );

    const slug = required(
      slugify(document.getElementById("group-slug").value),

      "Group slug",
    );

    /**
     * ----------------------------------------------------
     * RESOLVE COVER IMAGE
     * ----------------------------------------------------
     *
     * Possible result:
     *
     * uploaded file
     * external URL
     * null
     */
    const coverChoice = await resolveSingleImageChoice({
      picker: groupCoverPicker,

      folder: `groups/${slug}/cover`,

      existingUrl: null,

      existingStoragePath: null,

      label: "Group cover image",
    });

    imageChoices.push(coverChoice);

    /**
     * ----------------------------------------------------
     * RESOLVE CARD IMAGE
     * ----------------------------------------------------
     */
    const cardChoice = await resolveSingleImageChoice({
      picker: groupCardPicker,

      folder: `groups/${slug}/card`,

      existingUrl: null,

      existingStoragePath: null,

      label: "Group card image",
    });

    imageChoices.push(cardChoice);

    /**
     * ----------------------------------------------------
     * BUILD DATABASE RECORD
     * ----------------------------------------------------
     */

    const payload = {
      name,

      slug,

      tagline: optionalText(document.getElementById("group-tagline").value),

      description: optionalText(
        document.getElementById("group-description").value,
      ),

      /**
       * Public URL used by <img>.
       */
      cover_image: coverChoice.url,

      /**
       * Supabase internal path used later when replacing
       * or deleting the image.
       */
      cover_storage_path: coverChoice.storagePath,

      card_image: cardChoice.url,

      card_storage_path: cardChoice.storagePath,

      sort_order: normalizeInteger(
        document.getElementById("group-sort-order").value,

        0,
      ),

      is_published: document.getElementById("group-published").checked,
    };

    /**
     * ----------------------------------------------------
     * CREATE DATABASE RECORD
     * ----------------------------------------------------
     */

    await createGroup(payload);

    /**
     * Database now safely contains the image URLs.
     */
    closeModal("group-modal");

    showToast("Student group created.");

    /**
     * Clear picker state.
     */
    groupCoverPicker.reset();

    groupCardPicker.reset();

    /**
     * Reload page from Supabase.
     */
    await refreshPageData();
  } catch (error) {
    console.error("Could not create group:", error);

    /**
     * ----------------------------------------------------
     * IMPORTANT STORAGE CLEANUP
     * ----------------------------------------------------
     *
     * Example:
     *
     * upload succeeds
     * database insert fails because slug already exists
     *
     * Without this cleanup the uploaded file would remain
     * unused forever.
     */
    await rollbackNewImageChoices(imageChoices);

    showToast(
      error.message || "Could not create the group.",

      "error",
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;

      submitButton.textContent = "Create Group";
    }
  }
}

/**
 * ============================================================
 * LOGOUT
 * ============================================================
 */

/**
 * handleLogout()
 *
 * Shared callback used by:
 *
 * - Admin banner
 * - Footer
 */
async function handleLogout() {
  try {
    await logout();

    /**
     * Reload page as normal public visitor.
     */
    window.location.reload();
  } catch (error) {
    console.error("Logout failed:", error);

    showToast(
      "Could not sign out.",

      "error",
    );
  }
}

/**
 * ============================================================
 * REFRESH PAGE DATA
 * ============================================================
 */

/**
 * refreshPageData()
 *
 * Reloads current groups and projects from Supabase and then
 * rebuilds the visible UI.
 *
 * Called:
 *
 * - when page first loads
 * - after a new group is created
 */
async function refreshPageData() {
  /**
   * Fetch groups and projects at the same time.
   */
  [groups, projects] = await Promise.all([getGroups(), getAllProjects()]);

  /**
   * Re-render group cards.
   */
  renderGroups();

  /**
   * Re-render category buttons.
   */
  renderFilterButtons();

  /**
   * Re-render project cards.
   */
  renderProjects();

  /**
   * Footer group links are now generated from the same
   * database groups.
   */
  renderFooter(
    groups,

    {
      admin,

      onLogout: handleLogout,
    },
  );
}

/**
 * ============================================================
 * INITIAL PAGE STARTUP
 * ============================================================
 */

/**
 * init()
 *
 * Main entry point for groups.html.
 */
async function init() {
  /**
   * --------------------------------------------------------
   * SHARED NAVIGATION
   * --------------------------------------------------------
   *
   * Highlight "Groups".
   *
   * Gallery points to this page's project section.
   */
  renderNavbar(
    "groups",

    {
      galleryHref: "#projects",
    },
  );

  /**
   * Enable standard modal behaviour:
   *
   * - close buttons
   * - backdrop click
   * - Escape
   */
  initModalSystem();

  try {
    /**
     * ----------------------------------------------------
     * CHECK ADMINISTRATOR STATUS
     * ----------------------------------------------------
     */
    admin = await isAdmin();

    /**
     * Display admin banner only when authorized.
     */
    renderAdminBanner(
      admin,

      handleLogout,
    );

    /**
     * ----------------------------------------------------
     * READ CATEGORY FROM URL
     * ----------------------------------------------------
     *
     * Example:
     *
     * groups.html?category=Presentations
     */
    const requestedCategory = new URLSearchParams(window.location.search).get(
      "category",
    );

    /**
     * Accept category only if it exists in the official
     * configuration.
     */
    const validCategory = CATEGORIES.some(
      (category) => category.name === requestedCategory,
    );

    activeCategory = validCategory ? requestedCategory : "all";

    /**
     * ----------------------------------------------------
     * LOAD REAL DATABASE CONTENT
     * ----------------------------------------------------
     */
    await refreshPageData();

    /**
     * ----------------------------------------------------
     * ENABLE ADMIN FEATURES
     * ----------------------------------------------------
     *
     * setupAdminUI() runs for everyone but keeps controls
     * hidden when admin === false.
     */
    setupAdminUI();
  } catch (error) {
    console.error("Groups page failed to initialize:", error);

    /**
     * Show clear visitor-friendly error.
     */
    showToast(
      "Unable to load portal content.",

      "error",
    );

    /**
     * Footer remains usable even if database loading fails.
     */
    renderFooter([]);
  }
}

/**
 * Start the page.
 *
 * Because this file is loaded using:
 *
 *     <script type="module">
 *
 * the DOM has already been parsed before execution reaches here.
 */
init();
