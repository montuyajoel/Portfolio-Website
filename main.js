/* ===================================================
   PORTFOLIO MAIN JAVASCRIPT
   =================================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;

// ─── Theme Toggle ──────────────────────────────────────────────
// No saved choice = follow the system setting (handled in CSS).
function toggleTheme() {
  const root = document.documentElement;
  const current = root.dataset.theme ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  const next = current === 'light' ? 'dark' : 'light';
  const apply = () => { root.dataset.theme = next; };
  if (document.startViewTransition && !prefersReducedMotion) document.startViewTransition(apply);
  else apply();
  try { localStorage.setItem('theme', next); } catch (e) { /* private mode: still switches for this visit */ }
}
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);


// ─── Neural-Network Hero Background ────────────────────────────
// Layers of nodes with signals propagating forward (a forward pass),
// nodes lighting up as signals arrive, and the cursor acting as an input.
(function initNeuralBg() {
  const canvas = document.getElementById('neural-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const hero = document.getElementById('home');
  let w = 0, h = 0, nodes = [], edges = [], pulses = [];
  let accent = '#818cf8', tint = '255 255 255';
  let running = false, lastSeed = 0;
  const mouse = { x: -1e4, y: -1e4 };

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    accent = cs.getPropertyValue('--accent').trim() || accent;
    tint = cs.getPropertyValue('--tint').trim() || tint;
  }

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const layers = w < 700 ? [3, 5, 6, 5, 3] : [4, 7, 9, 9, 7, 4];
    nodes = [];
    edges = [];
    pulses = [];
    const byLayer = layers.map((count, li) => {
      const x = w * (0.06 + 0.88 * li / (layers.length - 1));
      return Array.from({ length: count }, (_, i) => {
        const node = {
          bx: x + (Math.random() - 0.5) * 30,
          by: h * (0.12 + 0.76 * (i + 0.5) / count) + (Math.random() - 0.5) * 24,
          phase: Math.random() * Math.PI * 2,
          glow: 0,
          out: [],
          x: 0, y: 0,
        };
        nodes.push(node);
        return node;
      });
    });
    // Connect each layer to the next (sparse, like a pruned dense layer).
    for (let li = 0; li < byLayer.length - 1; li++) {
      byLayer[li].forEach(a => byLayer[li + 1].forEach(b => {
        if (Math.random() < 0.45) {
          const e = { a, b };
          edges.push(e);
          a.out.push(e);
        }
      }));
    }
    build.inputs = byLayer[0];
    place(0);
  }

  function place(t) {
    nodes.forEach(n => {
      n.x = n.bx + Math.sin(t * 0.0006 + n.phase) * 5;
      n.y = n.by + Math.cos(t * 0.0005 + n.phase) * 5;
    });
  }

  function fire(node) {
    node.glow = 1;
    // Each activation passes on along one or two outgoing weights.
    const outs = node.out.slice().sort(() => Math.random() - 0.5).slice(0, 1 + (Math.random() < 0.4));
    outs.forEach(e => { if (pulses.length < 60) pulses.push({ e, p: 0, speed: 0.008 + Math.random() * 0.01 }); });
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    place(t);

    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgb(${tint} / 0.05)`;
    ctx.beginPath();
    edges.forEach(({ a, b }) => { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); });
    ctx.stroke();

    // Cursor as an extra input: faint links to nearby nodes.
    ctx.strokeStyle = accent;
    nodes.forEach(n => {
      const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
      if (d < 160) {
        n.glow = Math.max(n.glow, 0.6 * (1 - d / 160));
        ctx.globalAlpha = 0.25 * (1 - d / 160);
        ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(n.x, n.y); ctx.stroke();
      }
    });

    // Signals: a short bright streak travelling along each edge.
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    pulses.forEach(pl => {
      const { a, b } = pl.e;
      const p0 = Math.max(pl.p - 0.12, 0);
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.moveTo(a.x + (b.x - a.x) * p0, a.y + (b.y - a.y) * p0);
      ctx.lineTo(a.x + (b.x - a.x) * pl.p, a.y + (b.y - a.y) * pl.p);
      ctx.stroke();
    });

    nodes.forEach(n => {
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgb(${tint} / 0.22)`;
      ctx.beginPath(); ctx.arc(n.x, n.y, 2.2, 0, Math.PI * 2); ctx.fill();
      if (n.glow > 0.02) {
        ctx.fillStyle = accent;
        ctx.globalAlpha = n.glow * 0.9;
        ctx.beginPath(); ctx.arc(n.x, n.y, 2.6 + n.glow * 2, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = n.glow * 0.18;
        ctx.beginPath(); ctx.arc(n.x, n.y, 10 + n.glow * 8, 0, Math.PI * 2); ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
  }

  function step(t) {
    if (!running) return;
    if (!document.hidden) {
      // Feed a new input every ~0.7s.
      if (t - lastSeed > 700) {
        lastSeed = t;
        fire(build.inputs[Math.floor(Math.random() * build.inputs.length)]);
      }
      pulses = pulses.filter(pl => {
        pl.p += pl.speed;
        if (pl.p >= 1) { fire(pl.e.b); return false; }
        return true;
      });
      nodes.forEach(n => { n.glow *= 0.96; });
      draw(t);
    }
    requestAnimationFrame(step);
  }

  readColors();
  build();

  if (prefersReducedMotion) {
    // Still frame: the network without moving signals.
    draw(0);
  } else {
    // Only animate while the hero is on screen.
    new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      if (visible && !running) { running = true; requestAnimationFrame(step); }
      running = visible;
    }).observe(hero);
    if (canHover) {
      window.addEventListener('pointermove', e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      }, { passive: true });
    }
  }

  // Re-read colours when the theme changes; rebuild on resize.
  new MutationObserver(() => { readColors(); if (prefersReducedMotion) draw(0); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { readColors(); if (prefersReducedMotion) draw(0); });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    // Mobile address bars fire resize on scroll; only rebuild when width changes.
    resizeTimer = setTimeout(() => {
      if (hero.clientWidth !== w) { build(); if (prefersReducedMotion) draw(0); }
    }, 150);
  });
})();


