/* =========================================================
   Frame Hashira portfolio — single-page script
   Edit ONLY the CONFIG block below to change links/videos.
   ========================================================= */

const CONFIG = {
  // X (Twitter) NUMERIC user ID — needed for the DM link to target you.
  // Leave '' until you have it; the form then copies the message and opens your profile.
  xUserId: '',
  xHandle: 'framehashira',
  xName: 'Frame Hashira',

  links: {
    x: 'https://x.com/framehashira',
    instagram: 'https://www.instagram.com/theframehashira',
    youtube: 'https://www.youtube.com/@JafarOn-chain',
    linkedin: 'https://www.linkedin.com/in/jafar-umoru-37415b242/',
    github: 'https://github.com/samuraihighlord',
  },

  // Home-page windows. id = number after /status/ in the X link.
  // thumb (optional) = a screenshot/thumbnail you put in assets/thumbs/,
  // shown on the fallback card when X's embed can't load.
  windows: {
    'short-films': {
      title: 'Short Films',
      posts: [{ id: '2115579653490389138', thumb: '' }, { id: '2075907649288196427', thumb: '' }],
    },
    'product-ads': {
      title: 'Product Ads',
      posts: [{ id: '2094068114543534120', thumb: '' }, { id: '2069728870207459395', thumb: '' }],
    },
    'clips': {
      title: 'Clips',
      posts: [{ id: '2083076117376754055', thumb: '' }, { id: '2110678605625794732', thumb: '' }],
    },
    'ai-videos': {
      title: 'AI Videos',
      posts: [{ id: '2105260715951129054', thumb: '' }, { id: '2038956754877194412', thumb: '' }],
    },
    'not-just-cuts': {
      title: 'Not Just Cuts',
      text: 'Where the edits meet the code. Scripts, tools and experiments.',
      button: { label: 'Open GitHub →', linkKey: 'github' },
    },
  },
};

const isDesktop = () => window.matchMedia('(min-width: 721px)').matches;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Small safe wrappers for localStorage (may be unavailable) ---------- */
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (_) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) { /* ignore */ } },
  del(k) { try { localStorage.removeItem(k); } catch (_) { /* ignore */ } },
};

/* ---------- X widgets loader ---------- */
// Loads platform.x.com/widgets.js once. Rejects if blocked (ad blockers, strict hosts).
let twttrPromise = null;
function loadXWidgets() {
  if (twttrPromise) return twttrPromise;
  twttrPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.id = 'twitter-wjs';
    s.async = true;
    s.src = 'https://platform.x.com/widgets.js';
    s.onload = () => (window.twttr && window.twttr.ready ? window.twttr.ready(resolve) : reject());
    s.onerror = reject;
    document.head.appendChild(s);
    setTimeout(reject, 8000); // give up quietly; fallback cards stay
  });
  return twttrPromise;
}

/* ---------- Fallback "X-style" post card (shown until/unless the real embed loads) ---------- */
function postCard(post, index) {
  const url = `https://x.com/${CONFIG.xHandle}/status/${post.id}`;
  const media = post.thumb
    ? `<img class="xcard__thumb" src="${post.thumb}" alt="" />`
    : `<div class="xcard__thumb xcard__thumb--empty"></div>`;
  return `
    <a class="xcard" href="${url}" target="_blank" rel="noopener">
      <div class="xcard__head">
        <span class="xcard__avatar">FH</span>
        <span class="xcard__who"><b>${CONFIG.xName}</b><small>@${CONFIG.xHandle}</small></span>
        <svg class="xcard__logo" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.6l5.24 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z"/></svg>
      </div>
      <div class="xcard__media">${media}<span class="xcard__play">▶</span></div>
      <span class="xcard__cta">Watch video ${index + 1} on X</span>
    </a>`;
}

