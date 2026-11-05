/* MC Spine · interacciones compartidas (sin dependencias) */
import { PRODUCTS, CATEGORY_LABEL, ZONE_LABEL } from "../data/products.js";
import { quote, initQuoteUI, toast, openQuote, waLink, mailLink, quoteMessage } from "./quote.js";
import { initPrefs } from "./prefs.js";

export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Header: estado al hacer scroll (IntersectionObserver, sin listener de scroll) ---------- */
function initHeader() {
  const sentinel = document.createElement("div");
  sentinel.style.cssText = "position:absolute;top:0;left:0;height:40px;width:1px;pointer-events:none";
  document.body.prepend(sentinel);
  new IntersectionObserver(([e]) => document.documentElement.classList.toggle("is-scrolled", !e.isIntersecting)).observe(sentinel);
}

/* ---------- Menú móvil ---------- */
function initMenu() {
  const menu = document.querySelector("[data-menu]");
  const openBtn = document.querySelector("[data-menu-open]");
  if (!menu || !openBtn) return;
  openBtn.addEventListener("click", () => { menu.showModal(); openBtn.setAttribute("aria-expanded", "true"); });
  menu.addEventListener("close", () => openBtn.setAttribute("aria-expanded", "false"));
  menu.addEventListener("click", (e) => {
    if (e.target.closest("[data-menu-close]") || e.target === menu) menu.close();
    if (e.target.closest("[data-quote-open], [data-prefs-open]")) menu.close();
  });
}

/* ---------- Aparición al entrar en pantalla ---------- */
export function initReveal(root = document) {
  root.querySelectorAll("[data-stagger]").forEach((g) => {
    [...g.children].forEach((c, i) => { if (!c.hasAttribute("data-reveal")) c.setAttribute("data-reveal", g.dataset.stagger || ""); c.style.setProperty("--d", `${i * 90}ms`); });
  });
  const els = root.querySelectorAll("[data-reveal]:not(.is-in)");
  if (!("IntersectionObserver" in window) || reduceMotion || document.documentElement.classList.contains("a11y-motion")) { els.forEach((el) => el.classList.add("is-in")); return; }
  // Los títulos con efecto "clip" no tienen área visible al inicio: se observa su contenedor
  const targetOf = (el) => (el.dataset.reveal === "clip" || el.dataset.reveal === "img" ? el.parentElement : el);
  const byTarget = new Map();
  els.forEach((el) => { const t = targetOf(el); if (!byTarget.has(t)) byTarget.set(t, []); byTarget.get(t).push(el); });
  const show = (t) => { (byTarget.get(t) || []).forEach((el) => el.classList.add("is-in")); io.unobserve(t); byTarget.delete(t); };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.isIntersecting && show(e.target));
    // Si el usuario saltó la sección (ancla, salto rápido), también se revela
    [...byTarget.keys()].forEach((t) => { if (t.getBoundingClientRect().bottom < 0) show(t); });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  byTarget.forEach((_, t) => io.observe(t));
}

/* ---------- Contadores ---------- */
function initCounters() {
  const els = document.querySelectorAll("[data-count]");
  if (!els.length) return;
  const run = (el) => {
    const target = +el.dataset.count;
    if (reduceMotion) { el.textContent = target; return; }
    const start = performance.now(), dur = 1600;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - t, 4)) * target);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
  }), { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
}

/* ---------- Botones "Cotizar" (delegado, cualquier página) ---------- */
export function paintAddButtons(root = document) {
  root.querySelectorAll("[data-add]").forEach((b) => {
    const on = quote.has(b.dataset.add);
    b.setAttribute("aria-pressed", String(on));
    const label = b.querySelector("[data-add-label]");
    const icon = b.querySelector("i");
    if (label) label.textContent = on ? (b.dataset.onLabel || "En lista") : (b.dataset.offLabel || "Cotizar");
    if (icon) icon.className = on ? "ph ph-check" : "ph ph-plus";
  });
}
function initAddButtons() {
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]");
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    const p = PRODUCTS.find((x) => x.slug === b.dataset.add);
    const added = quote.toggle(b.dataset.add);
    toast(added ? `${p.name} agregado a tu cotización` : `${p.name} quitado de tu cotización`,
      added ? { label: "Ver lista", onClick: openQuote } : { label: "Deshacer", onClick: () => quote.add(p.slug) });
  });
  paintAddButtons();
  quote.subscribe(() => paintAddButtons());
}

