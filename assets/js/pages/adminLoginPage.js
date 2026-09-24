/**
 * ============================================================
 * ETU PORTAL - ADMIN LOGIN PAGE CONTROLLER
 * ============================================================
 *
 * File:
 * assets/js/pages/adminLoginPage.js
 *
 *
 * PURPOSE:
 *
 * Controls:
 *
 *     admin-login.html
 *
 *
 * Responsibilities:
 *
 * - Check whether administrator is already signed in
 * - Read email/password form
 * - Call authService.login()
 * - Display authentication errors
 * - Redirect successful login to groups.html
 *
 *
 * This file NEVER stores credentials.
 * ============================================================
 */

import { login, isAdmin } from "../services/authService.js";

/**
 * ============================================================
 * PAGE INITIALIZATION
 * ============================================================
 */

async function init() {
  /**
   * Find required HTML elements.
   */
  const form = document.getElementById("admin-login-form");

  const errorBox = document.getElementById("login-error");

  const submitButton = document.getElementById("login-submit");

  /**
   * ========================================================
   * PASSWORD VISIBILITY ELEMENTS
   * ========================================================
   *
   * These elements control the Show / Hide password feature.
   */

  const passwordInput = document.getElementById("admin-password");

  const togglePasswordButton = document.getElementById("toggle-password");

  const eyeOpenIcon = document.getElementById("password-eye-open");

  const eyeClosedIcon = document.getElementById("password-eye-closed");

  /**
   * Safety check.
   *
   * If IDs in HTML do not match JavaScript IDs,
   * clearly report the problem in console.
   */
  if (!form || !errorBox || !submitButton) {
    console.error("Admin login page is missing required HTML elements.");

    return;
  }

  /**
   * ========================================================
   * ALREADY LOGGED IN?
   * ========================================================
   *
   * If admin already has an active session and opens
   * admin-login.html again, send them directly to groups.html.
   */

  try {
    const alreadyAdmin = await isAdmin();

    if (alreadyAdmin) {
      window.location.href = "groups.html";

      return;
    }
  } catch (error) {
    /**
     * Do not block login form if session check itself fails.
     */
    console.warn("Initial administrator session check failed:", error);
  }

  /**
   * ========================================================
   * SHOW / HIDE PASSWORD
   * ========================================================
   *
   * Clicking the eye icon changes:
   *
   *     type="password"
   *
   * into:
   *
   *     type="text"
   *
   * Clicking again changes it back.
   */

  togglePasswordButton?.addEventListener(
    "click",

    () => {
      /**
       * Check the current password visibility.
       */
      const passwordIsHidden = passwordInput.type === "password";

      /**
       * ----------------------------------------------------
       * SHOW PASSWORD
       * ----------------------------------------------------
       */
      if (passwordIsHidden) {
        /**
         * Make typed characters visible.
         */
        passwordInput.type = "text";

        /**
         * Hide normal eye icon.
         */
        eyeOpenIcon.classList.add("hidden");

        /**
         * Show crossed-eye icon.
         */
        eyeClosedIcon.classList.remove("hidden");

        /**
         * Improve screen-reader accessibility.
         */
        togglePasswordButton.setAttribute("aria-label", "Hide password");

        togglePasswordButton.setAttribute("aria-pressed", "true");
      } else {

      /**
       * ----------------------------------------------------
       * HIDE PASSWORD
       * ----------------------------------------------------
       */
        /**
         * Hide characters again.
         */
        passwordInput.type = "password";

        /**
         * Show normal eye icon.
         */
        eyeOpenIcon.classList.remove("hidden");

        /**
         * Hide crossed-eye icon.
         */
        eyeClosedIcon.classList.add("hidden");

        togglePasswordButton.setAttribute("aria-label", "Show password");

        togglePasswordButton.setAttribute("aria-pressed", "false");
      }

      /**
       * Return keyboard focus to the password field so the
       * administrator can continue typing immediately.
       */
      passwordInput.focus();
    },
  );

  /**
   * ========================================================
   * LOGIN FORM SUBMISSION
   * ========================================================
   */

  form.addEventListener(
    "submit",

    async (event) => {
      /**
       * Prevent normal browser form submission.
       */
      event.preventDefault();

      /**
       * Hide previous error.
       */
      errorBox.hidden = true;

      errorBox.textContent = "";

      /**
       * Prevent duplicate login clicks.
       */
      submitButton.disabled = true;

      submitButton.textContent = "Signing in...";

      try {
        /**
         * Read credentials directly from form fields.
         *
         * Credentials are NOT stored anywhere.
         */
        const email = document.getElementById("admin-email").value;

        const password = document.getElementById("admin-password").value;

        /**
         * Ask authService to authenticate and authorize.
         */
        await login(
          email,

          password,
        );

        /**
         * =================================================
         * LOGIN SUCCESS
         * =================================================
         *
         * groups.html will now detect the authenticated
         * session and display Administrator Mode.
         */
        window.location.href = "groups.html";
      } catch (error) {
        console.error("Administrator login failed:", error);

        /**
         * Show friendly error inside the page.
         */
        errorBox.textContent =
          error.message ||
          "Unable to sign in. Please check the email and password.";

        errorBox.hidden = false;
      } finally {
        /**
         * Restore button if redirect did not occur.
         */
        submitButton.disabled = false;

        submitButton.textContent = "Sign in";
      }
    },
  );
}

/**
 * Start the login page.
 */
init();