/* ---------- Home: pop-up windows ---------- */
function initWindows() {
  const win = document.getElementById('window');
  const titleEl = win.querySelector('.window__title');
  const bodyEl = win.querySelector('.window__body');
  const backdrop = document.getElementById('window-backdrop');

  function closeWindow() {
    win.hidden = true;
    backdrop.hidden = true;
    bodyEl.innerHTML = ''; // removing embeds stops any playing video
    document.documentElement.classList.remove('no-scroll');
  }

  function openWindow(key) {
    const cfg = CONFIG.windows[key];
    if (!cfg) return;
    titleEl.textContent = cfg.title;
    bodyEl.innerHTML = '';
    win.style.left = win.style.top = '';
    win.hidden = false;
    backdrop.hidden = false;
    document.documentElement.classList.add('no-scroll'); // lock page scroll while open

    if (cfg.text) {
      // Text + button window (Not Just Cuts)
      const url = CONFIG.links[cfg.button.linkKey];
      bodyEl.innerHTML = `<p class="window__text">${cfg.text}</p>` +
        (url ? `<a class="window__btn" href="${url}" target="_blank" rel="noopener">${cfg.button.label}</a>` : '');
      return;
    }

    // Video window: X-style card per post, replaced by the real X embed when it loads
    cfg.posts.forEach((post, i) => {
      const slot = document.createElement('div');
      slot.className = 'window__post';
      slot.innerHTML = postCard(post, i);
      bodyEl.appendChild(slot);
    });

    loadXWidgets()
      .then((twttr) => {
        bodyEl.querySelectorAll('.window__post').forEach((slot, i) => {
          const holder = document.createElement('div');
          slot.appendChild(holder);
          twttr.widgets
            .createTweet(cfg.posts[i].id, holder, { theme: 'dark', conversation: 'none', align: 'center', dnt: true })
            .then((el) => { if (el) slot.querySelector('.xcard')?.remove(); });
        });
      })
      .catch(() => { /* embed blocked: X-style cards stay */ });
  }

  document.querySelectorAll('[data-window]').forEach((btn) =>
    btn.addEventListener('click', (e) => {
      openWindow(btn.dataset.window);
    })
  );
  win.querySelector('.window__close').addEventListener('click', closeWindow);
  backdrop.addEventListener('click', closeWindow);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !win.hidden) closeWindow(); });

  // Drag the window by its title bar (desktop)
  const bar = win.querySelector('.window__bar');
  bar.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.window__close') || !isDesktop()) return;
    const r = win.getBoundingClientRect();
    const dx = e.clientX - r.left, dy = e.clientY - r.top;
    const move = (ev) => { win.style.left = `${ev.clientX - dx}px`; win.style.top = `${ev.clientY - dy}px`; };
    const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  });
}

/* ---------- Draggable icons (home, about photo, contact socials) ----------
   Two modes:
   - "absolute" (desktop, free-floating icons): position stored as --x/--y % of the area.
   - "offset"  (phones, and .draggable--offset elements): moved with --dx/--dy px from
     their normal place, so layouts that flow (grids, columns) still work.
   Mouse/pen: drag after moving 6px. Touch: press and hold ~0.3s, then drag
   (a quick swipe still scrolls the page). Positions are remembered per browser. */
function initDraggables() {
  const els = [...document.querySelectorAll('.draggable')];

  const modeOf = (el) => (isDesktop() && !el.classList.contains('draggable--offset') ? 'abs' : 'off');
  const keyOf = (el, mode) => `fh-${mode}-${el.id}`;

  // Remember original %-position for "tidy icons", then restore saved positions
  els.forEach((el) => {
    el.dataset.home = `${el.style.getPropertyValue('--x')},${el.style.getPropertyValue('--y')}`;
    const abs = store.get(keyOf(el, 'abs'));
    if (abs) { el.style.setProperty('--x', `${abs.x}%`); el.style.setProperty('--y', `${abs.y}%`); }
    const off = store.get(keyOf(el, 'off'));
    if (off) { el.style.setProperty('--dx', `${off.dx}px`); el.style.setProperty('--dy', `${off.dy}px`); }
  });

  // Begin a drag; returns {move(x,y), end()}
  function beginDrag(el, sx, sy) {
    const mode = modeOf(el);
    const area = el.closest('.drag-area');
    el.classList.add('is-dragging');
    let state;
    if (mode === 'abs') {
      const a = area.getBoundingClientRect(), r = el.getBoundingClientRect();
      state = { a, r, offX: sx - (r.left + r.width / 2), offY: sy - (r.top + r.height / 2) };
    } else {
      state = { dx0: parseFloat(el.style.getPropertyValue('--dx')) || 0, dy0: parseFloat(el.style.getPropertyValue('--dy')) || 0 };
    }
    return {
      move(x, y) {
        if (mode === 'abs') {
          const { a, r, offX, offY } = state;
          // clamp the centre so the icon stays inside its section
          const cx = Math.min(Math.max(x - offX - a.left, r.width / 2), a.width - r.width / 2);
          const cy = Math.min(Math.max(y - offY - a.top, r.height / 2), a.height - r.height / 2);
          el.style.setProperty('--x', `${(cx / a.width) * 100}%`);
          el.style.setProperty('--y', `${(cy / a.height) * 100}%`);
        } else {
          el.style.setProperty('--dx', `${state.dx0 + x - sx}px`);
          el.style.setProperty('--dy', `${state.dy0 + y - sy}px`);
        }
      },
      end() {
        el.classList.remove('is-dragging');
        el.dataset.dragEnd = Date.now();               // lets the click guard ignore the next click
        if (mode === 'abs') {
          store.set(keyOf(el, 'abs'), { x: parseFloat(el.style.getPropertyValue('--x')), y: parseFloat(el.style.getPropertyValue('--y')) });
        } else {
          store.set(keyOf(el, 'off'), { dx: parseFloat(el.style.getPropertyValue('--dx')) || 0, dy: parseFloat(el.style.getPropertyValue('--dy')) || 0 });
        }
      },
    };
  }

  els.forEach((el) => {
    // --- Mouse / pen ---
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      const sx = e.clientX, sy = e.clientY;
      let drag = null;
      el.setPointerCapture(e.pointerId);
      const move = (ev) => {
        if (!drag) {
          if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return; // still a click
          drag = beginDrag(el, sx, sy);
        }
        drag.move(ev.clientX, ev.clientY);
      };
      const up = () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        if (drag) drag.end();
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });

    // --- Touch: long-press to pick up, so normal swipes keep scrolling ---
    let timer = null, drag = null, sx = 0, sy = 0;
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
      timer = setTimeout(() => { drag = beginDrag(el, sx, sy); navigator.vibrate?.(15); }, 300);
    }, { passive: true });
    el.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (!drag) {
        if (Math.hypot(t.clientX - sx, t.clientY - sy) > 10) clearTimeout(timer); // it's a scroll
        return;
      }
      e.preventDefault();                               // stop the page scrolling while dragging
      drag.move(t.clientX, t.clientY);
    }, { passive: false });
    const touchEnd = () => { clearTimeout(timer); if (drag) { drag.end(); drag = null; } };
    el.addEventListener('touchend', touchEnd);
    el.addEventListener('touchcancel', touchEnd);
    el.addEventListener('contextmenu', (e) => e.preventDefault()); // no long-press menu
    el.addEventListener('dragstart', (e) => e.preventDefault());   // stop the browser's own image drag

    // --- Click guard: a drag must not open a window or follow a link ---
    el.addEventListener('click', (e) => {
      if (Date.now() - (+el.dataset.dragEnd || 0) < 400) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);
  });

  // "tidy icons": put every draggable in that section back
  document.querySelectorAll('[data-reset]').forEach((btn) =>
    btn.addEventListener('click', () => {
      document.getElementById(btn.dataset.reset).querySelectorAll('.draggable').forEach((el) => {
        store.del(keyOf(el, 'abs')); store.del(keyOf(el, 'off'));
        const [x, y] = el.dataset.home.split(',');
        if (x) el.style.setProperty('--x', x);
        if (y) el.style.setProperty('--y', y);
        el.style.removeProperty('--dx'); el.style.removeProperty('--dy');
      });
    })
  );
}

