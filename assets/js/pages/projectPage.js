/**
 * ============================================================
 * ETU PORTAL - PROJECT DETAIL PAGE CONTROLLER
 * ============================================================
 *
 * Controls:
 *
 *     project.html?id=PROJECT_ID
 *
 * Public users can:
 * - View full project details
 * - View complete project image
 * - View project group
 * - Watch project video
 *
 * Administrators can additionally:
 * - Edit the project directly on this page
 * - Replace project image
 * - Change project metadata
 * - Delete the project
 *
 * ============================================================
 */

/**
 * ============================================================
 * CONFIG
 * ============================================================
 */

import { CATEGORIES } from "../config/categories.js";

import { PROJECT_IMAGE_RECOMMENDATION } from "../config/images.js";

/**
 * ============================================================
 * SHARED COMPONENTS
 * ============================================================
 */

import { renderNavbar } from "../components/navbar.js";

import { renderFooter } from "../components/footer.js";

import { renderAdminBanner } from "../components/adminBanner.js";

import { showToast } from "../components/toast.js";

import { createImagePicker } from "../components/imagePicker.js";

import { openModal, closeModal, initModalSystem } from "../components/modal.js";

/**
 * ============================================================
 * DATA
 * ============================================================
 */

import {
  getAllProjects,
  updateProject,
  deleteProject,
} from "../services/dataService.js";

/**
 * ============================================================
 * IMAGE SERVICES
 * ============================================================
 */

import {
  resolveSingleImageChoice,
  rollbackNewImageChoices,
  cleanupReplacedImageChoices,
} from "../services/imageChoiceService.js";

import { removeImage } from "../services/storageService.js";

/**
 * ============================================================
 * AUTH
 * ============================================================
 */

import { isAdmin, logout } from "../services/authService.js";

/**
 * ============================================================
 * VALIDATION
 * ============================================================
 */

import {
  required,
  optionalText,
  normalizeInteger,
} from "../utils/validation.js";

/**
 * ============================================================
 * FORMAT HELPERS
 * ============================================================
 */

import {
  DEFAULT_PROJECT_IMAGE,
  groupCode,
  toYouTubeEmbedUrl,
} from "../utils/format.js";

/**
 * ============================================================
 * PAGE STATE
 * ============================================================
 */

const state = {
  project: null,

  admin: false,
};

/**
 * Reusable project image picker.
 */
let projectImagePicker = null;

/**
 * ============================================================
 * GET PROJECT ID
 * ============================================================
 */

function getProjectId() {
  const params = new URLSearchParams(window.location.search);

  return params.get("id");
}

/**
 * ============================================================
 * PROJECT NOT FOUND
 * ============================================================
 */

function showNotFound() {
  const page = document.querySelector(".project-view-page");

  if (!page) {
    return;
  }

  page.innerHTML = `

        <section class="project-view-not-found">

            <p class="eyebrow">
                Project unavailable
            </p>

            <h1>
                Project not found.
            </h1>

            <p>
                The project may have been removed
                or the link may be incorrect.
            </p>

            <a
                href="projects.html"
                class="text-link"
            >
                ← Back to projects
            </a>

        </section>

    `;
}

/**
 * ============================================================
 * PROJECT IMAGE
 * ============================================================
 *
 * The project detail page shows the COMPLETE image.
 *
 * JavaScript only detects the image orientation.
 * CSS decides its maximum presentation size.
 */

function renderProjectImage(project) {
  const image = document.getElementById("project-view-image");

  if (!image) {
    return;
  }

  image.alt = project.title || "Student project";

  image.onload = () => {
    const width = image.naturalWidth;

    const height = image.naturalHeight;

    if (!width || !height) {
      return;
    }

    const ratio = width / height;

    image.classList.remove("is-landscape", "is-portrait", "is-square");

    if (ratio > 1.15) {
      image.classList.add("is-landscape");
    } else if (ratio < 0.85) {
      image.classList.add("is-portrait");
    } else {
      image.classList.add("is-square");
    }
  };

  /**
   * Use faculty/default image if saved URL fails.
   */
  image.onerror = () => {
    image.onerror = null;

    image.src = DEFAULT_PROJECT_IMAGE;
  };

  image.src = project.file_url || DEFAULT_PROJECT_IMAGE;
}

/**
 * ============================================================
 * RENDER PROJECT
 * ============================================================
 */

