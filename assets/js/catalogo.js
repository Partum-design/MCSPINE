/* MC Spine · Catálogo: columna de zonas anatómicas, subcategorías, marcas destacadas,
   búsqueda, estado en URL y ficha de producto */
import { PRODUCTS, SUBCATEGORIES, SUB_LABEL, CATEGORY_LABEL, ZONES, ZONE_LABEL, FEATURED_BRANDS, isFeaturedBrand, brandInfo } from "../data/products.js";
import { productCard, paintAddButtons, reduceMotion } from "./main.js";
import { quote, waLink } from "./quote.js";
import { EN } from "../data/i18n-en.js";

const grid = document.querySelector("[data-grid]");
const chipsBox = document.querySelector("[data-chips]");
const zoneCol = document.querySelector("[data-zone-col]");
const brandsBox = document.querySelector("[data-brands]");
const sortSel = document.querySelector("[data-sort]");
const search = document.querySelector("[data-search]");
const searchWrap = search.closest(".search");
const status = document.querySelector("[data-status]");
const modal = document.querySelector("[data-modal]");

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- Estado (con compatibilidad para enlaces anteriores) ---------- */
const params = new URLSearchParams(location.search);
const LEGACY_ZONE = { toracolumbar: "toracica" };
const zoneParam = LEGACY_ZONE[params.get("zona")] || params.get("zona");
const state = {
  zone: ZONES.some((z) => z.id === zoneParam) ? zoneParam : "all",
  sub: SUBCATEGORIES.some((c) => c.id === params.get("sub")) ? params.get("sub") : "all",
  brand: PRODUCTS.some((p) => p.brand === params.get("marca")) ? params.get("marca") : "",
  q: params.get("q") || "",
  sort: params.get("orden") === "az" ? "az" : "default",
};

// Peter Brehm y Medacta primero; el resto conserva el orden del catálogo
const rank = (p) => (isFeaturedBrand(p.brand) ? 0 : 1);
const byRecommended = (a, b) => rank(a) - rank(b) || PRODUCTS.indexOf(a) - PRODUCTS.indexOf(b);

