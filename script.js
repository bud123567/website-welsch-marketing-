(() => {
  'use strict';

  const body = document.body;

  const offerBanner = document.querySelector('.offer-banner');
  const offerPause = document.querySelector('.offer-banner__pause');
  if (offerBanner && offerPause) {
    offerPause.addEventListener('click', () => {
      const paused = offerBanner.classList.toggle('is-paused');
      offerPause.setAttribute('aria-pressed', String(paused));
      offerPause.setAttribute('aria-label', paused ? 'Resume offer animation' : 'Pause offer animation');
      offerPause.firstElementChild.textContent = paused ? '▶' : 'Ⅱ';
    });
  }



  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  const setNavOpen = (open) => {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navMenu.classList.toggle('show', open);
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const currentlyOpen = navToggle.getAttribute('aria-expanded') === 'true';
      setNavOpen(!currentlyOpen);
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setNavOpen(false));
    });

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!navMenu.contains(target) && !navToggle.contains(target)) {
        setNavOpen(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setNavOpen(false);
    });
  }

  const embed = document.querySelector('.site-embed');
  const embedTitle = document.querySelector('.site-embed__title');
  const embedFrame = document.querySelector('.site-embed__frame');
  const embedOpenLink = document.querySelector('.site-embed__open');
  const embedCloseBtn = document.querySelector('.site-embed__close');

  const toast = document.querySelector('.notification-toast');
  const toastThumb = document.querySelector('.notification-thumb');
  const toastTitle = document.querySelector('.notification-title');
  const toastSub = document.querySelector('.notification-sub');

  let toastTimer = null;
  let lastFocusedElement = null;

  const showToast = (title, subtitle, thumbUrl) => {
    if (!toast) return;
    if (toastTitle) toastTitle.textContent = title;
    if (toastSub) toastSub.textContent = subtitle;
    if (toastThumb && thumbUrl) {
      toastThumb.style.backgroundImage = `url("${thumbUrl}")`;
    }

    toast.classList.add('show');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('show');
    }, 1800);
  };

  const closeEmbed = () => {
    if (!embed || !embedFrame) return;
    embed.classList.remove('is-open');
    embed.setAttribute('aria-hidden', 'true');
    body.classList.remove('embed-open');

    window.setTimeout(() => {
      embedFrame.setAttribute('src', '');
    }, 150);

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
  };

  const openEmbed = (card) => {
    if (!embed || !embedFrame || !embedTitle || !embedOpenLink) return;

    const link = card.getAttribute('data-link') || '';
    const embedUrl = card.getAttribute('data-embed') || link;
    const title = card.getAttribute('data-title') || 'Project demo';
    const thumb = card.querySelector('img');

    if (!embedUrl) {
      if (link) window.open(link, '_blank', 'noopener');
      return;
    }

    lastFocusedElement = document.activeElement;

    embedTitle.textContent = title;
    embedOpenLink.setAttribute('href', link || embedUrl);
    embedFrame.setAttribute('src', embedUrl);

    embed.classList.add('is-open');
    embed.setAttribute('aria-hidden', 'false');
    body.classList.add('embed-open');

    showToast('Opening project', 'Expanding preview...', thumb ? thumb.getAttribute('src') : '');

    if (embedCloseBtn instanceof HTMLElement) embedCloseBtn.focus();
  };

  if (embed && embedFrame && embedOpenLink) {
    const projectCards = document.querySelectorAll('.project-card[data-link], .project-card[data-embed]');

    projectCards.forEach((card) => {
      if (!(card instanceof HTMLElement)) return;

      card.addEventListener('click', () => openEmbed(card));

      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openEmbed(card);
        }
      });
    });

    if (embedCloseBtn) embedCloseBtn.addEventListener('click', closeEmbed);

    embed.addEventListener('click', (event) => {
      if (event.target === embed) closeEmbed();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && embed.classList.contains('is-open')) {
        closeEmbed();
      }
    });
  }

  const heroInner = document.querySelector('.hero-inner');
  const servicesSection = document.getElementById('services');
  const servicesPanel = document.querySelector('.services-panel');

  if (heroInner && servicesSection && servicesPanel && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        const expanded = entry.intersectionRatio >= 0.25;
        servicesPanel.classList.toggle('services-panel--expanded', expanded);
        heroInner.classList.toggle('hero-inner--shrink', entry.intersectionRatio >= 0.2);
      },
      {
        threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.75, 1],
      }
    );

    observer.observe(servicesSection);
  }

  const progressBar = document.querySelector('.scroll-progress__bar');
  if (
    progressBar instanceof HTMLElement &&
    progressBar.parentElement instanceof HTMLElement &&
    window.getComputedStyle(progressBar.parentElement).display !== 'none'
  ) {
    let progressRaf = 0;

    const updateProgress = () => {
      progressRaf = 0;
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      progressBar.style.width = `${Math.min(100, Math.max(0, progress)).toFixed(2)}%`;
    };

    const scheduleProgress = () => {
      if (!progressRaf) progressRaf = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', scheduleProgress, { passive: true });
    window.addEventListener('resize', scheduleProgress);
  }

  const cursorDrop = document.querySelector('.cursor-drop');
  if (cursorDrop instanceof HTMLElement) {
    const desktopMouse = window.matchMedia('(min-width: 961px) and (hover: hover) and (pointer: fine)');
    let trackingEnabled = false;
    let rafId = 0;
    let pointerX = 0;
    let pointerY = 0;

    const renderCursor = () => {
      rafId = 0;
      cursorDrop.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
      cursorDrop.style.opacity = '1';
    };

    const moveCursor = (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!rafId) rafId = window.requestAnimationFrame(renderCursor);
    };

    const hideCursor = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      cursorDrop.style.opacity = '0';
    };

    const setTracking = (enabled) => {
      if (enabled === trackingEnabled) return;
      trackingEnabled = enabled;

      if (enabled) {
        cursorDrop.style.display = '';
        window.addEventListener('pointermove', moveCursor);
        window.addEventListener('pointerdown', moveCursor);
        window.addEventListener('pointerleave', hideCursor);
        window.addEventListener('blur', hideCursor);
      } else {
        window.removeEventListener('pointermove', moveCursor);
        window.removeEventListener('pointerdown', moveCursor);
        window.removeEventListener('pointerleave', hideCursor);
        window.removeEventListener('blur', hideCursor);
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
        cursorDrop.style.opacity = '0';
        cursorDrop.style.display = 'none';
      }
    };

    setTracking(desktopMouse.matches);

    const handleMediaChange = (event) => {
      setTracking(event.matches);
    };

    if (typeof desktopMouse.addEventListener === 'function') {
      desktopMouse.addEventListener('change', handleMediaChange);
    } else {
      desktopMouse.addListener(handleMediaChange);
    }
  }

  const typeformSection = document.getElementById('start-project');
  const typeformTarget = document.querySelector('.typeform-embed [data-tf-live]');
  if (typeformSection && typeformTarget) {
    let typeformRequested = false;

    const loadTypeform = () => {
      if (typeformRequested) return;
      typeformRequested = true;

      const script = document.createElement('script');
      script.src = 'https://embed.typeform.com/next/embed.js';
      script.async = true;
      document.body.appendChild(script);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          if (!entries[0]?.isIntersecting) return;
          loadTypeform();
          obs.disconnect();
        },
        { rootMargin: '320px 0px' }
      );

      observer.observe(typeformSection);
    } else {
      loadTypeform();
    }
  }
})();
