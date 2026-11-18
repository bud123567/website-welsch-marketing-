(() => {
  "use strict";
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  const setNavOpen = (open) => {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navMenu.classList.toggle("show", open);
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const currentlyOpen = navToggle.getAttribute("aria-expanded") === "true";
      setNavOpen(!currentlyOpen);
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!navMenu.contains(target) && !navToggle.contains(target)) {
        setNavOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setNavOpen(false);
    });
  }

  const typeformSection = document.getElementById("start-project");
  const typeformTarget = document.querySelector(
    ".typeform-embed [data-tf-live]",
  );
  if (typeformSection && typeformTarget) {
    let typeformRequested = false;

    const loadTypeform = () => {
      if (typeformRequested) return;
      typeformRequested = true;

      const script = document.createElement("script");
      script.src = "https://embed.typeform.com/next/embed.js";
      script.async = true;
      document.body.appendChild(script);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          if (!entries[0]?.isIntersecting) return;
          loadTypeform();
          obs.disconnect();
        },
        { rootMargin: "320px 0px" },
      );

      observer.observe(typeformSection);
    } else {
      loadTypeform();
    }
  }
})();
