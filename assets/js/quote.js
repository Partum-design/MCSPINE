/* MC Spine · Lista de cotización
   Se guarda en localStorage y se comparte entre páginas.
   Se envía por WhatsApp o por correo, o se lleva al formulario de contacto. */
import { PRODUCTS, CATEGORY_LABEL } from "../data/products.js";

const KEY = "mcspine:quote";
const WA_NUMBER = "525543676490";
const EMAIL = "info@mcspine.mx";
const listeners = new Set();

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((s) => PRODUCTS.some((p) => p.slug === s)) : [];
  } catch { return []; }
}
let items = read();

function write() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* modo privado: solo en memoria */ }
  listeners.forEach((fn) => fn(items));
}

export const quote = {
  get items() { return [...items]; },
  get products() { return items.map((s) => PRODUCTS.find((p) => p.slug === s)).filter(Boolean); },
  has: (slug) => items.includes(slug),
  add(slug) { if (!items.includes(slug)) { items.push(slug); write(); } },
  remove(slug) { items = items.filter((s) => s !== slug); write(); },
  toggle(slug) { quote.has(slug) ? quote.remove(slug) : quote.add(slug); return quote.has(slug); },
  clear() { items = []; write(); },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
};

// Sincroniza entre pestañas
window.addEventListener("storage", (e) => { if (e.key === KEY) { items = read(); listeners.forEach((fn) => fn(items)); } });

export function quoteMessage({ name = "", org = "" } = {}) {
  const lines = ["Hola MC Spine, me gustaría solicitar una cotización de:"];
  quote.products.forEach((p) => lines.push(`• ${p.name} (${CATEGORY_LABEL[p.category]})`));
  if (name || org) lines.push("", [name, org].filter(Boolean).join(", "));
  return lines.join("\n");
}

export function waLink(text) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}
export function mailLink(subject, body) {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/* ---------- Toast ---------- */
let toastWrap;
export function toast(message, action) {
  if (!toastWrap) {
    toastWrap = document.createElement("div");
    toastWrap.className = "toast-wrap";
    toastWrap.setAttribute("role", "status");
    toastWrap.setAttribute("aria-live", "polite");
    document.body.appendChild(toastWrap);
  }
  toastWrap.querySelectorAll(".toast").forEach((t) => t.remove());
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<span>${message}</span>`;
  if (action) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = action.label;
    b.addEventListener("click", () => { action.onClick(); dismiss(); });
    el.appendChild(b);
  }
  toastWrap.appendChild(el);
  const dismiss = () => { el.classList.add("is-out"); setTimeout(() => el.remove(), 350); };
  setTimeout(dismiss, 3800);
}

/* ---------- Drawer ---------- */
let drawer;
function buildDrawer() {
  drawer = document.createElement("dialog");
  drawer.className = "drawer";
  drawer.setAttribute("aria-labelledby", "quote-title");
  drawer.innerHTML = `
    <div class="drawer__panel">
      <div class="drawer__head">
        <div>
          <h2 id="quote-title">Tu cotización</h2>
          <p data-q-summary></p>
        </div>
        <button class="btn btn--ghost btn--icon btn--sm" type="button" data-q-close aria-label="Cerrar"><i class="ph ph-x"></i></button>
      </div>
      <div class="drawer__body" data-q-list></div>
      <form class="drawer__foot" data-q-form>
        <div class="row">
          <div class="field"><label for="q-name">Nombre <span class="opt">(opcional)</span></label><input id="q-name" name="name" autocomplete="name" placeholder="Dr. Ramírez"></div>
          <div class="field"><label for="q-org">Institución <span class="opt">(opcional)</span></label><input id="q-org" name="org" autocomplete="organization" placeholder="Hospital"></div>
        </div>
        <button class="btn btn--accent btn--block" type="submit" data-q-wa><i class="ph ph-whatsapp-logo"></i>Enviar por WhatsApp</button>
        <div class="row">
          <a class="btn btn--ghost btn--sm" data-q-mail href="#"><i class="ph ph-envelope-simple"></i>Por correo</a>
          <a class="btn btn--ghost btn--sm" href="/contacto?cotizacion=1"><i class="ph ph-note-pencil"></i>Formulario</a>
        </div>
        <button class="drawer__clear" type="button" data-q-clear>Vaciar lista</button>
      </form>
    </div>`;
  document.body.appendChild(drawer);

  drawer.addEventListener("click", (e) => {
    if (e.target === drawer || e.target.closest("[data-q-close]")) drawer.close();
    const rm = e.target.closest("[data-q-remove]");
    if (rm) quote.remove(rm.dataset.qRemove);
  });
  drawer.querySelector("[data-q-clear]").addEventListener("click", () => {
    const backup = quote.items;
    quote.clear();
    toast("Lista vaciada", { label: "Deshacer", onClick: () => backup.forEach(quote.add) });
  });
  const form = drawer.querySelector("[data-q-form]");
  const fields = () => ({ name: form.name.value.trim(), org: form.org.value.trim() });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    window.open(waLink(quoteMessage(fields())), "_blank", "noopener");
  });
  drawer.querySelector("[data-q-mail]").addEventListener("click", (e) => {
    e.currentTarget.href = mailLink("Solicitud de cotización", quoteMessage(fields()));
  });
  renderDrawer();
  quote.subscribe(renderDrawer);
}

function renderDrawer() {
  if (!drawer) return;
  const list = drawer.querySelector("[data-q-list]");
  const foot = drawer.querySelector("[data-q-form]");
  const products = quote.products;
  drawer.querySelector("[data-q-summary]").textContent = products.length
    ? (products.length === 1 ? "1 producto seleccionado" : `${products.length} productos seleccionados`)
    : "Agrega productos desde el catálogo";
  foot.hidden = products.length === 0;
  list.innerHTML = products.length
    ? products.map((p) => `
      <div class="q-item">
        <span class="q-item__img"><img src="${p.img}" alt="" width="56" height="56" loading="lazy"></span>
        <div><strong>${p.name}</strong><small>${CATEGORY_LABEL[p.category]}</small></div>
        <button type="button" data-q-remove="${p.slug}" aria-label="Quitar ${p.name}"><i class="ph ph-trash"></i></button>
      </div>`).join("")
    : `<div class="drawer__empty">
        <i class="ph ph-clipboard-text"></i>
        <p>Tu lista está vacía. Marca los productos que te interesan y envíanos la solicitud en un solo mensaje.</p>
        <a class="btn btn--sm" href="/catalogo">Ver catálogo<i class="ph ph-arrow-up-right"></i></a>
      </div>`;
}

export function openQuote() {
  if (!drawer) buildDrawer();
  if (!drawer.open) drawer.showModal();
}

/* ---------- Badges en header ---------- */
export function initQuoteUI() {
  const badges = document.querySelectorAll("[data-quote-count]");
  const paint = (bump) => badges.forEach((b) => {
    const n = quote.items.length;
    b.textContent = n;
    b.classList.toggle("has-items", n > 0);
    if (bump && n > 0) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
  });
  paint(false);
  quote.subscribe(() => paint(true));
  document.querySelectorAll("[data-quote-open]").forEach((b) => b.addEventListener("click", openQuote));
}