/* ---------- Tarjeta de producto reutilizable ---------- */
export function productCard(p, i = 0, highlight = (s) => s) {
  const zone = p.zone ? `<span>${ZONE_LABEL[p.zone]}</span>` : "";
  return `
  <article class="p-card" style="--i:${i}">
    <div class="p-card__media"><img src="${p.img}" alt="${p.name}" width="250" height="250" loading="lazy"></div>
    <div class="p-card__body">
      <div class="p-card__meta"><span>${CATEGORY_LABEL[p.category]}</span>${zone}</div>
      <h3><a class="p-card__open" href="/catalogo?p=${p.slug}" data-open="${p.slug}">${highlight(p.name)}</a></h3>
      <p>${highlight(p.desc)}</p>
      <div class="p-card__actions">
        <span class="p-card__more">Ver ficha<i class="ph ph-arrow-up-right"></i></span>
        <button class="add-btn" type="button" data-add="${p.slug}" aria-pressed="false"><i class="ph ph-plus"></i><span data-add-label>Cotizar</span></button>
      </div>
    </div>
  </article>`;
}

/* ============================================================
   INICIO
   ============================================================ */
const ZONE_COPY = {
  cervical: { title: "Columna cervical", text: "Placas, sistemas occipito-cervicales, mallas y sistemas intercorporales para la región cervical." },
  toracolumbar: { title: "Columna toracolumbar", text: "Sistemas de tornillos poliaxiales para estabilización de la región torácica y lumbar." },
  lumbar: { title: "Columna lumbar", text: "Cajas para fusión PLIF, TLIF, ALIF y lateral, disco artificial y espaciadores interespinosos." },
};

function initSpineExplorer() {
  const root = document.querySelector("[data-explorer]");
  if (!root) return;
  const svg = root.querySelector("[data-spine]");
  const panel = root.querySelector("[data-zone-panel]");
  const btns = root.querySelectorAll("[data-zone]");

  // Columna dibujada con el mismo motivo de vértebras del logotipo
  const groups = [
    { id: "cervical", n: 7, w: [20, 30], h: 10, gap: 5 },
    { id: "toracolumbar", n: 12, w: [32, 44], h: 13, gap: 5 },
    { id: "lumbar", n: 5, w: [48, 58], h: 19, gap: 6 },
  ];
  let y = 4, idx = 0, out = "";
  const total = 24;
  groups.forEach((g) => {
    out += `<g class="zone" data-zone-svg="${g.id}" role="presentation">`;
    for (let i = 0; i < g.n; i++) {
      const w = g.w[0] + ((g.w[1] - g.w[0]) * i) / Math.max(g.n - 1, 1);
      const x = 80 + Math.sin((idx / total) * Math.PI * 2 - 0.6) * 14 - w / 2;
      out += `<rect class="v" style="--i:${i}" x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${g.h}" rx="${g.h / 2}"/>`;
      y += g.h + g.gap; idx++;
    }
    out += "</g>";
    y += 6;
  });
  out += `<path class="v" d="M58 ${y} q22 6 44 0 l-8 34 q-14 12 -28 0z" style="fill:#d5dddf"/>`;
  svg.setAttribute("viewBox", `0 0 160 ${y + 40}`);
  svg.innerHTML = out;

  const select = (zone) => {
    btns.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.zone === zone)));
    svg.querySelectorAll(".zone").forEach((g) => g.classList.toggle("is-active", g.dataset.zoneSvg === zone));
    const items = PRODUCTS.filter((p) => p.zone === zone);
    const c = ZONE_COPY[zone];
    panel.innerHTML = `
      <div class="zone-panel__head">
        <div><h3 class="h3">${c.title}</h3><p>${c.text}</p></div>
        <a class="btn btn--ghost btn--sm" href="/catalogo?zona=${zone}">Ver ${items.length} en catálogo<i class="ph ph-arrow-up-right"></i></a>
      </div>
      <div class="zone-products">
        ${items.slice(0, 6).map((p, i) => `
          <a class="mini-card" style="--i:${i}" href="/catalogo?p=${p.slug}">
            <span class="mini-card__img"><img src="${p.img}" alt="" width="250" height="250" loading="lazy"></span>
            <span><strong>${p.name}</strong><small>${CATEGORY_LABEL[p.category]}</small></span>
          </a>`).join("")}
      </div>`;
  };
  btns.forEach((b) => b.addEventListener("click", () => select(b.dataset.zone)));
  svg.addEventListener("click", (e) => { const g = e.target.closest("[data-zone-svg]"); if (g) select(g.dataset.zoneSvg); });
  // Navegación con flechas entre pestañas
  root.querySelector("[role=tablist]").addEventListener("keydown", (e) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key)) return;
    e.preventDefault();
    const arr = [...btns];
    const cur = arr.findIndex((b) => b.getAttribute("aria-selected") === "true");
    const next = arr[(cur + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1) + arr.length) % arr.length];
    next.focus(); select(next.dataset.zone);
  });
  select("cervical");
}

