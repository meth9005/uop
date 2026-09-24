/**
 * ============================================================
 * ETU PORTAL - REUSABLE IMAGE PICKER
 * ============================================================
 *
 * PURPOSE:
 *
 * Provides a consistent image-selection UI for:
 *
 * - Group cover
 * - Group card image
 * - Project cover
 * - Gallery
 *
 *
 * SUPPORTS:
 *
 * ✓ Drag & drop
 * ✓ Browse files
 * ✓ Upload mode
 * ✓ URL mode
 * ✓ Image preview
 * ✓ JPG / JPEG / PNG / WEBP
 * ✓ 2 MB validation
 * ✓ Single-image mode
 * ✓ Multi-image gallery mode
 *
 * ============================================================
 */

import { el, clear } from "../utils/dom.js";

import { validateImageFile } from "../services/storageService.js";

import {
  MAX_IMAGE_SIZE_LABEL,
  ALLOWED_IMAGE_EXTENSIONS,
} from "../config/images.js";

/**
 * ============================================================
 * IMAGE PICKER FACTORY
 * ============================================================
 */

/**
 * createImagePicker()
 *
 * Returns an object that manages one image-selection area.
 *
 *
 * options:
 *
 * mount
 *     CSS selector or DOM element.
 *
 * multiple
 *     false = one image only
 *     true  = many images
 *
 * maxFiles
 *     maximum files the picker may currently accept.
 *
 * recommendation
 *     image dimension guidance.
 *
 * allowUrl
 *     displays external URL option.
 */
