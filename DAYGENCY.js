// Smooth anchor scrolling
const smoothScrollLinks = document.querySelectorAll('[data-scroll], a[href^="#"]');
smoothScrollLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('data-scroll') || link.getAttribute('href');
    if (!targetId || !targetId.startsWith('#')) {
      return;
    }
    let section = document.querySelector(targetId);
    if (section && window.getComputedStyle(section).display === 'none') {
      const fallbackId = link.getAttribute('data-fallback');
      if (fallbackId) {
        const fallback = document.querySelector(fallbackId);
        if (fallback) {
          section = fallback;
        }
      }
    }
    if (!section) {
      return;
    }
    event.preventDefault();
    section.scrollIntoView({ behavior: 'smooth' });
  });
});

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const createEmbedUrl = (baseUrl, autoplay = false) => {
  const url = baseUrl.includes('playsinline=') ? baseUrl : `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}playsinline=1`;
  return autoplay ? `${url}&autoplay=1&mute=1` : url;
};

const loadLazyEmbed = (container, { autoplay = false } = {}) => {
  if (!container || container.dataset.loaded === 'true') {
    return container?.querySelector('iframe') || null;
  }

  const src = container.dataset.embedSrc;
  if (!src) return null;

  const frame = document.createElement('iframe');
  frame.src = createEmbedUrl(src, autoplay);
  frame.title = container.dataset.embedTitle || 'Embedded video';
  frame.loading = 'lazy';
  frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.allowFullscreen = true;

  const trigger = container.querySelector('.lazy-embed__button');
  if (trigger) {
    trigger.replaceWith(frame);
  } else {
    container.appendChild(frame);
  }

  container.dataset.loaded = 'true';
  container.classList.add('is-loaded');
  return frame;
};

document.querySelectorAll('.lazy-embed').forEach((container) => {
  const trigger = container.querySelector('.lazy-embed__button');
  if (!trigger) return;

  trigger.addEventListener('click', () => {
    loadLazyEmbed(container);
  });
});

// Shorts carousel: center and enlarge the active card, load the video only on demand
document.querySelectorAll('.shorts-carousel').forEach((carousel) => {
  const track = carousel.querySelector('.shorts-track');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.shorts-card'));
  if (!cards.length) return;

  const getEmbed = (card) => card.querySelector('.lazy-embed');
  const loadCard = (card) => {
    const embed = getEmbed(card);
    if (embed) loadLazyEmbed(embed);
  };

  const centerCard = (card, smooth = true) => {
    const trackRect = track.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const delta = (cardRect.left + cardRect.width / 2) - (trackRect.left + trackRect.width / 2);
    track.scrollBy({ left: delta, behavior: smooth ? 'smooth' : 'auto' });
  };

  let activeIndex = Math.min(1, cards.length - 1); // default to middle (2nd) card
  const activate = (index, smooth = true) => {
    if (index < 0 || index >= cards.length) return;
    if (index === activeIndex) return;
    const prev = cards[activeIndex];
    prev && prev.classList.remove('shorts-card--active');

    activeIndex = index;
    const next = cards[activeIndex];
    if (!next) return;
    next.classList.add('shorts-card--active');
    centerCard(next, smooth);
  };

  // Initialize with the center card active
  cards[activeIndex].classList.add('shorts-card--active');
  // Ensure it's centered on load
  window.addEventListener('load', () => centerCard(cards[activeIndex], false));

  // Interactions: hover/focus/tap/click to activate a card, click/Enter to load it
  cards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => activate(i, true));
    card.addEventListener('focusin', () => activate(i, true));
    card.addEventListener('click', () => {
      activate(i, true);
      loadCard(card);
    });
    card.addEventListener('touchstart', () => activate(i, true), { passive: true });
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      activate(i, true);
      loadCard(card);
    });
  });

  // After manual scroll, snap to and activate the nearest card
  let scrollTimer;
  track.addEventListener('scroll', () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      const centerX = track.getBoundingClientRect().left + track.clientWidth / 2;
      let best = activeIndex;
      let bestDist = Infinity;
      cards.forEach((c, idx) => {
        const r = c.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const d = Math.abs(cx - centerX);
        if (d < bestDist) { bestDist = d; best = idx; }
      });
      if (best !== activeIndex) activate(best, true);
    }, 120);
  });
});

