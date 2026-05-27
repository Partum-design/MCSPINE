import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const icons = {
  menu: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2.75 6.75c0 8.01 6.49 14.5 14.5 14.5h1.5a2.5 2.5 0 0 0 2.5-2.5v-.91a1.6 1.6 0 0 0-1.1-1.52l-4.08-1.36a1.6 1.6 0 0 0-1.72.48l-1.03 1.17a11.1 11.1 0 0 1-5.43-5.43l1.17-1.03a1.6 1.6 0 0 0 .48-1.72L8.68 4.35a1.6 1.6 0 0 0-1.52-1.1h-.91a2.5 2.5 0 0 0-2.5 2.5v1Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25V6.75Z" stroke="currentColor" stroke-width="1.8"/><path d="m5 7 7 5 7-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  location: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-5.25 7-12a7 7 0 1 0-14 0c0 6.75 7 12 7 12Z" stroke="currentColor" stroke-width="1.8"/><path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" stroke-width="1.8"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-3.5 7-10V5.8L12 3 5 5.8V11c0 6.5 7 10 7 10Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m9 12 2 2 4-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l1.7 5.4L19 10l-5.3 1.6L12 17l-1.7-5.4L5 10l5.3-1.6L12 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m18 15 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  boxes: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4.5 7.75 12 12l7.5-4.25M12 12v8.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};

function injectIcons() {
  document.querySelectorAll("[data-icon]").forEach((node) => {
    const name = node.getAttribute("data-icon");
    if (icons[name]) node.innerHTML = icons[name];
  });
}

function initPreloader() {
  const preloader = document.querySelector(".preloader");
  if (!preloader) return;

  if (!prefersReducedMotion && window.anime) {
    window.anime({
      targets: ".preloader__ring",
      rotate: 360,
      duration: 900,
      easing: "linear",
      loop: true
    });
    window.anime({
      targets: ".preloader__logo",
      scale: [0.94, 1.04],
      opacity: [0.6, 1],
      direction: "alternate",
      duration: 700,
      easing: "easeInOutSine",
      loop: true
    });
  }

  window.addEventListener("load", () => {
    setTimeout(() => preloader.classList.add("is-hidden"), 380);
  });
}

function initMenu() {
  const open = document.querySelector("[data-menu-open]");
  const close = document.querySelector("[data-menu-close]");
  const panel = document.querySelector("[data-offcanvas]");
  const backdrop = document.querySelector("[data-backdrop]");
  if (!open || !close || !panel || !backdrop) return;

  const setOpen = (value) => {
    document.body.classList.toggle("menu-open", value);
    panel.classList.toggle("is-open", value);
    backdrop.classList.toggle("is-open", value);
    open.setAttribute("aria-expanded", String(value));
  };

  open.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));
  backdrop.addEventListener("click", () => setOpen(false));
  panel.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

function initReveal() {
  if (prefersReducedMotion || !window.ScrollReveal) return;

  const sr = window.ScrollReveal({
    distance: "24px",
    duration: 880,
    easing: "cubic-bezier(.2,.8,.2,1)",
    viewFactor: 0.14,
    reset: false
  });

  sr.reveal("[data-reveal='up']", { origin: "bottom", interval: 85 });
  sr.reveal("[data-reveal='left']", { origin: "left" });
  sr.reveal("[data-reveal='right']", { origin: "right" });
  sr.reveal(".card, .product-card, .contact-item", { origin: "bottom", interval: 65 });
}

function initAnimeDetails() {
  if (prefersReducedMotion || !window.anime) return;

  window.anime({
    targets: ".hero .eyebrow, .hero .display, .hero .lead, .hero__actions, .hero__metrics",
    translateY: [22, 0],
    opacity: [0, 1],
    delay: window.anime.stagger(90, { start: 500 }),
    duration: 860,
    easing: "easeOutExpo"
  });
}

function initMojs() {
  if (prefersReducedMotion || !window.mojs) return;

  document.querySelectorAll("[data-burst]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const rect = event.currentTarget.getBoundingClientRect();

      // Main burst
      const burst = new window.mojs.Burst({
        left: rect.left + rect.width / 2,
        top: rect.top + rect.height / 2,
        radius: { 6: 48 },
        count: 10,
        children: {
          shape: "circle",
          radius: { 4: 8 },
          fill: ["#17a6c8", "#0a5d86", "#45c5df", "#00d4ff"],
          duration: 680,
          easing: "easeOutExpo"
        }
      });

      // Ring accent
      const ring = new window.mojs.Shape({
        left: rect.left + rect.width / 2,
        top: rect.top + rect.height / 2,
        shape: "circle",
        radius: { 0: 44 },
        fill: "none",
        stroke: { "#17a6c8": "transparent" },
        strokeWidth: { 6: 0 },
        opacity: { 1: 0 },
        duration: 500,
        easing: "easeOutExpo"
      });

      burst.play();
      ring.play();
    });
  });
}