// Anotaciones tomadas de la descripción de cada producto (sin datos inventados)
const TECH = [
  {
    slug: "tornillo-transpedicular", word: "PRECISIÓN",
    left: [["Autorroscante", "Pensado para una inserción rápida."], ["Cabeza poliaxial", "Diseño especial en la cabeza del tornillo."]],
    right: [["Estabilidad angular", "Una fijación angular más firme."]],
  },
  {
    slug: "roi-a", word: "ANCLAJE",
    left: [["Perfil cero", "Ningún componente sobresale por delante de los cuerpos vertebrales."], ["Sin placa anterior", "Su anclaje evita el uso de placa o tornillo."]],
    right: [["Jaula ALIF", "Con un sistema de anclaje innovador."]],
  },
  {
    slug: "mobi-c2", word: "MOVILIDAD",
    left: [["Segunda generación", "Disco artificial de diseño avanzado."], ["Diseñado por cirujanos", "Creado por especialistas en ortopedia espinal."]],
    right: [["Implantación patentada", "Un sistema único y fiable."]],
  },
];

function initTech() {
  const root = document.querySelector("[data-tech]");
  if (!root) return;
  const img = root.querySelector("[data-tech-img]");
  const word = root.querySelector("[data-tech-word]");
  const name = root.querySelector("[data-tech-name]");
  const left = root.querySelector("[data-tech-left]");
  const right = root.querySelector("[data-tech-right]");
  const link = root.querySelector("[data-tech-link]");
  const tabs = root.querySelectorAll("[data-tech-tab]");
  const co = (arr) => arr.map(([t, d]) => `<div class="callout"><b>${t}</b><p>${d}</p></div>`).join("");
  let current = -1, timer;

  const show = (i, user) => {
    if (i === current) return;
    current = i;
    const t = TECH[i];
    const p = PRODUCTS.find((x) => x.slug === t.slug);
    tabs.forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
    const swapping = [img, ...left.children, ...right.children];
    swapping.forEach((el) => el.classList.add("is-swapping"));
    setTimeout(() => {
      img.src = p.img; img.alt = p.name;
      word.textContent = t.word;
      name.textContent = p.name;
      link.href = `/catalogo?p=${p.slug}`;
      left.innerHTML = co(t.left); right.innerHTML = co(t.right);
      [...left.children, ...right.children].forEach((el) => el.classList.add("is-swapping"));
      requestAnimationFrame(() => requestAnimationFrame(() => {
        img.classList.remove("is-swapping");
        [...left.children, ...right.children].forEach((el, k) => { el.style.transitionDelay = `${k * 70}ms`; el.classList.remove("is-swapping"); });
      }));
    }, current === -1 || reduceMotion ? 0 : 380);
    if (user) clearInterval(timer);
  };
  tabs.forEach((b, i) => b.addEventListener("click", () => show(i, true)));
  show(0);
  // Rota solo mientras está visible y el usuario no ha elegido
  if (!reduceMotion) {
    let auto = true;
    tabs.forEach((b) => b.addEventListener("click", () => { auto = false; }));
    new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting && auto) timer = setInterval(() => show((current + 1) % TECH.length), 6000);
    }, { threshold: 0.4 }).observe(root);
  }
}

function initRail() {
  const rail = document.querySelector("[data-rail]");
  if (!rail) return;
  const featured = ["mobi-c2", "roi-a", "tornillo-transpedicular", "avenue-l", "c-plate", "adonis-tlif", "venus6t", "inswing", "placa-cervical-anterior"];
  rail.innerHTML = featured.map((s, i) => productCard(PRODUCTS.find((p) => p.slug === s), i)).join("");
  paintAddButtons(rail);
  document.querySelectorAll("[data-rail-dir]").forEach((b) => b.addEventListener("click", () => {
    rail.scrollBy({ left: +b.dataset.railDir * (rail.clientWidth * 0.8), behavior: reduceMotion ? "auto" : "smooth" });
  }));
}

/* ============================================================
   CONTACTO
   ============================================================ */
