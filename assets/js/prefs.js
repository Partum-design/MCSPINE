/* MC Spine · Preferencias: idioma y accesibilidad
   Se guardan en localStorage. Un script en <head> aplica las clases antes de pintar. */
import { setLang, getLang } from "./i18n.js";

const KEY = "mc-prefs";
const DEFAULTS = { lang: "es", text: 0, contrast: false, motion: false, links: false, font: false };
let prefs = { ...DEFAULTS };
try { prefs = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { /* sin almacenamiento */ }

const root = document.documentElement;
function save() { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* sin almacenamiento */ } }

function apply() {
  root.classList.remove("a11y-text-1", "a11y-text-2");
  if (prefs.text > 0) root.classList.add(`a11y-text-${prefs.text}`);
  root.classList.toggle("a11y-contrast", prefs.contrast);
  root.classList.toggle("a11y-motion", prefs.motion);
  root.classList.toggle("a11y-links", prefs.links);
  root.classList.toggle("a11y-font", prefs.font);
  if (prefs.font && !document.getElementById("font-legible")) {
    const l = document.createElement("link");
    l.id = "font-legible"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap";
    document.head.appendChild(l);
  }
  if (prefs.motion) document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
  window.dispatchEvent(new Event("mc:a11y"));
  paint();
}

/* ---------- Panel ---------- */
let panel;
function build() {
  panel = document.createElement("dialog");
  panel.className = "a11y-panel";
  panel.setAttribute("aria-labelledby", "a11y-title");
  panel.innerHTML = `
    <div class="a11y-panel__inner">
      <div class="a11y-panel__head">
        <div><h2 id="a11y-title">Preferencias</h2><p>Idioma y accesibilidad</p></div>
        <button class="btn btn--ghost btn--icon btn--sm" type="button" data-p-close aria-label="Cerrar"><i class="ph ph-x"></i></button>
      </div>
      <div class="a11y-group">
        <span class="a11y-label"><i class="ph ph-translate"></i>Idioma</span>
        <div class="seg" role="group" aria-label="Idioma">
          <button type="button" data-lang="es" lang="es">Español</button>
          <button type="button" data-lang="en" lang="en">English</button>
        </div>
      </div>
      <div class="a11y-group">
        <span class="a11y-label"><i class="ph ph-text-aa"></i>Tamaño de texto</span>
        <div class="seg" role="group" aria-label="Tamaño de texto">
          <button type="button" data-text="0" aria-label="Normal">A</button>
          <button type="button" data-text="1" aria-label="Grande" style="font-size:1.1em">A</button>
          <button type="button" data-text="2" aria-label="Muy grande" style="font-size:1.25em">A</button>
        </div>
      </div>
      <div class="a11y-toggles">
        ${toggle("contrast", "ph-circle-half", "Alto contraste")}
        ${toggle("motion", "ph-pause-circle", "Reducir animaciones")}
        ${toggle("links", "ph-link-simple", "Subrayar enlaces")}
        ${toggle("font", "ph-text-t", "Fuente legible")}
      </div>
      <button class="btn btn--ghost btn--block" type="button" data-p-reset><i class="ph ph-arrow-counter-clockwise"></i>Restablecer</button>
    </div>`;
  document.body.appendChild(panel);
  panel.addEventListener("click", (e) => {
    if (e.target === panel || e.target.closest("[data-p-close]")) panel.close();
    const l = e.target.closest("[data-lang]");
    if (l) changeLang(l.dataset.lang);
    const t = e.target.closest("[data-text]");
    if (t) { prefs.text = +t.dataset.text; save(); apply(); }
    const sw = e.target.closest("[data-toggle]");
    if (sw) { const k = sw.dataset.toggle; prefs[k] = !prefs[k]; save(); apply(); }
    if (e.target.closest("[data-p-reset]")) { prefs = { ...DEFAULTS, lang: prefs.lang }; save(); apply(); }
  });
  paint();
}
function toggle(key, icon, label) {
  return `<button class="switch" type="button" role="switch" data-toggle="${key}" aria-checked="false"><span class="switch__l"><i class="ph ${icon}"></i>${label}</span><span class="switch__track"><span></span></span></button>`;
}
function paint() {
  document.querySelectorAll("[data-lang-current]").forEach((el) => { el.textContent = prefs.lang.toUpperCase(); });
  if (!panel) return;
  panel.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === prefs.lang)));
  panel.querySelectorAll("[data-text]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.text === prefs.text)));
  panel.querySelectorAll("[data-toggle]").forEach((b) => b.setAttribute("aria-checked", String(!!prefs[b.dataset.toggle])));
}

function changeLang(lang) {
  prefs.lang = lang === "en" ? "en" : "es";
  save();
  setLang(prefs.lang);
  paint();
}

export function openPrefs() {
  if (!panel) build();
  if (!panel.open) panel.showModal();
}

export function initPrefs() {
  apply();
  if (prefs.lang !== "es") setLang(prefs.lang);
  document.querySelectorAll("[data-prefs-open]").forEach((b) => b.addEventListener("click", openPrefs));
  document.querySelectorAll("[data-lang-toggle]").forEach((b) => b.addEventListener("click", () => changeLang(getLang() === "es" ? "en" : "es")));
}
