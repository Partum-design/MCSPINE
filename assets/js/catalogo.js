/* MC Spine · Catálogo: búsqueda, filtros, estado en URL, ficha de producto */
import { PRODUCTS, CATEGORIES, CATEGORY_LABEL, ZONES, ZONE_LABEL } from "../data/products.js";
import { productCard, paintAddButtons, reduceMotion } from "./main.js";
import { quote, waLink } from "./quote.js";

const grid = document.querySelector("[data-grid]");
const chipsBox = document.querySelector("[data-chips]");
const zoneSel = document.querySelector("[data-zone-select]");
const sortSel = document.querySelector("[data-sort]");
const search = document.querySelector("[data-search]");
const searchWrap = search.closest(".search");
const status = document.querySelector("[data-status]");
const modal = document.querySelector("[data-modal]");

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const params = new URLSearchParams(location.search);
const state = {
  cat: CATEGORIES.some((c) => c.id === params.get("cat")) ? params.get("cat") : "all",
  zone: ZONES.some((z) => z.id === params.get("zona")) ? params.get("zona") : "all",
  q: params.get("q") || "",
  sort: params.get("orden") === "az" ? "az" : "default",
};

/* ---------- Controles ---------- */
function countFor(catId) {
  return PRODUCTS.filter((p) => (catId === "all" || p.category === catId) && (state.zone === "all" || p.zone === state.zone)).length;
}
function renderChips() {
  chipsBox.innerHTML = CATEGORIES.map((c) => `
    <button class="chip" type="button" data-cat="${c.id}" aria-pressed="${state.cat === c.id}">
      ${c.label}<span class="count">${countFor(c.id)}</span>
    </button>`).join("");
}
zoneSel.innerHTML = `<option value="all">Todas las zonas</option>` + ZONES.map((z) => `<option value="${z.id}">${z.label}</option>`).join("");
zoneSel.value = state.zone;
sortSel.value = state.sort;
search.value = state.q;

/* ---------- Filtro ---------- */
function filtered() {
  const terms = norm(state.q).split(/\s+/).filter(Boolean);
  let list = PRODUCTS.filter((p) => {
    if (state.cat !== "all" && p.category !== state.cat) return false;
    if (state.zone !== "all" && p.zone !== state.zone) return false;
    if (!terms.length) return true;
    const hay = norm(`${p.name} ${p.desc} ${CATEGORY_LABEL[p.category]} ${p.zone ? ZONE_LABEL[p.zone] : ""}`);
    return terms.every((t) => hay.includes(t));
  });
  if (state.sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));
  return list;
}

function highlighter() {
  const terms = norm(state.q).split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return esc;
  return (text) => {
    // Resalta respetando acentos: compara sobre la versión normalizada
    const n = norm(text);
    const marks = new Array(text.length).fill(false);
    terms.forEach((t) => { let i = n.indexOf(t); while (i !== -1) { for (let k = i; k < i + t.length; k++) marks[k] = true; i = n.indexOf(t, i + t.length); } });
    let out = "", open = false;
    [...text].forEach((ch, i) => {
      if (marks[i] && !open) { out += "<mark>"; open = true; }
      if (!marks[i] && open) { out += "</mark>"; open = false; }
      out += esc(ch);
    });
    return open ? out + "</mark>" : out;
  };
}

let lastList = [];
function render() {
  const list = filtered();
  lastList = list;
  const hl = highlighter();
  grid.innerHTML = list.length
    ? list.map((p, i) => productCard(p, Math.min(i, 12), hl)).join("")
    : `<div class="empty">
        <i class="ph ph-magnifying-glass"></i>
        <h3>Sin resultados</h3>
        <p>No encontramos productos con esos filtros. Prueba otra palabra o consulta directamente a nuestro equipo.</p>
        <button class="btn btn--sm" type="button" data-reset>Limpiar filtros</button>
      </div>`;
  paintAddButtons(grid);
  const filtersOn = state.cat !== "all" || state.zone !== "all" || state.q;
  status.innerHTML = `<span>Mostrando <strong>${list.length}</strong> de ${PRODUCTS.length} productos</span>${filtersOn ? `<button class="link-btn" type="button" data-reset>Limpiar filtros</button>` : ""}`;
  renderChips();
  searchWrap.classList.toggle("has-value", !!state.q);
  syncURL();
}

function syncURL(slug) {
  const u = new URLSearchParams();
  if (state.cat !== "all") u.set("cat", state.cat);
  if (state.zone !== "all") u.set("zona", state.zone);
  if (state.q) u.set("q", state.q);
  if (state.sort !== "default") u.set("orden", "az");
  const open = slug === undefined ? (modal.open ? modal.dataset.slug : null) : slug;
  if (open) u.set("p", open);
  const qs = u.toString();
  history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
}

