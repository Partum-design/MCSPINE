/* ============================================================
   MC Spine — catálogo: render, filtros fluidos, tilt 3D, modal
   ============================================================ */
import { PRODUCTS, CATEGORY_LABEL } from "../data/products.js";
import { PALETTE, injectIcons, reduceMotion } from "./main.js";

const grid = document.querySelector("[data-product-grid]");
const filters = document.querySelectorAll(".filter-btn");
const isTouch = window.matchMedia("(pointer: coarse)").matches;

let current = "all";

function cardHTML(p) {
  return `
    <article class="product-card" data-category="${p.category}" data-slug="${p.slug}" tabindex="0" aria-label="${p.name}">
      <span class="product-card__hint" data-icon="spark"></span>
      <div class="product-card__media"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
      <div class="product-card__body">
        <small>${CATEGORY_LABEL[p.category]}</small>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
      </div>
    </article>`;
}

function visibleProducts() {
  return current === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === current);
}

function render(animateIn = true) {
  if (!grid) return;
  grid.innerHTML = visibleProducts().map(cardHTML).join("");
  injectIcons(grid);
  wireCards();
  if (animateIn && window.anime && !reduceMotion) {
    anime({
      targets: grid.querySelectorAll(".product-card"),
      opacity: [0, 1],
      translateY: [28, 0],
      scale: [0.94, 1],
      delay: anime.stagger(55),
      duration: 620,
      easing: "spring(1, 80, 12, 0)",
    });
  }
}

function switchTo(cat) {
  if (cat === current) return;
  const old = grid.querySelectorAll(".product-card");
  if (window.anime && !reduceMotion && old.length) {
    anime({
      targets: old,
      opacity: [1, 0],
      translateY: [0, -18],
      scale: [1, 0.92],
      delay: anime.stagger(22),
      duration: 320,
      easing: "easeInQuad",
      complete: () => { current = cat; render(true); },
    });
  } else {
    current = cat;
    render(true);
  }
}

/* 3D tilt + click burst + modal */
function wireCards() {
  const cards = grid.querySelectorAll(".product-card");
  cards.forEach((card) => {
    if (!isTouch && !reduceMotion) {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 11).toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    }
    const open = (e) => {
      const r = card.getBoundingClientRect();
      window.mcBurst && window.mcBurst(r.left + r.width / 2, r.top + r.height / 2, { radius: 70, count: 14 });
      openModal(card.dataset.slug);
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(e); } });
  });
}

/* ---------- Modal ---------- */
const backdrop = document.querySelector("[data-modal]");
function openModal(slug) {
  const p = PRODUCTS.find((x) => x.slug === slug);
  if (!p || !backdrop) return;
  backdrop.querySelector("[data-modal-img]").src = p.img;
  backdrop.querySelector("[data-modal-img]").alt = p.name;
  backdrop.querySelector("[data-modal-cat]").textContent = CATEGORY_LABEL[p.category];
  backdrop.querySelector("[data-modal-title]").textContent = p.name;
  backdrop.querySelector("[data-modal-desc]").textContent = p.desc;
  backdrop.classList.add("is-open");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  if (!backdrop) return;
  backdrop.classList.remove("is-open");
  document.body.style.overflow = "";
}
if (backdrop) {
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop || e.target.closest("[data-modal-close]")) closeModal(); });
  window.addEventListener("keydown", (e) => e.key === "Escape" && closeModal());
}

/* ---------- Filters ---------- */
filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    switchTo(btn.dataset.filter);
  });
});

render(true);