/* ---------- Filtro ---------- */
function matches(p, { zone = state.zone, sub = state.sub, brand = state.brand, q = state.q } = {}) {
  if (zone !== "all" && !p.zones.includes(zone)) return false;
  if (sub !== "all" && p.sub !== sub) return false;
  if (brand && p.brand !== brand) return false;
  const terms = norm(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const fields = [p.name, p.desc, ...(p.features || []), CATEGORY_LABEL[p.category], SUB_LABEL[p.sub], ...p.zones.map((z) => ZONE_LABEL[z])];
  const es = `${fields.join(" ")} ${p.brand || ""}`;
  const en = fields.map((x) => (x && EN[x]) || "").join(" ");
  const hay = norm(`${es} ${en}`);
  return terms.every((tm) => hay.includes(tm));
}
function filtered() {
  const list = PRODUCTS.filter((p) => matches(p));
  return state.sort === "az" ? list.sort((a, b) => a.name.localeCompare(b.name, "es")) : list.sort(byRecommended);
}

/* ---------- Controles ---------- */
function renderZones() {
  const count = (id) => PRODUCTS.filter((p) => matches(p, { zone: id })).length;
  const item = (id, label, levels, i) => `
    <button class="zone-col__btn" type="button" data-zone="${id}" aria-pressed="${state.zone === id}">
      <span class="zone-col__idx" aria-hidden="true">${i}</span>
      <span class="zone-col__txt"><strong>${label}</strong><small>${levels}</small></span>
      <span class="zone-col__count">${count(id)}</span>
    </button>`;
  zoneCol.innerHTML =
    item("all", "Todas las zonas", "Catálogo completo", "00") +
    ZONES.map((z, i) => item(z.id, z.label, z.levels, String(i + 1).padStart(2, "0"))).join("");
  // En celular la columna es una fila deslizable: deja la zona activa a la vista
  const on = zoneCol.querySelector('[aria-pressed="true"]');
  if (on && zoneCol.scrollWidth > zoneCol.clientWidth) zoneCol.scrollLeft = on.offsetLeft - zoneCol.offsetLeft - 8;
}
function renderChips() {
  const count = (id) => PRODUCTS.filter((p) => matches(p, { sub: id })).length;
  chipsBox.innerHTML = SUBCATEGORIES.map((c) => `
    <button class="chip" type="button" data-sub="${c.id}" aria-pressed="${state.sub === c.id}">
      ${c.label}<span class="count">${count(c.id)}</span>
    </button>`).join("");
}
function renderBrands() {
  brandsBox.innerHTML = FEATURED_BRANDS.map((b) => {
    const n = PRODUCTS.filter((p) => p.brand === b.name).length;
    return `
    <button class="brand-card" type="button" data-brand="${esc(b.name)}" aria-pressed="${state.brand === b.name}" aria-label="${esc(b.name)}: ver ${n} ${n === 1 ? "producto" : "productos"}">
      <img src="${b.logo}" alt="" width="${b.w}" height="${b.h}">
      <span class="brand-card__meta"><span data-no-i18n>${esc(b.name)}</span><small>${n} ${n === 1 ? "producto" : "productos"}</small></span>
    </button>`;
  }).join("");
}
sortSel.value = state.sort;
search.value = state.q;

/* ---------- Resaltado de la búsqueda ---------- */
function highlighter() {
  const terms = norm(state.q).split(/\s+/).filter((x) => x.length > 1);
  if (!terms.length) return esc;
  return (text) => {
    // Resalta respetando acentos: compara sobre la versión normalizada
    const n = norm(text);
    const marks = new Array(text.length).fill(false);
    terms.forEach((tm) => { let i = n.indexOf(tm); while (i !== -1) { for (let k = i; k < i + tm.length; k++) marks[k] = true; i = n.indexOf(tm, i + tm.length); } });
    let out = "", open = false;
    [...text].forEach((ch, i) => {
      if (marks[i] && !open) { out += "<mark>"; open = true; }
      if (!marks[i] && open) { out += "</mark>"; open = false; }
      out += esc(ch);
    });
    return open ? out + "</mark>" : out;
  };
}

/* ---------- Render ---------- */
let lastList = [];
function render() {
  const list = filtered();
  const hl = highlighter();
  let html;
  if (!list.length) {
    lastList = [];
    html = `<div class="empty">
        <i class="ph ph-magnifying-glass"></i>
        <h3>Sin resultados</h3>
        <p>No encontramos productos con esos filtros. Prueba otra palabra o consulta directamente a nuestro equipo.</p>
        <button class="btn btn--sm" type="button" data-reset>Limpiar filtros</button>
      </div>`;
  } else if (state.zone === "all" && state.sort === "default") {
    // Organizado por zona anatómica: cada producto aparece en su zona principal
    const groups = ZONES.map((z) => ({ z, items: list.filter((p) => p.zones[0] === z.id) })).filter((g) => g.items.length);
    lastList = groups.flatMap((g) => g.items);
    let i = 0;
    html = groups.map(({ z, items }) => `
      <section class="zone-group" aria-labelledby="zg-${z.id}">
        <header class="zone-group__head">
          <h2 id="zg-${z.id}">${z.label}</h2><span class="zone-group__levels">${z.levels}</span>
          <button class="link-btn" type="button" data-zone="${z.id}">Ver solo esta zona</button>
        </header>
        <div class="product-grid">${items.map((p) => productCard(p, Math.min(i++, 12), hl)).join("")}</div>
      </section>`).join("");
  } else {
    lastList = list;
    html = `<div class="product-grid">${list.map((p, i) => productCard(p, Math.min(i, 12), hl)).join("")}</div>`;
  }
  grid.innerHTML = html;
  paintAddButtons(grid);
  const filtersOn = state.sub !== "all" || state.zone !== "all" || state.brand || state.q;
  status.innerHTML = `<span>Mostrando <strong>${list.length}</strong> de ${PRODUCTS.length} productos</span>${filtersOn ? `<button class="link-btn" type="button" data-reset>Limpiar filtros</button>` : ""}`;
  renderZones();
  renderChips();
  renderBrands();
  searchWrap.classList.toggle("has-value", !!state.q);
  syncURL();
}

function syncURL(slug) {
  const u = new URLSearchParams();
  if (state.zone !== "all") u.set("zona", state.zone);
  if (state.sub !== "all") u.set("sub", state.sub);
  if (state.brand) u.set("marca", state.brand);
  if (state.q) u.set("q", state.q);
  if (state.sort !== "default") u.set("orden", "az");
  const open = slug === undefined ? (modal.open ? modal.dataset.slug : null) : slug;
  if (open) u.set("p", open);
  const qs = u.toString();
  history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
}

/* ---------- Eventos ---------- */
const scrollToResults = () => {
  const top = status.getBoundingClientRect().top + window.scrollY - 110;
  if (window.scrollY > top) window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
};
document.addEventListener("click", (e) => {
  const z = e.target.closest("[data-zone]");
  if (z && !modal.contains(z)) { state.zone = z.dataset.zone; render(); scrollToResults(); return; }
  const c = e.target.closest("[data-sub]");
  if (c) { state.sub = c.dataset.sub; render(); return; }
  const b = e.target.closest("[data-brand]");
  if (b) { state.brand = state.brand === b.dataset.brand ? "" : b.dataset.brand; render(); return; }
  if (e.target.closest("[data-reset]")) {
    Object.assign(state, { sub: "all", zone: "all", brand: "", q: "" });
    search.value = "";
    render();
  }
});
sortSel.addEventListener("change", () => { state.sort = sortSel.value; render(); });
let timer;
search.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => { state.q = search.value.trim(); render(); }, 140); });
searchWrap.querySelector(".search__clear").addEventListener("click", () => { search.value = ""; state.q = ""; render(); search.focus(); });
document.addEventListener("keydown", (e) => {
  const typing = /input|textarea|select/i.test(document.activeElement.tagName);
  if (e.key === "/" && !typing && !modal.open) { e.preventDefault(); search.focus(); }
});

