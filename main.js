/* ===================================================
   PORTFOLIO MAIN JAVASCRIPT
   =================================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;

// ─── Particles Background ──────────────────────────────────────
(function initParticles() {
  // A full-viewport moving background is skipped for reduced-motion users.
  if (prefersReducedMotion) return;
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '0,212,170' : '124,58,237';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
      ctx.fill();
    }
  }

  // Draw connecting lines between nearby particles
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,170,${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function init() {
    particles = [];
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 100);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function animate() {
    // Don't burn frames while the tab is in the background.
    if (document.hidden) {
      animFrame = requestAnimationFrame(animate);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    animFrame = requestAnimationFrame(animate);
  }

  init();
  animate();
  window.addEventListener('resize', () => { resize(); init(); });
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
    'AI Engineering Analyst',
    'MSc in Data Analytics Graduate',
    'DevOps & Cloud Engineer',
    'Full Stack Developer'
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


// ─── Tab Switching ─────────────────────────────────────────────
function switchTab(tabName) {
  // Update buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });
  const activeBtn = document.getElementById(`tab-${tabName}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.setAttribute('aria-selected', 'true');
  }

  // Update panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  const activePanel = document.getElementById(`panel-${tabName}`);
  if (activePanel) {
    activePanel.classList.add('active');
  }

  // Animate skill bars when skills tab opens
  if (tabName === 'skills') {
    setTimeout(animateSkillBars, 100);
  }
}

(function initTabKeys() {
  const tabs = Array.from(document.querySelectorAll('.tab-btn'));
  tabs.forEach((tab, i) => {
    tab.addEventListener('keydown', e => {
      let next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      e.preventDefault();
      next.focus();
      next.click();
    });
  });
})();

// ─── Skill Bar Animation ───────────────────────────────────────
function animateSkillBars() {
  document.querySelectorAll('.skill-fill').forEach(bar => {
    const width = bar.getAttribute('data-width');
    bar.style.width = width;
  });
}

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


// ─── Skill bars animate on page load if already visible ────────
window.addEventListener('load', () => {
  // Tiny delay so CSS transitions are ready
  setTimeout(() => {
    const skillsPanel = document.getElementById('panel-skills');
    if (skillsPanel && skillsPanel.classList.contains('active')) {
      animateSkillBars();
    }
  }, 300);
});