function renderProject(project) {
  const group = project.groups || null;

  const groupLabel = group ? groupCode(group) : "Student group";

  /**
   * Browser title.
   */
  document.title = `${project.title || "Project"} | English Teaching Unit`;

  const title = document.getElementById("project-view-title");

  const category = document.getElementById("project-view-category");

  const categoryMeta = document.getElementById("project-view-meta-category");

  const description = document.getElementById("project-view-description");

  const groupMeta = document.getElementById("project-view-meta-group");

  const groupLink = document.getElementById("project-view-group");

  /**
   * ========================================================
   * TITLE
   * ========================================================
   */

  if (title) {
    title.textContent = project.title || "Untitled project";
  }

  /**
   * ========================================================
   * CATEGORY
   * ========================================================
   */

  if (category) {
    category.textContent = project.category || "Student project";
  }

  if (categoryMeta) {
    categoryMeta.textContent = project.category || "Project";
  }

  /**
   * ========================================================
   * DESCRIPTION
   * ========================================================
   */

  if (description) {
    description.textContent =
      project.description || "No project description has been added yet.";
  }

  /**
   * ========================================================
   * GROUP
   * ========================================================
   */

  if (groupMeta) {
    groupMeta.textContent = groupLabel;
  }

  if (groupLink && group?.slug) {
    groupLink.href = `group.html?group=${encodeURIComponent(group.slug)}`;

    groupLink.textContent = `View ${groupLabel} →`;

    groupLink.hidden = false;
  } else if (groupLink) {
    groupLink.hidden = true;
  }

  /**
   * ========================================================
   * IMAGE
   * ========================================================
   */

  renderProjectImage(project);

  /**
   * ========================================================
   * DURATION
   * ========================================================
   */

  const durationRow = document.getElementById("project-view-duration-row");

  const duration = document.getElementById("project-view-duration");

  if (project.duration_label) {
    if (durationRow) {
      durationRow.hidden = false;
    }

    if (duration) {
      duration.textContent = project.duration_label;
    }
  } else {
    if (durationRow) {
      durationRow.hidden = true;
    }

    if (duration) {
      duration.textContent = "—";
    }
  }

  /**
   * ========================================================
   * VIDEO
   * ========================================================
   */

  const embedUrl = toYouTubeEmbedUrl(project.youtube_url);

  const videoSection = document.getElementById("project-view-video-section");

  const video = document.getElementById("project-view-video");

  if (embedUrl && videoSection && video) {
    video.src = embedUrl;

    video.title = `${project.title || "Project"} video`;

    videoSection.hidden = false;
  } else {
    if (videoSection) {
      videoSection.hidden = true;
    }

    if (video) {
      video.removeAttribute("src");
    }
  }
}

/**
 * ============================================================
 * ADMIN CONTROL VISIBILITY
 * ============================================================
 */

function renderAdminControls() {
  const controls = document.getElementById("project-view-admin-actions");

  if (!controls) {
    return;
  }

  controls.hidden = !state.admin;
}

/**
 * ============================================================
 * CATEGORY SELECT
 * ============================================================
 */

function fillProjectCategorySelect() {
  const select = document.getElementById("project-category");

  if (!select) {
    return;
  }

  select.replaceChildren();

  CATEGORIES.forEach((category) => {
    const option = document.createElement("option");

    option.value = category.name;

    option.textContent = category.name;

    select.append(option);
  });
}

/**
 * ============================================================
 * OPEN EDIT PROJECT MODAL
 * ============================================================
 */