// ─── Navbar Scroll Effect ──────────────────────────────────────
(function initNavbar() {
  const nav = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Active nav link based on scroll position
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();


// ─── Typing Animation ──────────────────────────────────────────
(function initTyping() {
  const roles = [
    'Applied AI Engineer',
    'Backend Engineer',
    'Conversational AI, RAG & Agents',
    'MSc in Data Analytics Graduate'
  ];
  const el = document.getElementById('typed-role');
  if (!el) return;
  if (prefersReducedMotion) {
    el.textContent = roles[0];
    return;
  }

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let delay = 100;

  function type() {
    const current = roles[roleIdx];
    if (isDeleting) {
      el.textContent = current.slice(0, --charIdx);
      delay = 60;
    } else {
      el.textContent = current.slice(0, ++charIdx);
      delay = 100;
    }

    if (!isDeleting && charIdx === current.length) {
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      delay = 400;
    }
    setTimeout(type, delay);
  }
  setTimeout(type, 800);
})();


// ─── Counter Animation ─────────────────────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-count]');
  let started = false;

  function startCounting() {
    counters.forEach(counter => {
      const raw = counter.getAttribute('data-count');
      const target = parseFloat(raw);
      const decimals = (raw.split('.')[1] || '').length; // "2.5" keeps one decimal
      const final = target.toFixed(decimals) + '+';
      if (prefersReducedMotion) {
        counter.textContent = final;
        return;
      }
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out: fast start, gentle settle
        if (t < 1) {
          counter.textContent = (target * eased).toFixed(decimals);
          requestAnimationFrame(tick);
        } else {
          counter.textContent = final;
        }
      }
      requestAnimationFrame(tick);
    });
  }

  // Start when hero is visible
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      startCounting();
    }
  }, { threshold: 0.5 });

  const hero = document.getElementById('home');
  if (hero) observer.observe(hero);
})();


// ─── Scroll Reveal Animation ───────────────────────────────────
(function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.15 }
  );
  reveals.forEach(el => observer.observe(el));
})();


// ─── Mouse Parallax on Hero Visual ─────────────────────���──────
(function initParallax() {
  const visual = document.querySelector('.hero-visual');
  if (!visual || prefersReducedMotion || !canHover) return;

  document.addEventListener('mousemove', e => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 16;
    const y = (e.clientY / innerHeight - 0.5) * 16;
    visual.style.transform = `translate(${x}px, ${y}px)`;
  });
})();


// ─── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(
    () => showToast('Copied ' + text),
    () => showToast('Copy failed — ' + text)
  );
}

document.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', () => copyText(btn.dataset.copy));
});