/* ---------- Eventos ---------- */
chipsBox.addEventListener("click", (e) => {
  const b = e.target.closest("[data-cat]");
  if (!b) return;
  state.cat = b.dataset.cat;
  render();
});
zoneSel.addEventListener("change", () => { state.zone = zoneSel.value; render(); });
sortSel.addEventListener("change", () => { state.sort = sortSel.value; render(); });
let t;
search.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { state.q = search.value.trim(); render(); }, 140); });
searchWrap.querySelector(".search__clear").addEventListener("click", () => { search.value = ""; state.q = ""; render(); search.focus(); });
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-reset]")) {
    Object.assign(state, { cat: "all", zone: "all", q: "" });
    search.value = ""; zoneSel.value = "all";
    render();
  }
});
document.addEventListener("keydown", (e) => {
  const typing = /input|textarea|select/i.test(document.activeElement.tagName);
  if (e.key === "/" && !typing && !modal.open) { e.preventDefault(); search.focus(); }
});

/* ---------- Ficha de producto ---------- */
const m = {
  img: modal.querySelector("[data-m-img]"),
  word: modal.querySelector("[data-m-word]"),
  tags: modal.querySelector("[data-m-tags]"),
  title: modal.querySelector("[data-m-title]"),
  desc: modal.querySelector("[data-m-desc]"),
  add: modal.querySelector("[data-m-add]"),
  wa: modal.querySelector("[data-m-wa]"),
  info: modal.querySelector("[data-m-info]"),
  related: modal.querySelector("[data-m-related]"),
  counter: modal.querySelector("[data-m-counter]"),
};

function navList() { return lastList.length ? lastList : PRODUCTS; }

function fillModal(slug, animate) {
  const p = PRODUCTS.find((x) => x.slug === slug);
  if (!p) return false;
  modal.dataset.slug = slug;
  m.img.src = p.img; m.img.alt = p.name;
  if (animate && !reduceMotion) { m.img.classList.remove("is-swapping"); void m.img.offsetWidth; m.img.classList.add("is-swapping"); }
  m.word.textContent = p.name.replace(/[⁺®™]/g, "").split(" ")[0].toUpperCase();
  m.tags.innerHTML = `<span>${CATEGORY_LABEL[p.category]}</span>${p.zone ? `<span>${ZONE_LABEL[p.zone]}</span>` : ""}`;
  m.title.textContent = p.name;
  m.desc.textContent = p.desc;
  m.add.dataset.add = p.slug;
  m.wa.href = waLink(`Hola MC Spine, me gustaría información sobre ${p.name}.`);
  m.info.href = `/contacto?producto=${p.slug}`;
  const list = navList();
  const idx = list.findIndex((x) => x.slug === slug);
  m.counter.textContent = idx >= 0 ? `${idx + 1} / ${list.length}` : "";
  const rel = PRODUCTS.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 3);
  m.related.innerHTML = rel.map((r) => `<button type="button" data-goto="${r.slug}"><img src="${r.img}" alt="" width="250" height="250" loading="lazy">${r.name}</button>`).join("");
  paintAddButtons(modal);
  return true;
}

function openModal(slug) {
  if (!fillModal(slug)) return;
  if (!modal.open) modal.showModal();
  modal.querySelector(".p-modal__body").scrollTop = 0;
  syncURL(slug);
}
function step(dir) {
  const list = navList();
  const idx = list.findIndex((x) => x.slug === modal.dataset.slug);
  const next = list[(idx + dir + list.length) % list.length];
  fillModal(next.slug, true);
  syncURL(next.slug);
}

grid.addEventListener("click", (e) => {
  if (e.target.closest("[data-add]")) return;
  const a = e.target.closest("[data-open]");
  if (!a) return;
  e.preventDefault();
  openModal(a.dataset.open);
});
modal.addEventListener("click", (e) => {
  if (e.target === modal || e.target.closest("[data-m-close]")) modal.close();
  const g = e.target.closest("[data-goto]");
  if (g) { fillModal(g.dataset.goto, true); syncURL(g.dataset.goto); modal.querySelector(".p-modal__body").scrollTop = 0; }
  const s = e.target.closest("[data-step]");
  if (s) step(+s.dataset.step);
});
modal.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
});
modal.addEventListener("close", () => { delete modal.dataset.slug; syncURL(null); });

// Deslizar en móvil para cambiar de producto
let sx = null;
const media = modal.querySelector(".p-modal__media");
media.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
media.addEventListener("touchend", (e) => {
  if (sx === null) return;
  const dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  sx = null;
});

render();
if (params.get("p")) openModal(params.get("p"));
quote.subscribe(() => paintAddButtons(modal));
