document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  if (!body) return;

  body.classList.add('js-enabled');

  const header = document.querySelector('header');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('#primary-nav');
  const navClose = document.querySelector('.nav-close');

  const setNavState = (open) => {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    navMenu.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('nav-open', open);
  };

  const toggleNav = () => {
    if (!navToggle) return;
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    setNavState(!isOpen);
  };

  if (navToggle) {
    navToggle.addEventListener('click', toggleNav);
  }

  if (navClose) {
    navClose.addEventListener('click', () => setNavState(false));
  }

  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  const scrollToHash = (hash) => {
    const target = document.querySelector(hash);
    if (!target) return;

    const headerOffset = header ? header.offsetHeight - 2 : 0;
    const targetTop = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    });
  };

  const handleAnchorClick = (event) => {
    const link = event.currentTarget;
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    if (!document.querySelector(hash)) return;

    event.preventDefault();

    if (body.classList.contains('nav-open')) {
      setNavState(false);
    }

    scrollToHash(hash);
  };

  anchorLinks.forEach((link) => {
    link.addEventListener('click', handleAnchorClick);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && body.classList.contains('nav-open')) {
      setNavState(false);
    }
  });

  const handleScroll = () => {
    if (!header) return;
    if (window.scrollY > 10) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  const animatedSections = document.querySelectorAll('.fade-in-up');
  let observeGalleryItem = (item) => {
    if (item) {
      item.classList.add('is-visible');
    }
  };

  const revealNow = () => {
    animatedSections.forEach((section) => section.classList.add('is-visible'));
    document.querySelectorAll('.gallery__item').forEach((item) => item.classList.add('is-visible'));
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          if (entry.target.classList.contains('gallery__item')) {
            entry.target.classList.add('is-visible');
          } else {
            entry.target.classList.add('is-visible');
          }

          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -10%',
      }
    );

    animatedSections.forEach((section) => observer.observe(section));
    document.querySelectorAll('.gallery__item').forEach((item) => observer.observe(item));

    observeGalleryItem = (item) => {
      if (!item) return;
      observer.observe(item);
    };
  } else {
    revealNow();
  }

  const initGallerySlider = () => {
    const track = document.querySelector('.gallery__track');
    const prevBtn = document.querySelector('.gallery__control--prev');
    const nextBtn = document.querySelector('.gallery__control--next');

    if (!track || !prevBtn || !nextBtn) return null;

    if (track.dataset.sliderReady === 'true' && track.__sliderControls) {
      track.__sliderControls.refresh();
      return track.__sliderControls;
    }

    const getStepSize = () => {
      const firstRealItem =
        track.querySelector('.gallery__item:not(.gallery__item--placeholder)') ||
        track.querySelector('.gallery__item');
      if (!firstRealItem) return track.clientWidth;
      const gap = parseFloat(window.getComputedStyle(track).gap || '0');
      return firstRealItem.getBoundingClientRect().width + gap;
    };

    const updateControls = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      const epsilon = 2;

      const items = track.querySelectorAll('.gallery__item:not(.gallery__item--placeholder)');
      const hasScrollableContent = items.length > 1 && maxScroll > epsilon;

      prevBtn.disabled = !hasScrollableContent || track.scrollLeft <= epsilon;
      nextBtn.disabled = !hasScrollableContent || track.scrollLeft >= maxScroll - epsilon;
      track.classList.toggle('is-scrollable', hasScrollableContent);
    };

    const scrollByStep = (direction) => {
      const step = getStepSize();
      track.scrollBy({
        left: step * direction,
        behavior: 'smooth',
      });
    };

    prevBtn.addEventListener('click', () => scrollByStep(-1));
    nextBtn.addEventListener('click', () => scrollByStep(1));

    track.addEventListener(
      'wheel',
      (event) => {
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        event.preventDefault();
        track.scrollBy({
          left: event.deltaY,
        });
      },
      { passive: false }
    );

    track.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', updateControls);

    requestAnimationFrame(updateControls);

    const controls = {
      refresh: () => updateControls(),
      scrollNext: () => scrollByStep(1),
      scrollPrev: () => scrollByStep(-1),
    };

    track.dataset.sliderReady = 'true';
    track.__sliderControls = controls;

    return controls;
  };

  let registerGalleryItem = () => {};

  const initGalleryLightbox = () => {
    const lightbox = document.querySelector('.lightbox');
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector('.lightbox__img');
    const lightboxCaption = lightbox.querySelector('.lightbox__caption');
    const prevBtn = lightbox.querySelector('.lightbox__prev');
    const nextBtn = lightbox.querySelector('.lightbox__next');
    const closeBtn = lightbox.querySelector('.lightbox__close');

    let items = [];
    let currentIndex = 0;
    const boundItems = new WeakSet();

    const refreshItems = () => {
      items = Array.from(document.querySelectorAll('.gallery__item:not(.gallery__item--placeholder)'));
      items.forEach((item) => {
        if (boundItems.has(item)) return;
        boundItems.add(item);
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', 'Bild öffnen');

        item.addEventListener('click', () => {
          const index = items.indexOf(item);
          if (index !== -1) {
            openLightbox(index);
          }
        });

        item.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const index = items.indexOf(item);
            if (index !== -1) {
              openLightbox(index);
            }
          }
        });
      });
    };

    const updateLightbox = () => {
      if (!items.length) return;
      const currentItem = items[currentIndex]?.querySelector('img');
      if (!currentItem) return;

      const fullSrc = currentItem.getAttribute('data-full') || currentItem.src;
      lightboxImg.src = fullSrc;
      lightboxImg.alt = currentItem.alt || '';

      const caption = items[currentIndex]?.querySelector('figcaption');
      if (lightboxCaption) {
        const captionText = caption ? caption.textContent.trim() : '';
        lightboxCaption.textContent = captionText;
        lightboxCaption.classList.toggle('is-hidden', !captionText);
      }
    };

    const openLightbox = (index) => {
      refreshItems();
      if (!items.length) return;
      currentIndex = Math.min(Math.max(index, 0), items.length - 1);
      updateLightbox();
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImg.src = '';
      lightboxImg.alt = '';
      if (lightboxCaption) {
        lightboxCaption.textContent = '';
        lightboxCaption.classList.add('is-hidden');
      }
      body.style.overflow = '';
    };

    const stepLightbox = (direction) => {
      refreshItems();
      if (!items.length) return;
      currentIndex = (currentIndex + direction + items.length) % items.length;
      updateLightbox();
    };

    lightbox.setAttribute('aria-hidden', 'true');
    refreshItems();

    prevBtn?.addEventListener('click', () => stepLightbox(-1));
    nextBtn?.addEventListener('click', () => stepLightbox(1));
    closeBtn?.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('open')) return;

      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepLightbox(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepLightbox(1);
      }
    });

    registerGalleryItem = () => {
      refreshItems();
    };
  };

  initGallerySlider();
  initGalleryLightbox();

  if (window.location.hash) {
    setTimeout(() => {
      scrollToHash(window.location.hash);
    }, 200);
  }

});