// ─── Project Filters ───────────────────────────────────────────
(function initFilters() {
  const chips = document.querySelectorAll('.chip[data-filter]');
  const cards = document.querySelectorAll('.project-card[data-cats]');
  cards.forEach((card, i) => card.style.setProperty('--vt', `project-${i}`));

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      const apply = () => {
        chips.forEach(c => {
          c.classList.toggle('active', c === chip);
          c.setAttribute('aria-pressed', c === chip);
        });
        cards.forEach(card => {
          card.hidden = filter !== 'all' && !card.dataset.cats.split(' ').includes(filter);
        });
      };
      // View Transitions animate the grid reflow natively where supported.
      if (document.startViewTransition && !prefersReducedMotion) document.startViewTransition(apply);
      else apply();
    });
  });
})();


// ─── Cursor Spotlight on Cards ─────────────────────────────────
if (canHover && !prefersReducedMotion) {
  document.addEventListener('pointermove', e => {
    const card = e.target.closest('.project-card, .about-card, .skills-category, .award-item');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });
}


// ─── Quick-Search Palette (Ctrl/⌘+K or /) ──────────────────────
(function initPalette() {
  const dialog = document.getElementById('cmdk');
  const input = document.getElementById('cmdk-input');
  const list = document.getElementById('cmdk-list');
  const goTo = id => () => document.getElementById(id).scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  const open = url => () => window.open(url, '_blank', 'noopener');

  const items = [
    { group: 'Sections', label: 'About', run: goTo('about') },
    { group: 'Sections', label: 'Projects', run: goTo('projects') },
    { group: 'Sections', label: 'Skills', run: goTo('skills') },
    { group: 'Sections', label: 'Contact', run: goTo('contact') },
    // Every project card becomes an entry: open its live link / repo, else scroll to it.
    ...Array.from(document.querySelectorAll('.project-card')).map(card => {
      const link = card.querySelector('a.overlay-btn');
      return {
        group: 'Projects',
        label: card.querySelector('h3').textContent.trim(),
        hint: link ? link.textContent.trim() : '',
        run: link ? open(link.href) : () => card.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      };
    }),
    { group: 'Actions', label: 'Copy email address', run: () => copyText('joelalbertmontuya@gmail.com') },
    { group: 'Actions', label: 'Send an email', run: () => { location.href = 'mailto:joelalbertmontuya@gmail.com'; } },
    { group: 'Actions', label: 'Switch light / dark theme', run: toggleTheme },
    { group: 'Actions', label: 'Download CV', hint: 'PDF', run: open('/go/cv') },
    { group: 'Actions', label: 'Open GitHub', hint: '↗', run: open('/go/github') },
    { group: 'Actions', label: 'Open LinkedIn', hint: '↗', run: open('/go/linkedin') },
  ];

  let shown = [];
  let active = 0;

  function render() {
    const q = input.value.trim().toLowerCase();
    shown = items.filter(i => i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q));
    active = Math.min(active, Math.max(shown.length - 1, 0));
    list.innerHTML = '';
    let group = '';
    shown.forEach((item, i) => {
      if (item.group !== group) {
        group = item.group;
        const h = document.createElement('li');
        h.className = 'cmdk-group';
        h.setAttribute('role', 'presentation');
        h.textContent = group;
        list.append(h);
      }
      const li = document.createElement('li');
      li.id = `cmdk-${i}`;
      li.className = 'cmdk-item';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', i === active);
      li.innerHTML = `<span></span><small></small>`;
      li.firstChild.textContent = item.label;
      li.lastChild.textContent = item.hint || '';
      li.addEventListener('pointermove', () => setActive(i));
      li.addEventListener('click', () => choose(i));
      list.append(li);
    });
    if (!shown.length) list.innerHTML = '<li class="cmdk-empty">No matches</li>';
    input.setAttribute('aria-activedescendant', shown.length ? `cmdk-${active}` : '');
  }

  function setActive(i) {
    if (i === active) return;
    list.querySelector(`#cmdk-${active}`)?.setAttribute('aria-selected', 'false');
    active = i;
    const el = list.querySelector(`#cmdk-${active}`);
    el?.setAttribute('aria-selected', 'true');
    el?.scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', `cmdk-${active}`);
  }

  function choose(i) {
    const item = shown[i];
    if (!item) return;
    dialog.close();
    item.run();
  }

  function show() {
    input.value = '';
    active = 0;
    render();
    dialog.showModal();
    input.focus();
  }

  input.addEventListener('input', () => { active = 0; render(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((active + 1) % shown.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((active - 1 + shown.length) % shown.length); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
  });
  // Click on the backdrop (the dialog element itself, outside the box) closes it.
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  document.getElementById('cmdk-open').addEventListener('click', show);
  document.addEventListener('keydown', e => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
      e.preventDefault();
      dialog.open ? dialog.close() : show();
    }
  });
})();