function initCatalogFilters() {
  const buttons = document.querySelectorAll("[data-filter]");
  const items = document.querySelectorAll("[data-category]");
  if (!buttons.length || !items.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach((item) => item.classList.toggle("is-active", item === button));
      items.forEach((item) => {
        const visible = filter === "all" || item.dataset.category === filter;
        item.style.display = visible ? "" : "none";
        if (visible && !prefersReducedMotion && window.anime) {
          window.anime({
            targets: item,
            opacity: [0, 1],
            translateY: [14, 0],
            duration: 380,
            easing: "easeOutQuad"
          });
        }
      });
    });
  });
}

function initThreeScene() {
  const mount = document.querySelector("[data-three-spine]");
  if (!mount || prefersReducedMotion) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  mount.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const material = new THREE.MeshStandardMaterial({
    color: 0x17a6c8,
    metalness: 0.3,
    roughness: 0.34,
    transparent: true,
    opacity: 0.88
  });
  const nodeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.18,
    roughness: 0.2
  });

  for (let i = 0; i < 18; i += 1) {
    const y = (i - 8.5) * 0.34;
    const angle = i * 0.82;
    const x = Math.cos(angle) * 0.88;
    const z = Math.sin(angle) * 0.88;

    const bone = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.18), material);
    bone.position.set(x, y, z);
    bone.rotation.set(0.25, angle, 0.08);
    group.add(bone);

    const node = new THREE.Mesh(new THREE.SphereGeometry(0.12, 22, 22), nodeMaterial);
    node.position.set(x * 0.22, y, z * 0.22);
    group.add(node);
  }

  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 70 }, (_, i) => {
      const t = i / 69;
      const a = t * Math.PI * 6.5;
      return new THREE.Vector3(Math.cos(a) * 1.02, (t - 0.5) * 6.6, Math.sin(a) * 1.02);
    })
  );
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 120, 0.012, 8, false),
    new THREE.MeshBasicMaterial({ color: 0x0a5d86, transparent: true, opacity: 0.4 })
  );
  group.add(tube);

  scene.add(new THREE.AmbientLight(0xffffff, 1.3));
  const light = new THREE.DirectionalLight(0xffffff, 2.8);
  light.position.set(4, 4, 6);
  scene.add(light);

  // Subtle rim light
  const rimLight = new THREE.DirectionalLight(0x45c5df, 0.8);
  rimLight.position.set(-4, 2, -3);
  scene.add(rimLight);

  function resize() {
    const width = mount.clientWidth || 500;
    const height = mount.clientHeight || 500;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function tick() {
    group.rotation.y += 0.0038;
    group.rotation.x = Math.sin(performance.now() * 0.0007) * 0.09;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  resize();
  tick();
}

// ─── Magnetic button effect ───────────────────────────────
function initMagneticButtons() {
  if (prefersReducedMotion) return;

  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const strength = 5;
      btn.style.transform = `translate(${dx * strength}px, ${dy * strength - 3}px) scale(1.04)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}

// ─── Tilt effect on product cards ────────────────────────
function initCardTilt() {
  if (prefersReducedMotion) return;

  document.querySelectorAll(".product-card, .card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-6px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg)`;
      card.style.transition = "transform 0.1s ease";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.transition = "transform 0.4s cubic-bezier(.34,1.2,.64,1), box-shadow 0.32s, border-color 0.32s";
    });
  });
}

// ─── Cursor glow ─────────────────────────────────────────
function initCursorGlow() {
  if (prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) return;

  const glow = document.createElement("div");
  glow.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9998;
    width: 320px; height: 320px; border-radius: 50%;
    background: radial-gradient(circle, rgba(23,166,200,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    top: 0; left: 0; opacity: 0;
  `;
  document.body.appendChild(glow);

  let mx = 0, my = 0;
  let cx = 0, cy = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    glow.style.opacity = "1";
  });

  document.addEventListener("mouseleave", () => { glow.style.opacity = "0"; });

  function animGlow() {
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    glow.style.left = cx + "px";
    glow.style.top = cy + "px";
    requestAnimationFrame(animGlow);
  }
  animGlow();
}

injectIcons();
initPreloader();
initMenu();
initReveal();
initAnimeDetails();
initMojs();
initCatalogFilters();
initThreeScene();
initMagneticButtons();
initCardTilt();
initCursorGlow();
