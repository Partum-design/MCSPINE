/* MC Spine · Asistente virtual (widget)
   Botón flotante + panel de chat. La conversación se guarda en sessionStorage
   para que continúe al navegar entre páginas desde los enlaces del asistente. */
const WA_NUMBER = "525543676490";
const KEY = "mcspine-chat";
const MAX_LEN = 800;

const T = {
  es: {
    open: "Abrir asistente virtual", close: "Cerrar asistente", title: "Asistente MC Spine", sub: "Respuestas al instante · IA",
    hello: "¡Hola! Soy el asistente de **MC Spine**. Pregúntame por cualquier producto, zona de la columna o cómo cotizar, y te llevo a donde está la información.",
    ph: "Escribe tu pregunta…", send: "Enviar", wa: "Hablar con un asesor por WhatsApp", typing: "Escribiendo…", reset: "Nueva conversación",
    error: "No pude conectarme. Intenta de nuevo o escríbenos por WhatsApp.",
    waDefault: "Hola, me gustaría más información sobre los productos MC Spine.",
    sugg: ["¿Qué productos tienen para cervical?", "¿Cómo pido una cotización?", "Quiero hablar con un asesor"],
    note: "Asistente con IA. Puede cometer errores; confirma con un asesor.",
  },
  en: {
    open: "Open virtual assistant", close: "Close assistant", title: "MC Spine Assistant", sub: "Instant answers · AI",
    hello: "Hi! I'm the **MC Spine** assistant. Ask me about any product, spine region or how to request a quote, and I'll take you to the right page.",
    ph: "Type your question…", send: "Send", wa: "Talk to an advisor on WhatsApp", typing: "Typing…", reset: "New conversation",
    error: "I couldn't connect. Please try again or message us on WhatsApp.",
    waDefault: "Hello, I'd like more information about MC Spine products.",
    sugg: ["What products do you have for cervical?", "How do I request a quote?", "I want to talk to an advisor"],
    note: "AI assistant. It may make mistakes; confirm with an advisor.",
  },
};
const lang = () => (document.documentElement.lang || "").startsWith("en") ? "en" : "es";
const t = (k) => T[lang()][k];
const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text || t("waDefault"))}`;

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function rich(text) {
  // Texto seguro con **negritas** y viñetas "- "
  const lines = esc(text).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").split(/\n+/);
  let html = "", inList = false;
  for (const l of lines) {
    const m = l.match(/^\s*[-•*]\s+(.*)$/);
    if (m) { if (!inList) { html += "<ul>"; inList = true; } html += `<li>${m[1]}</li>`; }
    else { if (inList) { html += "</ul>"; inList = false; } if (l.trim()) html += `<p>${l}</p>`; }
  }
  return inList ? html + "</ul>" : html;
}

let state = { open: false, msgs: [] };
try { state = { ...state, ...JSON.parse(sessionStorage.getItem(KEY) || "{}") }; } catch { /* sin almacenamiento */ }
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* sin almacenamiento */ } };

/* ---------- UI ---------- */
const root = document.createElement("div");
root.className = "chatbot";
root.setAttribute("data-no-i18n", "");
root.innerHTML = `
  <button class="chatbot__fab" type="button" aria-expanded="false" aria-controls="chatbot-panel">
    <i class="ph ph-chats-circle" aria-hidden="true"></i><i class="ph ph-x" aria-hidden="true"></i>
  </button>
  <section class="chatbot__panel" id="chatbot-panel" role="dialog" aria-modal="false" hidden>
    <header class="chatbot__head">
      <span class="chatbot__avatar"><i class="ph ph-sparkle" aria-hidden="true"></i></span>
      <div><strong data-t="title"></strong><small data-t="sub"></small></div>
      <button type="button" class="chatbot__icon" data-reset><i class="ph ph-arrow-counter-clockwise" aria-hidden="true"></i></button>
      <button type="button" class="chatbot__icon" data-close><i class="ph ph-x" aria-hidden="true"></i></button>
    </header>
    <div class="chatbot__log" aria-live="polite"></div>
    <div class="chatbot__sugg"></div>
    <form class="chatbot__form">
      <textarea rows="1" maxlength="${MAX_LEN}" required></textarea>
      <button type="submit" class="chatbot__send"><i class="ph ph-paper-plane-right" aria-hidden="true"></i></button>
    </form>
    <p class="chatbot__note" data-t="note"></p>
  </section>`;
document.body.appendChild(root);

const fab = root.querySelector(".chatbot__fab");
const panel = root.querySelector(".chatbot__panel");
const log = root.querySelector(".chatbot__log");
const sugg = root.querySelector(".chatbot__sugg");
const form = root.querySelector("form");
const input = form.querySelector("textarea");
const sendBtn = form.querySelector(".chatbot__send");
let busy = false;

function paintLabels() {
  root.querySelectorAll("[data-t]").forEach((el) => { el.textContent = t(el.dataset.t); });
  fab.setAttribute("aria-label", state.open ? t("close") : t("open"));
  panel.setAttribute("aria-label", t("title"));
  root.querySelector("[data-close]").setAttribute("aria-label", t("close"));
  root.querySelector("[data-reset]").setAttribute("aria-label", t("reset"));
  root.querySelector("[data-reset]").title = t("reset");
  sendBtn.setAttribute("aria-label", t("send"));
  input.placeholder = t("ph");
  input.setAttribute("aria-label", t("ph"));
  renderLog();
}

function bubble(m) {
  const div = document.createElement("div");
  div.className = `chatbot__msg chatbot__msg--${m.role === "user" ? "user" : "bot"}`;
  div.innerHTML = m.role === "user" ? `<p>${esc(m.text)}</p>` : rich(m.text);
  if (m.role !== "user" && (m.links?.length || m.whatsapp)) {
    const acts = document.createElement("div");
    acts.className = "chatbot__acts";
    (m.links || []).forEach((l) => {
      if (!/^\/(?!\/)/.test(l.url)) return; // solo rutas internas
      const a = document.createElement("a");
      a.href = l.url; a.className = "chatbot__link";
      a.innerHTML = `${esc(l.label)}<i class="ph ph-arrow-right" aria-hidden="true"></i>`;
      a.addEventListener("click", () => { state.open = true; save(); });
      acts.appendChild(a);
    });
    if (m.whatsapp) {
      const a = document.createElement("a");
      a.href = waLink(m.whatsappText); a.target = "_blank"; a.rel = "noopener";
      a.className = "chatbot__link chatbot__link--wa";
      a.innerHTML = `<i class="ph ph-whatsapp-logo" aria-hidden="true"></i>${esc(t("wa"))}`;
      acts.appendChild(a);
    }
    div.appendChild(acts);
  }
  return div;
}

function renderLog() {
  log.innerHTML = "";
  log.appendChild(bubble({ role: "assistant", text: t("hello") }));
  state.msgs.forEach((m) => log.appendChild(bubble(m)));
  if (busy) {
    const d = document.createElement("div");
    d.className = "chatbot__msg chatbot__msg--bot chatbot__typing";
    d.setAttribute("aria-label", t("typing"));
    d.innerHTML = "<span></span><span></span><span></span>";
    log.appendChild(d);
  }
  sugg.innerHTML = "";
  sugg.hidden = state.msgs.length > 0;
  if (!sugg.hidden) t("sugg").forEach((s) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = s;
    b.addEventListener("click", () => send(s));
    sugg.appendChild(b);
  });
  log.scrollTop = log.scrollHeight;
}

function setOpen(open, focus = true) {
  state.open = open; save();
  panel.hidden = !open;
  root.classList.toggle("is-open", open);
  fab.setAttribute("aria-expanded", String(open));
  fab.setAttribute("aria-label", open ? t("close") : t("open"));
  if (open) { log.scrollTop = log.scrollHeight; if (focus && matchMedia("(pointer: fine)").matches) input.focus(); }
  else if (focus) fab.focus();
}

async function send(text) {
  text = (text || "").trim().slice(0, MAX_LEN);
  if (!text || busy) return;
  const history = state.msgs.map(({ role, text }) => ({ role, text }));
  state.msgs.push({ role: "user", text });
  busy = true; sendBtn.disabled = true; save(); renderLog();
  let reply;
  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history, lang: lang(), page: location.pathname + location.search }),
    });
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    reply = { role: "assistant", text: d.reply || t("error"), links: d.links || [], whatsapp: !!d.whatsapp, whatsappText: d.whatsappText || "" };
  } catch {
    reply = { role: "assistant", text: t("error"), links: [], whatsapp: true, whatsappText: "" };
  }
  state.msgs.push(reply);
  state.msgs = state.msgs.slice(-30);
  busy = false; sendBtn.disabled = false; save(); renderLog();
}

fab.addEventListener("click", () => setOpen(!state.open));
root.querySelector("[data-close]").addEventListener("click", () => setOpen(false));
root.querySelector("[data-reset]").addEventListener("click", () => { state.msgs = []; save(); renderLog(); input.focus(); });
panel.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
form.addEventListener("submit", (e) => { e.preventDefault(); const v = input.value; input.value = ""; autosize(); send(v); });
input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
const autosize = () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 120) + "px"; };
input.addEventListener("input", autosize);

// Actualiza textos si se cambia el idioma desde Preferencias
new MutationObserver(paintLabels).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

paintLabels();
setOpen(!!state.open, false);