/* ---------- Ficha de producto ---------- */
const m = {
  img: modal.querySelector("[data-m-img]"),
  word: modal.querySelector("[data-m-word]"),
  brand: modal.querySelector("[data-m-brand]"),
  tags: modal.querySelector("[data-m-tags]"),
  title: modal.querySelector("[data-m-title]"),
  desc: modal.querySelector("[data-m-desc]"),
  features: modal.querySelector("[data-m-features]"),
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
  const bi = brandInfo(p.brand);
  m.brand.innerHTML = bi ? `<img src="${bi.logo}" alt="${esc(p.brand)}" width="${bi.w}" height="${bi.h}">` : "";
  m.brand.hidden = !bi;
  m.tags.innerHTML = `${p.brand ? `<span class="tag-brand" data-no-i18n>${esc(p.brand)}</span>` : ""}<span>${SUB_LABEL[p.sub]}</span><span>${CATEGORY_LABEL[p.category]}</span>${p.zones.map((z) => `<span class="tag-zone">${ZONE_LABEL[z]}</span>`).join("")}`;
  m.title.textContent = p.name;
  m.desc.textContent = p.desc;
  m.features.innerHTML = (p.features || []).map((f) => `<li><i class="ph ph-caret-right" aria-hidden="true"></i><span>${esc(f)}</span></li>`).join("");
  m.features.hidden = !p.features?.length;
  m.add.dataset.add = p.slug;
  m.wa.href = waLink(`Hola MC Spine, me gustaría información sobre ${p.name}.`);
  m.info.href = `/contacto?producto=${p.slug}`;
  const list = navList();
  const idx = list.findIndex((x) => x.slug === slug);
  m.counter.textContent = idx >= 0 ? `${idx + 1} / ${list.length}` : "";
  // Relacionados: misma zona principal y subcategoría; si faltan, mismo tipo de producto
  const rel = [
    ...PRODUCTS.filter((x) => x.slug !== p.slug && x.zones[0] === p.zones[0] && x.sub === p.sub),
    ...PRODUCTS.filter((x) => x.slug !== p.slug && x.category === p.category),
  ].filter((x, i, a) => a.indexOf(x) === i).sort(byRecommended).slice(0, 3);
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
