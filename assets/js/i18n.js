/* MC Spine · Traducción ES/EN en el cliente
   El HTML está en español. En inglés se reemplazan los textos con el diccionario
   (incluido el contenido que se agrega después, como tarjetas o avisos) y se
   pueden restaurar sin recargar. Los textos legales se mantienen en español. */
import { EN, PATTERNS } from "../data/i18n-en.js";

const ATTRS = ["placeholder", "aria-label", "alt", "title"];
const origText = new WeakMap();
const origAttr = new WeakMap();
let lang = "es";
const origTitle = document.title;

function lookup(s) {
  if (!s) return null;
  if (Object.prototype.hasOwnProperty.call(EN, s)) return EN[s];
  for (const [re, rep] of PATTERNS) if (re.test(s)) return s.replace(re, rep);
  return null;
}
function translateKeepSpace(s) {
  const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
  const tr = lookup(m[2]);
  return tr === null ? null : m[1] + tr + m[3];
}
const skip = (el) => !el || el.closest("script, style, [data-no-i18n]");

function processText(node) {
  if (skip(node.parentElement)) return;
  if (lang === "en") {
    if (!origText.has(node)) origText.set(node, node.nodeValue);
    const tr = translateKeepSpace(origText.get(node));
    if (tr !== null && node.nodeValue !== tr) node.nodeValue = tr;
  } else if (origText.has(node)) {
    const o = origText.get(node);
    if (node.nodeValue !== o) node.nodeValue = o;
  }
}
function processAttrs(el) {
  if (skip(el)) return;
  for (const a of ATTRS) {
    if (!el.hasAttribute(a)) continue;
    let store = origAttr.get(el);
    if (lang === "en") {
      if (!store) { store = {}; origAttr.set(el, store); }
      if (!(a in store)) store[a] = el.getAttribute(a);
      const tr = lookup(store[a].trim());
      if (tr !== null) el.setAttribute(a, tr);
    } else if (store && a in store) {
      el.setAttribute(a, store[a]);
    }
  }
}
function walk(root) {
  if (root.nodeType === 3) { processText(root); return; }
  if (root.nodeType !== 1) return;
  processAttrs(root);
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n;
  while ((n = tw.nextNode())) n.nodeType === 3 ? processText(n) : processAttrs(n);
}

let observer;
function observe() {
  if (observer) return;
  observer = new MutationObserver((muts) => {
    if (lang !== "en") return;
    for (const m of muts) m.addedNodes.forEach((n) => walk(n));
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

export function getLang() { return lang; }
export function t(s) { return lang === "en" ? (lookup(s) ?? s) : s; }

export function setLang(next) {
  lang = next === "en" ? "en" : "es";
  document.documentElement.lang = lang === "en" ? "en" : "es-MX";
  document.title = lang === "en" ? (lookup(origTitle) ?? origTitle) : origTitle;
  walk(document.body);
  observe();
  document.documentElement.classList.toggle("lang-en", lang === "en");
  window.dispatchEvent(new CustomEvent("mc:lang", { detail: lang }));
}