export function createImagePicker(options = {}) {
  /**
   * --------------------------------------------------------
   * FIND MOUNT ELEMENT
   * --------------------------------------------------------
   */

  const mount =
    typeof options.mount === "string"
      ? document.querySelector(options.mount)
      : options.mount;

  if (!mount) {
    throw new Error("Image picker mount element was not found.");
  }

  /**
   * --------------------------------------------------------
   * PICKER CONFIG
   * --------------------------------------------------------
   */

  const multiple = Boolean(options.multiple);

  let maxFiles = multiple ? Number(options.maxFiles || 30) : 1;

  const allowUrl = options.allowUrl !== false;

  const recommendation = options.recommendation || "";

  /**
   * --------------------------------------------------------
   * INTERNAL STATE
   * --------------------------------------------------------
   */

  let selectedFiles = [];

  let selectedUrl = "";

  let source = "upload";

  /**
   * --------------------------------------------------------
   * BUILD PICKER HTML
   * --------------------------------------------------------
   */

  mount.innerHTML = `

        <div class="space-y-3">

            <!-- ==============================================
                 SOURCE SELECTOR
                 ============================================== -->

            ${
              allowUrl
                ? `
                        <div
                            class="
                                inline-flex
                                rounded-lg
                                bg-slate-100
                                p-1
                            "
                        >

                            <button
                                type="button"
                                data-image-source="upload"
                                class="
                                    image-source-button
                                    bg-white
                                    text-navy-900
                                    shadow-sm
                                    rounded-md
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-semibold
                                "
                            >
                                Upload Image
                            </button>

                            <button
                                type="button"
                                data-image-source="url"
                                class="
                                    image-source-button
                                    text-slate-500
                                    rounded-md
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-semibold
                                "
                            >
                                Use Image URL
                            </button>

                        </div>
                    `
                : ""
            }


            <!-- ==============================================
                 UPLOAD PANEL
                 ============================================== -->

            <div
                data-image-panel="upload"
            >

                <div
                    data-drop-zone
                    class="
                        border-2
                        border-dashed
                        border-slate-300
                        hover:border-accent-gold
                        rounded-xl
                        p-6
                        text-center
                        transition
                        cursor-pointer
                        bg-slate-50
                    "
                >

                    <div
                        class="
                            text-3xl
                            mb-2
                        "
                    >
                        🖼️
                    </div>


                    <div
                        class="
                            text-sm
                            font-semibold
                            text-navy-900
                            mb-1
                        "
                    >
                        ${
                          multiple
                            ? "Drag & drop images here"
                            : "Drag & drop an image here"
                        }
                    </div>


                    <div
                        class="
                            text-xs
                            text-slate-500
                            mb-3
                        "
                    >
                        or click to browse your device
                    </div>


                    <button
                        type="button"
                        data-browse-button
                        class="
                            bg-navy-900
                            hover:bg-navy-800
                            text-white
                            text-xs
                            font-semibold
                            px-4
                            py-2
                            rounded-lg
                        "
                    >
                        ${multiple ? "Choose Images" : "Choose Image"}
                    </button>


                    <input
                        data-file-input
                        type="file"

                        accept="
                            image/jpeg,
                            image/png,
                            image/webp
                        "

                        ${multiple ? "multiple" : ""}

                        hidden
                    >

                </div>


                <!-- ==========================================
                     UPLOAD GUIDANCE
                     ========================================== -->

                <div
                    class="
                        mt-2
                        text-[11px]
                        leading-relaxed
                        text-slate-500
                    "
                >

                    <div>
                        Allowed:
                        JPG, JPEG, PNG and WEBP.
                    </div>

                    <div>
                        Maximum file size:
                        ${MAX_IMAGE_SIZE_LABEL} per image.
                    </div>

                    ${
                      recommendation
                        ? `
                                <div>
                                    ${recommendation}
                                </div>
                            `
                        : ""
                    }

                    ${
                      multiple
                        ? `
                                <div data-max-files-help>
                                    You may select up to
                                    ${maxFiles}
                                    image${maxFiles === 1 ? "" : "s"}
                                    right now.
                                </div>
                            `
                        : `
                                <div>
                                    Only one image can be selected
                                    for this field.
                                </div>
                            `
                    }

                </div>


                <!-- Selected file previews -->
                <div
                    data-file-previews
                    class="
                        grid
                        grid-cols-2
                        sm:grid-cols-3
                        gap-3
                        mt-3
                    "
                >
                </div>

            </div>


            <!-- ==============================================
                 URL PANEL
                 ============================================== -->

            ${
              allowUrl
                ? `
                        <div
                            data-image-panel="url"
                            hidden
                        >

                            <label
                                class="form-label"
                            >
                                Existing Image URL
                            </label>


                            <input
                                data-url-input
                                type="url"
                                class="form-control"
                                placeholder="https://example.com/photo.jpg"
                            >


                            <p
                                class="
                                    mt-2
                                    text-[11px]
                                    text-slate-500
                                    leading-relaxed
                                "
                            >
                                Use a direct public image URL.
                                The URL should point to an image
                                that visitors can access without
                                signing in.

                                ${recommendation ? recommendation : ""}
                            </p>


                            <div
                                data-url-preview
                                class="mt-3"
                            >
                            </div>

                        </div>
                    `
                : ""
            }


            <!-- ==============================================
                 ERROR MESSAGE
                 ============================================== -->

            <div
                data-image-error
                hidden
                class="
                    rounded-lg
                    border
                    border-red-200
                    bg-red-50
                    px-3
                    py-2
                    text-xs
                    text-red-700
                "
            >
            </div>

        </div>
    `;

  /**
   * --------------------------------------------------------
   * GET ELEMENT REFERENCES
   * --------------------------------------------------------
   */

  const fileInput = mount.querySelector("[data-file-input]");

  const dropZone = mount.querySelector("[data-drop-zone]");

  const browseButton = mount.querySelector("[data-browse-button]");

  const previewContainer = mount.querySelector("[data-file-previews]");

  const errorBox = mount.querySelector("[data-image-error]");

  const urlInput = mount.querySelector("[data-url-input]");

  const urlPreview = mount.querySelector("[data-url-preview]");

  /**
   * ========================================================
   * ERROR DISPLAY
   * ========================================================
   */

  function showError(message) {
    errorBox.textContent = message;

    errorBox.hidden = false;
  }

  function clearError() {
    errorBox.textContent = "";

    errorBox.hidden = true;
  }

  /**
   * ========================================================
   * FILE PREVIEWS
   * ========================================================
   */

  function renderFilePreviews() {
    clear(previewContainer);

    selectedFiles.forEach((file, index) => {
      const card = el(
        "div",

        {
          className:
            "relative " +
            "border border-slate-200 " +
            "rounded-lg " +
            "overflow-hidden " +
            "bg-white",
        },
      );

      const image = el(
        "img",

        {
          className: "w-full h-28 object-cover",

          attrs: {
            alt: file.name,
          },
        },
      );

      /**
       * Browser-only temporary preview.
       *
       * This does NOT upload the image yet.
       */
      const previewUrl = URL.createObjectURL(file);

      image.src = previewUrl;

      image.addEventListener(
        "load",

        () => {
          URL.revokeObjectURL(previewUrl);
        },
      );

      const details = el(
        "div",

        {
          className: "p-2",
        },

        [
          el(
            "div",

            {
              className:
                "text-[10px] " +
                "font-semibold " +
                "text-slate-700 " +
                "truncate",

              text: file.name,
            },
          ),

          el(
            "div",

            {
              className: "text-[9px] " + "text-slate-400",

              text: (file.size / 1024 / 1024).toFixed(2) + " MB",
            },
          ),
        ],
      );

      const removeButton = el(
        "button",

        {
          className:
            "absolute " +
            "top-1 right-1 " +
            "bg-red-600 " +
            "text-white " +
            "w-6 h-6 " +
            "rounded-full " +
            "text-xs " +
            "font-bold",

          text: "×",

          attrs: {
            type: "button",

            "aria-label": `Remove ${file.name}`,
          },

          on: {
            click: () => {
              selectedFiles.splice(
                index,

                1,
              );

              renderFilePreviews();
            },
          },
        },
      );

      card.append(
        image,

        details,

        removeButton,
      );

      previewContainer.append(card);
    });
  }

  /**
   * ========================================================
   * FILE SELECTION
   * ========================================================
   */

  function acceptFiles(files) {
    clearError();

    const incoming = Array.from(files || []);

    if (incoming.length === 0) {
      return;
    }

    /**
     * Single-image picker cannot accept multiple images.
     */
    if (!multiple && incoming.length > 1) {
      showError("Only one image can be selected for this field.");

      return;
    }

    /**
     * Calculate final number of selected files.
     */
    const finalCount = multiple
      ? selectedFiles.length + incoming.length
      : incoming.length;

    if (finalCount > maxFiles) {
      showError(
        `You can select a maximum of ${maxFiles} ` +
          `image${maxFiles === 1 ? "" : "s"} here.`,
      );

      return;
    }

    /**
     * Validate every incoming file before accepting them.
     */
    try {
      incoming.forEach((file) => {
        validateImageFile(file);
      });
    } catch (error) {
      showError(error.message);

      return;
    }

    /**
     * Single field replaces previous selected image.
     */
    if (!multiple) {
      selectedFiles = [incoming[0]];
    } else {

    /**
     * Gallery adds new files to current selection.
     */
      selectedFiles.push(...incoming);
    }

    renderFilePreviews();
  }

  /**
   * ========================================================
   * FILE BROWSER
   * ========================================================
   */

  browseButton.addEventListener(
    "click",

    (event) => {
      /**
       * Prevent bubbling to drop zone click.
       */
      event.stopPropagation();

      fileInput.click();
    },
  );

  dropZone.addEventListener(
    "click",

    (event) => {
      /**
       * Button already handles its own click.
       */
      if (event.target.closest("[data-browse-button]")) {
        return;
      }

      fileInput.click();
    },
  );

  fileInput.addEventListener(
    "change",

    () => {
      acceptFiles(fileInput.files);

      /**
       * Reset input so selecting the same file again later
       * still triggers change.
       */
      fileInput.value = "";
    },
  );

  /**
   * ========================================================
   * DRAG AND DROP
   * ========================================================
   */

  /**
   * Browser normally tries to open a dropped image.
   *
   * Prevent that behaviour.
   */
  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(
      eventName,

      (event) => {
        event.preventDefault();

        event.stopPropagation();

        dropZone.classList.add("border-accent-gold", "bg-amber-50");
      },
    );
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(
      eventName,

      (event) => {
        event.preventDefault();

        event.stopPropagation();

        dropZone.classList.remove("border-accent-gold", "bg-amber-50");
      },
    );
  });

  dropZone.addEventListener(
    "drop",

    (event) => {
      acceptFiles(event.dataTransfer.files);
    },
  );

  /**
   * ========================================================
   * UPLOAD / URL TABS
   * ========================================================
   */

  mount.querySelectorAll("[data-image-source]").forEach((button) => {
    button.addEventListener(
      "click",

      () => {
        source = button.dataset.imageSource;

        /**
         * Update buttons.
         */
        mount.querySelectorAll("[data-image-source]").forEach((item) => {
          const active = item.dataset.imageSource === source;

          item.classList.toggle("bg-white", active);

          item.classList.toggle("text-navy-900", active);

          item.classList.toggle("shadow-sm", active);

          item.classList.toggle("text-slate-500", !active);
        });

        /**
         * Switch visible panel.
         */
        mount.querySelectorAll("[data-image-panel]").forEach((panel) => {
          panel.hidden = panel.dataset.imagePanel !== source;
        });
      },
    );
  });

  /**
   * ========================================================
   * URL PREVIEW
   * ========================================================
   */

  urlInput?.addEventListener(
    "input",

    () => {
      selectedUrl = urlInput.value.trim();

      clear(urlPreview);

      if (!selectedUrl) {
        return;
      }

      const preview = el(
        "img",

        {
          className:
            "w-full " +
            "max-w-xs " +
            "h-40 " +
            "object-cover " +
            "rounded-lg " +
            "border border-slate-200",

          attrs: {
            alt: "External image preview",
          },
        },
      );

      preview.src = selectedUrl;

      preview.addEventListener(
        "error",

        () => {
          clear(urlPreview);

          showError(
            "The image URL could not be previewed. Make sure it is a direct public image URL.",
          );
        },
      );

      urlPreview.append(preview);
    },
  );

  /**
   * ========================================================
   * PUBLIC PICKER API
   * ========================================================
   */

  return {
    /**
     * Which source the administrator selected:
     *
     * upload
     * url
     */
    getSource() {
      return source;
    },

    /**
     * Selected browser files.
     */
    getFiles() {
      return [...selectedFiles];
    },

    /**
     * External URL.
     */
    getUrl() {
      return urlInput?.value.trim() || "";
    },

    /**
     * Used by gallery when remaining capacity changes.
     */
    setMaxFiles(value) {
      maxFiles = multiple ? Math.max(0, Number(value || 0)) : 1;

      const help = mount.querySelector("[data-max-files-help]");

      if (help) {
        help.textContent =
          `You may select up to ${maxFiles} ` +
          `image${maxFiles === 1 ? "" : "s"} right now.`;
      }
    },

    /**
     * Clear the picker after a successful save or when reopening
     * a modal.
     */
    reset() {
      /**
       * Clear internal data.
       */
      selectedFiles = [];

      selectedUrl = "";

      source = "upload";

      /**
       * Clear native file input.
       */
      fileInput.value = "";

      /**
       * Clear URL field.
       */
      if (urlInput) {
        urlInput.value = "";
      }

      /**
       * Remove image previews.
       */
      clear(previewContainer);

      clear(urlPreview);

      clearError();

      /**
       * --------------------------------------------------------
       * VISUALLY RETURN TO UPLOAD MODE
       * --------------------------------------------------------
       *
       * Without this section the internal source would become
       * "upload", but the URL panel could remain visible.
       */

      mount.querySelectorAll("[data-image-source]").forEach((button) => {
        const active = button.dataset.imageSource === "upload";

        button.classList.toggle("bg-white", active);

        button.classList.toggle("text-navy-900", active);

        button.classList.toggle("shadow-sm", active);

        button.classList.toggle("text-slate-500", !active);
      });

      mount.querySelectorAll("[data-image-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.imagePanel !== "upload";
      });
    },
  };
}
