/* ============================================================
   MC Spine — shared interactions v2
   Globals (CDN): THREE, anime, ScrollReveal, mojs
   ============================================================ */

const PALETTE = {
  gelido: "#d6e8ee", navy: "#001b48",
  real: "#02457a", glow: "#018abe", hielo: "#97cadb",
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(pointer: coarse)").matches;

/* ---------- SVG icons ---------- */
const ICONS = {
  menu:    '<path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  close:   '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  phone:   '<path d="M3 5c0 8.3 6.7 15 15 15a2 2 0 0 0 2-2v-2.6a1 1 0 0 0-.8-1l-3.3-.7a1 1 0 0 0-1 .3l-1.1 1.3a12 12 0 0 1-5.4-5.4l1.3-1.1a1 1 0 0 0 .3-1L8.6 4.8a1 1 0 0 0-1-.8H5a2 2 0 0 0-2 2z" fill="currentColor"/>',
  arrow:   '<path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  mail:    '<path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="2"/><path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="2"/>',
  pin:     '<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="2"/>',
  clock:   '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  shield:  '<path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  spark:   '<path d="M12 3v6m0 6v6m9-9h-6M9 12H3m12.5-6.5-4 4m-3 3-4 4m11 0-4-4m-3-3-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  boxes:   '<path d="M3 8l9-5 9 5-9 5-9-5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M3 8v8l9 5 9-5V8" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 13v8" stroke="currentColor" stroke-width="2"/>',
  pulse:   '<path d="M3 12h4l2-6 4 12 2-6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  target:  '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  eye:     '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>',
  gem:     '<path d="M6 3h12l3 6-9 12L3 9l3-6z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M3 9h18M9 3l3 6 3-6M12 9 9 21m3-12 3 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  chevron: '<path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  cert:    '<path d="M12 15l-2 5 2-1 2 1-2-5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="10" r="6" stroke="currentColor" stroke-width="2"/><path d="m9.5 10 1.5 1.5 3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  years:   '<rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  products:'<path d="M3 8l9-5 9 5-9 5-9-5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M3 8v8l9 5 9-5V8" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  doctors: '<circle cx="9" cy="7" r="3" stroke="currentColor" stroke-width="2"/><path d="M3 21v-1a6 6 0 0 1 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="17" cy="16" r="4" stroke="currentColor" stroke-width="2"/><path d="M17 14v4M15 16h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  quality: '<path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  implant: '<path d="M12 4 C8 4 5 7 5 12 S8 20 12 20 S19 17 19 12 S16 4 12 4Z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  fix:     '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  box:     '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M3.3 7 12 12l8.7-5M12 22V12" stroke="currentColor" stroke-width="2"/>',
  plate:   '<rect x="4" y="7" width="16" height="10" rx="2" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="16" cy="12" r="1.5" fill="currentColor"/>',
};

function injectIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((el) => {
    const key = el.getAttribute("data-icon");
    if (!ICONS[key] || el.dataset.iconDone) return;
    el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${ICONS[key]}</svg>`;
    el.dataset.iconDone = "1";
  });
}

/* ---------- Custom Cursor ---------- */
function initCursor() {
  if (isTouch || reduceMotion) return;
  const dot  = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  if (!dot || !ring) return;

  document.documentElement.classList.add("has-custom-cursor");

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
  }, { passive: true });

  (function lerp() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    requestAnimationFrame(lerp);
  })();

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest("a,button,.cat-card,.product-card,.node__head,.filter-btn,.card,.cert-badge,.hero-float")) {
      document.documentElement.classList.add("cursor--hover");
    }
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest("a,button,.cat-card,.product-card,.node__head,.filter-btn,.card,.cert-badge,.hero-float")) {
      document.documentElement.classList.remove("cursor--hover");
    }
  });

  document.addEventListener("mouseleave", () => { dot.style.opacity = "0"; ring.style.opacity = "0"; });
  document.addEventListener("mouseenter", () => { dot.style.opacity = "1"; ring.style.opacity = "1"; });
}

/* ---------- Logo pulse ---------- */
function initLogoPulse() {
  if (reduceMotion) return;
  const logo = document.querySelector(".brand img");
  if (!logo || !window.anime) return;
  anime({ targets: logo, scale: [1, 1.08, 1], duration: 2800, easing: "easeInOutSine", loop: true });
}

/* ---------- Navbar on scroll ---------- */
function initNavbarScroll() {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const openBtn  = document.querySelector("[data-menu-open]");
  const closeBtn = document.querySelector("[data-menu-close]");
  const backdrop = document.querySelector("[data-backdrop]");
  const panel    = document.querySelector("[data-offcanvas]");
  if (!openBtn || !panel) return;
  const links = panel.querySelectorAll(".offcanvas__links a");

  const open = () => {
    backdrop.classList.add("is-open");
    openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (window.anime && !reduceMotion) {
      anime.remove([panel, links]);
      anime({ targets: panel, translateX: ["100%","0%"], duration: 620, easing: "easeOutExpo" });
      anime({ targets: links, opacity: [0,1], translateX: [40,0], delay: anime.stagger(70,{start:180}), duration: 600, easing: "easeOutExpo" });
    } else {
      panel.style.transform = "translateX(0)";
      links.forEach(l => l.style.opacity = 1);
    }
  };
  const close = () => {
    backdrop.classList.remove("is-open");
    openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (window.anime && !reduceMotion) {
      anime.remove([panel, links]);
      anime({ targets: panel, translateX: ["0%","100%"], duration: 480, easing: "easeInExpo" });
    } else {
      panel.style.transform = "translateX(100%)";
    }
  };

  openBtn.addEventListener("click", open);
  closeBtn && closeBtn.addEventListener("click", close);
  backdrop && backdrop.addEventListener("click", close);
  links.forEach(l => l.addEventListener("click", close));
  window.addEventListener("keydown", e => e.key === "Escape" && close());
}

/* ---------- Mo.js nav bursts ---------- */
function initHoverBursts() {
  if (reduceMotion || isTouch || !window.mojs) return;
  const targets = document.querySelectorAll(".nav__links a, .filter-btn");
  targets.forEach(el => {
    let last = 0;
    el.addEventListener("mouseenter", () => {
      const now = performance.now();
      if (now - last < 450) return;
      last = now;
      const r = el.getBoundingClientRect();
      new mojs.Burst({
        left: r.left + r.width / 2, top: r.top + r.height / 2,
        radius: { 0: 26 }, count: 6,
        children: { fill: [PALETTE.glow, PALETTE.hielo], radius: { 4: 0 }, duration: 600, easing: "cubic.out" },
      }).play();
    });
  });
}

window.mcBurst = function (x, y, opts = {}) {
  if (reduceMotion || !window.mojs) return;
  new mojs.Burst({
    left: x, top: y,
    radius: { 0: opts.radius || 50 }, count: opts.count || 12,
    children: { fill: opts.colors || [PALETTE.glow, PALETTE.hielo, "#ffffff"], radius: { 7: 0 }, duration: opts.duration || 900, easing: "cubic.out" },
  }).play();
};

/* ---------- Three.js spine background ---------- */
function enableFallback() {
  const c = document.getElementById("bg-canvas");
  if (c) c.style.display = "none";
  if (!document.querySelector(".aura-fallback")) {
    const f = document.createElement("div");
    f.className = "aura-fallback";
    document.body.appendChild(f);
  }
}

function initThreeBackground() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  if (reduceMotion || isTouch || window.innerWidth < 900 || !window.THREE) { enableFallback(); return; }
  let renderer, scene, camera, group, raf;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) { enableFallback(); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 16);
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const key = new THREE.PointLight(0x018abe, 1.2, 100); key.position.set(10, 12, 14); scene.add(key);
  const fill = new THREE.PointLight(0x97cadb, 0.8, 100); fill.position.set(-12, -8, 8); scene.add(fill);
  group = new THREE.Group(); scene.add(group);
  const SEGMENTS = 26;
  const discMat   = new THREE.MeshStandardMaterial({ color: 0x9fcfe0, metalness: .35, roughness: .35, transparent: true, opacity: .9 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x018abe, metalness: .4,  roughness: .3,  transparent: true, opacity: .95 });
  for (let i = 0; i < SEGMENTS; i++) {
    const t = i / (SEGMENTS - 1);
    const disc = new THREE.Mesh(new THREE.TorusGeometry(.9 - t * .28, .26, 14, 32), i % 4 === 0 ? accentMat : discMat);
    disc.position.set(Math.sin(t * Math.PI * 2.2) * 1.6, (t - .5) * 16, Math.cos(t * Math.PI * 2.2) * 1.6);
    disc.rotation.x = Math.PI / 2; disc.rotation.z = t * Math.PI * 2.2;
    group.add(disc);
  }
  const pGeo = new THREE.BufferGeometry();
  const N = 140; const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i*3] = (Math.random()-.5)*24; pos[i*3+1] = (Math.random()-.5)*24; pos[i*3+2] = (Math.random()-.5)*18; }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x018abe, size: .09, transparent: true, opacity: .45 }));
  scene.add(particles);
  group.rotation.z = .25;
  let mouseX = 0, mouseY = 0, scrollY = 0;
  window.addEventListener("mousemove", e => { mouseX = e.clientX/window.innerWidth-.5; mouseY = e.clientY/window.innerHeight-.5; }, { passive: true });
  window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });
  window.addEventListener("resize", () => { camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); });
  let frames = 0, fpsStart = performance.now(), checked = false;
  const clock = () => (performance.now() - fpsStart) / 1000;
  function render() {
    raf = requestAnimationFrame(render);
    const t = clock();
    group.rotation.y = t * .12 + mouseX * .6;
    group.rotation.x = mouseY * .4 + scrollY * .0006;
    group.position.y = -scrollY * .004;
    particles.rotation.y = t * .04;
    camera.position.x += (mouseX * 2 - camera.position.x) * .04;
    camera.position.y += (-mouseY * 2 - camera.position.y) * .04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    frames++;
    if (!checked && t > 2.2) {
      checked = true;
      if (frames / t < 38) { cancelAnimationFrame(raf); renderer.dispose(); enableFallback(); }
    }
  }
  render();
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(raf); else render(); });
}

/* ---------- ScrollReveal ---------- */
function initScrollReveal() {
  document.querySelectorAll("[data-sr]").forEach(el => el.style.visibility = "visible");
  if (reduceMotion || !window.ScrollReveal) return;
  const sr = ScrollReveal({ distance: "36px", duration: 900, easing: "cubic-bezier(0.22,1,0.36,1)", opacity: 0, cleanup: true, reset: false });
  document.querySelectorAll("[data-sr]").forEach(el => {
    el.style.visibility = "hidden";
    const origin = el.dataset.sr || "bottom";
    const delay  = parseInt(el.dataset.srDelay || "0", 10);
    sr.reveal(el, { origin, delay });
  });
}

/* ---------- Hero letter-by-letter reveal ---------- */
function initHeroReveal() {
  const target = document.querySelector("[data-letters]");
  if (!target) return;
  const text = target.textContent.trim();
  target.setAttribute("aria-label", text);
  target.innerHTML = text.split("").map(ch => ch === " " ? " " : `<span class="reveal-letter">${ch}</span>`).join("");
  if (reduceMotion || !window.anime) {
    target.querySelectorAll(".reveal-letter").forEach(s => { s.style.opacity = 1; s.style.transform = "none"; });
    return;
  }
  anime({
    targets: target.querySelectorAll(".reveal-letter"),
    opacity: [0, 1], translateY: ["0.55em", "0em"], rotateZ: [6, 0],
    duration: 740, delay: anime.stagger(26, { start: 350 }), easing: "easeOutExpo",
  });
}

/* ---------- Hero entrance (tag, lead, cta, chip, visual, floats) ---------- */
function initHeroEntrance() {
  if (reduceMotion || !window.anime) return;
  const tag    = document.querySelector(".hero-tag");
  const lead   = document.querySelector(".hero-v2__content .lead");
  const cta    = document.querySelector(".hero-v2__cta");
  const chip   = document.querySelector(".hero-chip");
  const visual = document.querySelector(".hero-v2__visual");
  const floats = document.querySelectorAll(".hero-float");

  const anim = (el, delay, props = {}) => {
    if (!el) return;
    anime({ targets: el, opacity: [0,1], translateY: [20,0], duration: 700, easing: "easeOutExpo", delay, ...props });
  };

  anim(tag,    200);
  anim(lead,   560);
  anim(cta,    720);
  anim(chip,   920);
  if (visual) anime({ targets: visual, opacity: [0,1], translateX: [44,0], duration: 900, easing: "easeOutExpo", delay: 280 });
  if (floats.length) anime({ targets: floats, opacity: [0,1], scale: [.82,1], duration: 620, delay: anime.stagger(220, { start: 1000 }), easing: "easeOutBack" });
}

/* ---------- Stats counters ---------- */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;
  if (reduceMotion) { counters.forEach(c => c.textContent = c.dataset.count); return; }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const start  = performance.now();
      const dur    = 1700;
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - t, 3)) * target);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: .5 });

  counters.forEach(c => { c.textContent = "0"; obs.observe(c); });
}

/* ---------- Nosotros nodes ---------- */
function initNodes() {
  const nodes = document.querySelectorAll(".node");
  if (!nodes.length) return;
  nodes.forEach(node => {
    const head  = node.querySelector(".node__head");
    const panel = node.querySelector(".node__panel");
    const inner = node.querySelector(".node__panel-inner");
    head.addEventListener("click", () => {
      const isOpen = node.classList.contains("is-open");
      nodes.forEach(n => {
        if (n !== node && n.classList.contains("is-open")) {
          n.classList.remove("is-open");
          collapse(n.querySelector(".node__panel"));
        }
      });
      if (isOpen) { node.classList.remove("is-open"); collapse(panel); }
      else { node.classList.add("is-open"); expand(panel, inner); }
    });
  });

  function expand(panel, inner) {
    const h = inner.offsetHeight;
    if (window.anime && !reduceMotion) {
      anime.remove(panel);
      anime({ targets: panel, height: [0, h], duration: 560, easing: "easeOutExpo", complete: () => panel.style.height = "auto" });
    } else panel.style.height = "auto";
  }
  function collapse(panel) {
    if (window.anime && !reduceMotion) {
      anime.remove(panel);
      anime({ targets: panel, height: [panel.offsetHeight, 0], duration: 420, easing: "easeInExpo" });
    } else panel.style.height = "0px";
  }

  const first = nodes[0];
  first.classList.add("is-open");
  requestAnimationFrame(() => first.querySelector(".node__panel").style.height = "auto");
}

/* ---------- Contact form ---------- */
function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  const success = form.querySelector("[data-form-success]");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data   = new FormData(form);
    const nombre = encodeURIComponent(data.get("nombre") || "");
    const asunto = encodeURIComponent(data.get("asunto") || "Contacto desde el sitio web");
    const correo = data.get("correo") || "";
    const mensaje = encodeURIComponent(`${data.get("mensaje") || ""}\n\n— ${data.get("nombre") || ""} (${correo})`);
    const btn = form.querySelector("[data-submit]");
    const r = btn.getBoundingClientRect();
    window.mcBurst && window.mcBurst(r.left + r.width / 2, r.top + r.height / 2, { radius: 80, count: 16 });
    if (success) {
      success.classList.add("is-visible");
      if (window.anime && !reduceMotion) anime({ targets: success, opacity: [0,1], translateY: [10,0], duration: 500, easing: "easeOutExpo" });
    }
    setTimeout(() => { window.location.href = `mailto:info@mcspine.mx?subject=${asunto}%20-%20${nombre}&body=${mensaje}`; }, 700);
    form.reset();
  });
}

/* ---------- Boot ---------- */
function safe(fn) { try { fn(); } catch (e) { console.warn("[MC Spine]", fn.name, e); } }

function boot() {
  document.querySelectorAll("[data-sr]").forEach(el => el.style.visibility = "visible");
  [
    injectIcons, initCursor, initLogoPulse, initNavbarScroll, initMobileMenu,
    initHoverBursts, initThreeBackground, initHeroReveal, initHeroEntrance,
    initCounters, initNodes, initContactForm, initScrollReveal,
  ].forEach(safe);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();

export { PALETTE, injectIcons, reduceMotion };