/* ---------- Scroll: nav highlight + enter/leave animations ---------- */
function initScroll() {
  const sections = [...document.querySelectorAll('.section')];
  const links = [...document.querySelectorAll('.nav a')];

  // Animate a section's .anim children in when it enters, out when it leaves
  const animObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => en.target.classList.toggle('is-in', en.isIntersecting));
  }, { threshold: 0.18 });
  sections.forEach((s) => animObs.observe(s));

  // Highlight the nav link for the section nearest the middle of the screen
  const navObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.toggleAttribute('aria-current', a.dataset.section === en.target.id));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach((s) => navObs.observe(s));

  // Nav clicks: smooth scroll (CSS scroll-behavior also covers plain #links)
  links.forEach((a) => a.addEventListener('click', (e) => {
    const target = document.getElementById(a.dataset.section);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
  }));
  document.querySelectorAll('.scroll-hint').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
  }));
}

/* ---------- About: 3D paper tilt on the cutout ---------- */
function initTilt() {
  const card = document.querySelector('.paper-cutout');
  if (!card || reducedMotion()) return;
  const wrap = card.parentElement;
  wrap.addEventListener('pointermove', (e) => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg) rotateZ(-2deg)`;
  });
  wrap.addEventListener('pointerleave', () => { card.style.transform = ''; });
}

/* ---------- Contact: social links + message → X DM ---------- */
function initContact() {
  document.querySelectorAll('[data-social]').forEach((a) => {
    const url = CONFIG.links[a.dataset.social];
    if (url) a.href = url; else a.hidden = true;
  });

  const form = document.getElementById('message-form');
  const textarea = form.querySelector('textarea');
  const status = document.getElementById('form-status');
  const sendLink = document.getElementById('send-link');

  // Official X DM deep link: recipient_id (required) + text (optional, URL-encoded)
  const buildUrl = (msg) => CONFIG.xUserId
    ? `https://x.com/messages/compose?recipient_id=${CONFIG.xUserId}&text=${encodeURIComponent(msg)}`
    : `https://x.com/${CONFIG.xHandle}`;

  textarea.addEventListener('input', () => { sendLink.href = buildUrl(textarea.value.trim()); });
  sendLink.addEventListener('click', async (e) => {
    const msg = textarea.value.trim();
    if (!msg) { e.preventDefault(); status.textContent = 'Type a message first.'; textarea.focus(); return; }
    sendLink.href = buildUrl(msg);
    if (CONFIG.xUserId) {
      status.textContent = 'Opening X… press Send there to deliver your message.';
    } else {
      try { await navigator.clipboard.writeText(msg); } catch (_) { /* clipboard blocked */ }
      status.textContent = 'Message copied. Paste it into a DM on my X profile.';
    }
  });
  form.addEventListener('submit', (e) => e.preventDefault());
}

document.addEventListener('DOMContentLoaded', () => {
  initScroll();
  initWindows();
  initDraggables();
  initTilt();
  initContact();
});