function handleEditProject() {
  if (!state.admin || !state.project) {
    return;
  }

  if (!projectImagePicker) {
    showToast("Project editor is not available.", "error");

    return;
  }

  const project = state.project;

  /**
   * Modal heading.
   */
  const modalTitle = document.getElementById("project-modal-title");

  if (modalTitle) {
    modalTitle.textContent = "Edit Project";
  }

  /**
   * Project ID.
   */
  const idInput = document.getElementById("project-id");

  if (idInput) {
    idInput.value = project.id;
  }

  /**
   * Category.
   */
  fillProjectCategorySelect();

  const categorySelect = document.getElementById("project-category");

  if (categorySelect) {
    categorySelect.value = project.category || CATEGORIES[0]?.name || "";
  }

  /**
   * Title.
   */
  const titleInput = document.getElementById("project-title");

  if (titleInput) {
    titleInput.value = project.title || "";
  }

  /**
   * Description.
   */
  const descriptionInput = document.getElementById("project-description");

  if (descriptionInput) {
    descriptionInput.value = project.description || "";
  }

  /**
   * YouTube URL.
   */
  const youtubeInput = document.getElementById("project-youtube");

  if (youtubeInput) {
    youtubeInput.value = project.youtube_url || "";
  }

  /**
   * Duration.
   */
  const durationInput = document.getElementById("project-duration");

  if (durationInput) {
    durationInput.value = project.duration_label || "";
  }

  /**
   * Sort order.
   */
  const sortInput = document.getElementById("project-sort");

  if (sortInput) {
    sortInput.value = project.sort_order ?? 0;
  }

  /**
   * Featured.
   */
  const featuredInput = document.getElementById("project-featured");

  if (featuredInput) {
    featuredInput.checked = Boolean(project.is_featured);
  }

  /**
   * Published.
   */
  const publishedInput = document.getElementById("project-published");

  if (publishedInput) {
    publishedInput.checked = project.is_published !== false;
  }

  /**
   * Remove any previously selected replacement image.
   */
  projectImagePicker.reset();

  /**
   * Existing project image preview.
   */
  const currentWrap = document.getElementById("current-project-image-wrap");

  const currentPreview = document.getElementById(
    "current-project-image-preview",
  );

  if (currentWrap && currentPreview) {
    if (project.file_url) {
      currentWrap.hidden = false;

      currentPreview.src = project.file_url;

      currentPreview.alt = `${project.title || "Project"} project image`;
    } else {
      currentWrap.hidden = true;

      currentPreview.removeAttribute("src");
    }
  }

  /**
   * Open modal on THIS page.
   */
  openModal("project-modal");
}

/**
 * ============================================================
 * SAVE PROJECT EDIT
 * ============================================================
 */