function initContact() {
  const form = document.querySelector("[data-contact]");
  if (!form) return;
  const box = form.querySelector("[data-form-products]");
  const paintProducts = () => {
    const ps = quote.products;
    box.classList.toggle("is-visible", ps.length > 0);
    box.innerHTML = ps.length ? `<b>Productos de tu cotización</b>${ps.map((p) => `<span>${p.name}</span>`).join("")}` : "";
  };
  paintProducts();
  quote.subscribe(paintProducts);

  const params = new URLSearchParams(location.search);
  if (params.has("cotizacion") && quote.items.length) form.asunto.value = "Solicitud de cotización";
  if (params.get("producto")) {
    const p = PRODUCTS.find((x) => x.slug === params.get("producto"));
    if (p) form.asunto.value = `Información sobre ${p.name}`;
  }

  const validate = (field) => {
    const wrap = field.closest(".field");
    const ok = field.checkValidity();
    wrap.classList.toggle("is-invalid", !ok);
    field.setAttribute("aria-invalid", String(!ok));
    return ok;
  };
  form.querySelectorAll("input[required], textarea[required], input[type=email]").forEach((f) => {
    f.addEventListener("blur", () => f.value && validate(f));
    f.addEventListener("input", () => f.closest(".field").classList.contains("is-invalid") && validate(f));
  });

  const build = () => {
    const d = new FormData(form);
    const lines = [
      d.get("mensaje"),
      "",
      `Nombre: ${d.get("nombre")}`,
      d.get("institucion") ? `Institución: ${d.get("institucion")}` : "",
      `Correo: ${d.get("correo")}`,
      d.get("telefono") ? `Teléfono: ${d.get("telefono")}` : "",
    ].filter((l) => l !== "");
    if (quote.items.length) lines.push("", "Productos de interés:", ...quote.products.map((p) => `• ${p.name}`));
    return { subject: d.get("asunto") || "Contacto desde el sitio web", body: lines.join("\n") };
  };
  const check = () => {
    const fields = [...form.querySelectorAll("input, textarea")].filter((f) => f.required || f.type === "email");
    const bad = fields.filter((f) => !validate(f));
    if (bad.length) { bad[0].focus(); return false; }
    return true;
  };
  const done = () => {
    const s = form.querySelector("[data-form-status]");
    s.classList.add("is-visible");
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!check()) return;
    const { subject, body } = build();
    location.href = mailLink(subject, body);
    done();
  });
  form.querySelector("[data-send-wa]").addEventListener("click", () => {
    if (!check()) return;
    const { subject, body } = build();
    window.open(waLink(`${subject}\n\n${body}`), "_blank", "noopener");
    done();
  });
}

/* ============================================================
   LEGAL: índice lateral
   ============================================================ */
function initLegalToc() {
  const toc = document.querySelector("[data-toc]");
  const article = document.querySelector(".legal-content");
  if (!toc || !article) return;
  const heads = [...article.querySelectorAll("h2")];
  heads.forEach((h, i) => { h.id = h.id || `s${i + 1}`; });
  toc.insertAdjacentHTML("beforeend", heads.map((h) => `<a href="#${h.id}">${h.textContent.replace(/^[IVXLC]+\.\s*/, "")}</a>`).join(""));
  const links = toc.querySelectorAll("a");
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle("is-current", a.hash === `#${e.target.id}`));
  }), { rootMargin: "-20% 0px -70% 0px" });
  heads.forEach((h) => io.observe(h));
}

/* ---------- Preloader (una vez por sesión) ---------- */
function runPreloader() {
  const el = document.querySelector("[data-preloader]");
  const root = document.documentElement;
  if (!el || root.classList.contains("pl-seen")) { el?.remove(); return Promise.resolve(); }
  const minTime = reduceMotion ? 300 : 1700;
  const loaded = new Promise((r) => (document.readyState === "complete" ? r() : window.addEventListener("load", r, { once: true })));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  return Promise.race([Promise.all([loaded, wait(minTime)]), wait(4000)]).then(() => {
    el.classList.add("is-done");
    try { sessionStorage.setItem("mc-pl", "1"); } catch { /* sin almacenamiento */ }
    setTimeout(() => el.remove(), 1100);
    return wait(reduceMotion ? 0 : 350);
  });
}

/* ---------- Arranque ---------- */
function safe(fn) { try { fn(); } catch (err) { console.warn("[MC Spine]", fn.name, err); } }
[initPrefs, initHeader, initMenu, initQuoteUI, initAddButtons, initSpineExplorer, initTech, initRail, initContact, initLegalToc].forEach(safe);
// Las animaciones de entrada arrancan cuando el preloader se retira
runPreloader().then(() => {
  window.__mcReady = true;
  window.dispatchEvent(new Event("mc:ready"));
  [initReveal, initCounters].forEach(safe);
});

export { quoteMessage };
