const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.getElementById("nav-menu");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }),
  );
}

const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const carousel = document.querySelector(".rooms-carousel");
if (carousel) {
  const track = carousel.querySelector(".carousel-track");
  const cards = Array.from(carousel.querySelectorAll(".room-card"));
  const prevBtn = carousel.querySelector('[data-dir="prev"]');
  const nextBtn = carousel.querySelector('[data-dir="next"]');
  const windowEl = carousel.querySelector(".carousel-window");
  let activeIndex = 0;

  const getGap = () => {
    const gap = getComputedStyle(track).columnGap || getComputedStyle(track).gap;
    return parseFloat(gap) || 0;
  };

  const centerActive = () => {
    const gap = getGap();
    const containerWidth = windowEl.offsetWidth;
    const activeCard = cards[activeIndex];
    if (!activeCard) return;

    const beforeWidth = cards.slice(0, activeIndex).reduce((sum, card) => sum + card.offsetWidth, 0);
    const halfSpace = Math.max(0, (containerWidth - activeCard.offsetWidth) / 2);
    const offset = beforeWidth + gap * activeIndex - halfSpace;
    const maxOffset = Math.max(0, track.scrollWidth - containerWidth + halfSpace);
    const clampedOffset = Math.min(Math.max(offset, -halfSpace), maxOffset);

    track.style.transform = `translateX(-${clampedOffset}px)`;
    cards.forEach((card, idx) => card.classList.toggle("active", idx === activeIndex));
  };

  prevBtn.addEventListener("click", () => {
    activeIndex = (activeIndex - 1 + cards.length) % cards.length;
    centerActive();
  });

  nextBtn.addEventListener("click", () => {
    activeIndex = (activeIndex + 1) % cards.length;
    centerActive();
  });

  window.addEventListener("resize", centerActive);
  centerActive();
}

const navbar = document.querySelector(".navbar");
const toggleNavScrollState = () => {
  if (!navbar) return;
  navbar.classList.toggle("scrolled", window.scrollY > 10);
};

toggleNavScrollState();
window.addEventListener("scroll", toggleNavScrollState, { passive: true });

const resovaWrapper = document.getElementById("resova-wrapper");
if (resovaWrapper) {
  const loadResovaWidget = () => {
    if (document.getElementById("resova-pi")) return;
    const src = resovaWrapper.dataset.widgetSrc;
    if (!src) return;

    const script = document.createElement("script");
    script.id = "resova-pi";
    script.src = src;
    document.body.appendChild(script);
  };

  const bookingSection = resovaWrapper.closest(".booking-info") || resovaWrapper;
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (!entries[0]?.isIntersecting) return;
        loadResovaWidget();
        obs.disconnect();
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(bookingSection);
  } else {
    loadResovaWidget();
  }
}