async function saveProjectEdit(event) {
  event.preventDefault();

  if (!state.admin || !state.project || !projectImagePicker) {
    return;
  }

  const submitButton = event.currentTarget.querySelector(
    'button[type="submit"]',
  );

  /**
   * Needed if database saving fails after an image upload.
   */
  let imageChoices = [];

  try {
    if (submitButton) {
      submitButton.disabled = true;

      submitButton.textContent = "Saving...";
    }

    /**
     * ====================================================
     * VALIDATE TEXT
     * ====================================================
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
     * ====================================================
     * IMAGE
     * ====================================================
     *
     * No new selection:
     * keep existing image.
     *
     * Upload:
     * replace current image.
     *
     * URL:
     * replace current image with URL.
     */

    const imageChoice = await resolveSingleImageChoice({
      picker: projectImagePicker,

      folder: `groups/${state.project.groups?.slug || "projects"}/projects`,

      existingUrl: state.project.file_url || null,

      existingStoragePath: state.project.file_storage_path || null,

      label: "Project cover image",
    });

    imageChoices.push(imageChoice);

    /**
     * ====================================================
     * DATABASE CHANGES
     * ====================================================
     */

    const changes = {
      title,

      category,

      description: optionalText(
        document.getElementById("project-description").value,
      ),

      file_url: imageChoice.url,

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
     * SAVE TO SUPABASE
     * ====================================================
     */

    const updatedProject = await updateProject(state.project.id, changes);

    /**
     * Database has successfully switched to the new image.
     * Old replaced Storage image can now be removed.
     */
    await cleanupReplacedImageChoices(imageChoices);

    /**
     * updateProject() returns the project row,
     * but not necessarily the nested group relationship.
     *
     * Preserve groups from the existing page state.
     */
    state.project = {
      ...state.project,

      ...updatedProject,

      groups: state.project.groups,
    };

    /**
     * Update visible project page immediately.
     */
    renderProject(state.project);

    /**
     * Close edit modal.
     */
    closeModal("project-modal");

    /**
     * Clear browser-side replacement image selection.
     */
    projectImagePicker.reset();

    showToast("Project updated.");
  } catch (error) {
    console.error("Could not update project:", error);

    /**
     * If a new image was uploaded but database update failed,
     * remove the unused uploaded object.
     */
    await rollbackNewImageChoices(imageChoices);

    showToast(
      error.message || "Could not update the project.",

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
 */

async function handleDeleteProject() {
  if (!state.admin || !state.project) {
    return;
  }

  const confirmed = window.confirm(
    `Delete "${state.project.title}"?\n\n` +
      `Gallery media linked to this project will remain ` +
      `in the group gallery.`,
  );

  if (!confirmed) {
    return;
  }

  const button = document.getElementById("project-view-delete-btn");

  try {
    if (button) {
      button.disabled = true;

      button.textContent = "Deleting…";
    }

    /**
     * Save Storage path before deleting database record.
     */
    const storagePath = state.project.file_storage_path || null;

    /**
     * Delete database record first.
     */
    await deleteProject(state.project.id);

    /**
     * Remove project-owned storage file afterwards.
     */
    if (storagePath) {
      try {
        await removeImage(storagePath);
      } catch (storageError) {
        /**
         * Database deletion already succeeded.
         * Storage cleanup failure should not block user.
         */
        console.warn(
          "Project deleted but its old image could not be removed:",
          storageError,
        );
      }
    }

    showToast("Project deleted.");

    /**
     * Return to project archive.
     */
    window.location.href = "projects.html";
  } catch (error) {
    console.error("Could not delete project:", error);

    showToast(
      error.message || "Could not delete the project.",

      "error",
    );

    if (button) {
      button.disabled = false;

      button.textContent = "Delete";
    }
  }
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

    showToast("Could not sign out.", "error");
  }
}

/**
 * ============================================================
 * PAGE EVENT LISTENERS
 * ============================================================
 */

function setupEvents() {
  /**
   * Edit project.
   */
  document
    .getElementById("project-view-edit-btn")
    ?.addEventListener("click", handleEditProject);

  /**
   * Delete project.
   */
  document
    .getElementById("project-view-delete-btn")
    ?.addEventListener("click", handleDeleteProject);

  /**
   * Save project edit form.
   */
  document
    .getElementById("project-form")
    ?.addEventListener("submit", saveProjectEdit);
}

/**
 * ============================================================
 * INITIALIZE ADMIN PROJECT EDITOR
 * ============================================================
 */

function initializeProjectEditor() {
  /**
   * Public users do not need to initialize editing UI.
   */
  if (!state.admin) {
    return;
  }

  const mount = document.querySelector("#project-image-picker");

  /**
   * If project.html does not contain the edit modal,
   * fail cleanly instead of breaking the project view.
   */
  if (!mount) {
    console.error("Missing #project-image-picker in project.html");

    return;
  }

  projectImagePicker = createImagePicker({
    mount: "#project-image-picker",

    multiple: false,

    maxFiles: 1,

    allowUrl: true,

    recommendation: PROJECT_IMAGE_RECOMMENDATION.label,
  });
}

/**
 * ============================================================
 * INITIALIZE PAGE
 * ============================================================
 */

async function init() {
  /**
   * Projects remains active in navigation while viewing
   * individual project pages.
   */
  renderNavbar("projects");

  /**
   * Enables:
   *
   * - modal close button
   * - backdrop close
   * - Escape key close
   */
  initModalSystem();

  const projectId = getProjectId();

  if (!projectId) {
    showNotFound();

    renderFooter();

    return;
  }

  try {
    /**
     * Check admin status and load projects simultaneously.
     */
    const [adminStatus, projects] = await Promise.all([
      isAdmin(),

      getAllProjects(),
    ]);

    state.admin = adminStatus;

    /**
     * Find requested project.
     */
    state.project =
      projects.find((item) => String(item.id) === String(projectId)) || null;

    /**
     * Show/hide Administrator Mode banner.
     */
    renderAdminBanner(state.admin, handleLogout);

    /**
     * Invalid project ID.
     */
    if (!state.project) {
      showNotFound();

      renderFooter({
        admin: state.admin,

        onLogout: handleLogout,
      });

      return;
    }

    /**
     * Render project details.
     */
    renderProject(state.project);

    /**
     * Only admins see Edit/Delete.
     */
    renderAdminControls();

    /**
     * Build image picker for edit modal.
     */
    initializeProjectEditor();

    /**
     * Register buttons and form.
     */
    setupEvents();

    /**
     * Footer.
     */
    renderFooter({
      admin: state.admin,

      onLogout: handleLogout,
    });
  } catch (error) {
    console.error("PROJECT PAGE ERROR:", error);

    showNotFound();

    renderFooter();
  }
}

/**
 * Start controller.
 */
init();
