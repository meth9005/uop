import { el } from "../utils/dom.js";
import { iconMarkup } from "../utils/icons.js";
import { initSiteAnimations } from "../utils/animations.js";

/** Shared, keyboard-accessible navigation. */
export function renderNavbar(activePage = "") {
  const mount = document.getElementById("site-header");
  if (!mount) return;

  const links = [
    ["home", "Home", "index.html"],
    ["projects", "Projects", "projects.html"],
    ["groups", "Groups", "groups.html"],
    ["categories", "Categories", "categories.html"],
    ["about", "About", "about.html"],
  ];

  mount.innerHTML = `
        <a class="skip-link" href="#main-content">Skip to content</a>
        <header class="site-navigation" id="site-navigation">
            <div class="navigation-inner">
                <a href="index.html" class="site-brand" aria-label="English Teaching Unit home">
                    <span class="site-brand-mark">
                        <img src="assets/images/uoplogo.png" alt="" width="48" height="48">
                    </span>
                    <span class="site-brand-text">
                        <strong>English Teaching Unit</strong>
                        <small>Faculty of Engineering · University of Peradeniya</small>
                    </span>
                </a>

                <nav class="desktop-navigation" aria-label="Primary navigation"></nav>

                <button id="mobile-menu-btn" class="menu-toggle" type="button"
                    aria-expanded="false" aria-controls="mobile-menu" aria-label="Open navigation">
                    <span>Menu</span>
                    <span class="menu-toggle-icon">${iconMarkup("menu", { size: 20 })}</span>
                </button>
            </div>

            <nav id="mobile-menu" class="mobile-navigation" aria-label="Mobile navigation" hidden></nav>
        </header>
    `;

  for (const nav of mount.querySelectorAll("nav")) {
    links.forEach(([page, label, href]) => {
      nav.append(
        el("a", {
          className: "navigation-link",
          text: label,
          attrs: {
            href,
            "aria-current": page === activePage ? "page" : null,
          },
        }),
      );
    });
  }

  const main = document.querySelector("main");
  if (main) {
    main.id = "main-content";
    main.tabIndex = -1;
  }

  const header = mount.querySelector("#site-navigation");
  const button = mount.querySelector("#mobile-menu-btn");
  const menu = mount.querySelector("#mobile-menu");
  const icon = button.querySelector(".menu-toggle-icon");

  const setOpen = (open) => {
    menu.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    icon.innerHTML = iconMarkup(open ? "close" : "menu", { size: 20 });
    header.classList.toggle("menu-open", open);
  };

  button.addEventListener("click", () => setOpen(menu.hidden));

  mount.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      setOpen(false);
      button.focus();
    }
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  const onScroll = () =>
    header.classList.toggle("is-scrolled", window.scrollY > 14);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  initSiteAnimations();
}