// Blur the hero ONLY while the next section (#shorts) is on screen.
// Fade the blur out smoothly when returning to the hero.
(() => {
  const hero = document.querySelector('.hero');
  const next = document.getElementById('shorts');
  if (!hero || !next) return;

  let blurActive = false;
  let nextOnScreen = false;
  let heroStronglyVisible = true; // start at top: hero is dominant

  const apply = () => {
    const shouldBlur = nextOnScreen && !heroStronglyVisible;
    if (shouldBlur === blurActive) return;
    blurActive = shouldBlur;
    hero.classList.toggle('is-blurred', blurActive);
  };

  const updateByRects = () => {
    const nr = next.getBoundingClientRect();
    const hr = hero.getBoundingClientRect();
    nextOnScreen = nr.top < window.innerHeight && nr.bottom > 0;
    heroStronglyVisible = (hr.top <= 0 && hr.bottom >= window.innerHeight * 0.6) ||
                          (hr.top >= 0 && hr.bottom <= window.innerHeight * 1.1);
    apply();
  };

  if ('IntersectionObserver' in window) {
    const nextObs = new IntersectionObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      nextOnScreen = e.isIntersecting;
      apply();
    }, { threshold: 0.1 });
    nextObs.observe(next);

    const heroObs = new IntersectionObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      heroStronglyVisible = e.intersectionRatio >= 0.55;
      apply();
    }, { threshold: [0, 0.25, 0.55, 0.75, 1] });
    heroObs.observe(hero);

    // Set initial state on load/refresh.
    updateByRects();
  } else {
    // Fallback for very old browsers
    window.addEventListener('scroll', updateByRects, { passive: true });
    window.addEventListener('resize', updateByRects);
    updateByRects();
  }
})();

const bookingFrame = document.querySelector('.booking-embed iframe[data-src]');
if (bookingFrame) {
  const loadBookingFrame = () => {
    if (bookingFrame.getAttribute('src')) return;
    const src = bookingFrame.dataset.src;
    if (src) bookingFrame.setAttribute('src', src);
  };

  const bookingSection = bookingFrame.closest('#booking') || bookingFrame.closest('.booking');
  if (bookingSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (!entries[0]?.isIntersecting) return;
        loadBookingFrame();
        obs.disconnect();
      },
      { rootMargin: '320px 0px' }
    );

    observer.observe(bookingSection);
  } else {
    loadBookingFrame();
  }
}

// Ultra-hidden Daygency easter egg
(() => {
  const logo = document.querySelector('.logo');
  if (!logo) return;

  // Step 1: triple-click the logo quickly to arm the secret
  let rapidClicks = 0;
  let lastClickAt = 0;
  let armedUntil = 0;
  const clickGapMs = 800; // max gap between each of the 3 clicks
  const armWindowMs = 10000; // time window to finish the next step once armed

  logo.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastClickAt > clickGapMs) rapidClicks = 0;
    rapidClicks += 1;
    lastClickAt = now;
    if (rapidClicks >= 3) {
      rapidClicks = 0;
      armedUntil = now + armWindowMs;
      keyBuffer.length = 0;
    }
  });

  // Step 2 (while armed): type the secret token "LEADS7"
  const keyBuffer = [];
  const targetCodes = [76, 69, 65, 68, 83, 55]; // "LEADS7"

  const onKey = (ev) => {
    if (Date.now() > armedUntil) return;
    const k = ev.key;
    if (!k || k.length !== 1) return;
    const code = k.toUpperCase().charCodeAt(0);
    if (Number.isNaN(code)) return;
    keyBuffer.push(code);
    if (keyBuffer.length > targetCodes.length) keyBuffer.shift();
    let matches = true;
    for (let i = 0; i < targetCodes.length; i++) {
      if (keyBuffer[i] !== targetCodes[i]) { matches = false; break; }
    }
    if (matches) {
      // disarm and celebrate
      armedUntil = 0;
      keyBuffer.length = 0;
      revealEgg();
    }
  };

  window.addEventListener('keydown', onKey);

  function revealEgg() {
    const overlay = document.createElement('div');
    overlay.className = 'egg-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Daygency Lead Surge');

    overlay.innerHTML = `
      <div class="egg-card">
        <button class="egg-close" aria-label="Close">×</button>
        <img src="media/DAYGENCY .png" alt="" class="egg-logo" />
        <h3>Lead Surge Unlocked</h3>
        <p>Hungry, ready-to-buy leads in <strong>7 days</strong>.</p>
      </div>
    `;

    document.body.appendChild(overlay);

    // Confetti sprinkles (respect reduced motion)
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      for (let i = 0; i < 36; i++) {
        const piece = document.createElement('span');
        piece.className = 'egg-bit';
        piece.style.setProperty('--x', Math.random().toFixed(3));
        piece.style.setProperty('--d', `${2000 + Math.floor(Math.random() * 2200)}ms`);
        piece.style.setProperty('--r', `${Math.floor(Math.random() * 360)}deg`);
        piece.style.setProperty('--h', `${40 + Math.floor(Math.random() * 60)}`);
        overlay.appendChild(piece);
      }
    }

    const close = () => {
      overlay.classList.add('egg-hide');
      overlay.addEventListener('animationend', () => overlay.remove(), { once: true });
    };

    overlay.querySelector('.egg-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); }, { once: true });
    overlay.querySelector('.egg-close').focus({ preventScroll: true });
  }
  // Minimal debug hook for verification in console
  window.__daygencyEgg = {
    reveal: () => revealEgg(),
    arm: () => { armedUntil = Date.now() + 60000; keyBuffer.length = 0; }
  };
})();
