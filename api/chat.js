/* MC Spine · Asistente virtual (función de Vercel)
   Recibe la conversación desde el navegador, la envía a Gemini con todo el
   contexto del sitio y regresa una respuesta con enlaces a las secciones o
   fichas de producto donde el visitante puede ver más información.
   La clave de la API se lee de la variable de entorno GOOGLE_API_KEY. */
import { PRODUCTS, CATEGORY_LABEL, ZONE_LABEL } from "../assets/data/products.js";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const WA_NUMBER = "525543676490";
const MAX_MSG = 800;
const MAX_TURNS = 16;

/* ---------- Mapa del sitio que el asistente puede recomendar ---------- */
const PAGES = [
  { url: "/", label: "Inicio", info: "Portada: certificación ISO 9001:2015, respaldo para procedimientos, explorador de productos por zona de la columna, tecnología destacada, cómo trabajamos y productos destacados." },
  { url: "/nosotros", label: "Nosotros", info: "Quiénes somos, Director General (Endrik Sánchez Guerrero), misión, visión, valores y política de calidad." },
  { url: "/nosotros#calidad", label: "Certificación ISO 9001:2015", info: "Sistema de Gestión de Calidad certificado en ISO 9001:2015 por OLA Certificación Internacional." },
  { url: "/catalogo", label: "Catálogo completo", info: "Todos los productos con búsqueda, filtros por categoría y por zona." },
  ...Object.entries(CATEGORY_LABEL).map(([id, label]) => ({ url: `/catalogo?cat=${id}`, label, info: `Catálogo filtrado: ${label}.` })),
  ...Object.entries(ZONE_LABEL).map(([id, label]) => ({ url: `/catalogo?zona=${id}`, label: `Productos para zona ${label.toLowerCase()}`, info: `Catálogo filtrado por zona ${label}.` })),
  { url: "/contacto", label: "Contacto", info: "Formulario de contacto, dirección, teléfono, correo, horario y WhatsApp." },
  { url: "/aviso-privacidad", label: "Aviso de Privacidad", info: "Tratamiento de datos personales." },
  { url: "/terminos", label: "Términos y Condiciones", info: "Condiciones de uso del sitio." },
];

const ALLOWED = new Set(PAGES.map((p) => p.url));
PRODUCTS.forEach((p) => { ALLOWED.add(`/catalogo?p=${p.slug}`); ALLOWED.add(`/contacto?producto=${p.slug}`); });

function catalogText() {
  return PRODUCTS.map((p) => [
    `- ${p.name} (slug: ${p.slug})`,
    `  Marca: ${p.brand || "—"} · Categoría: ${CATEGORY_LABEL[p.category]}${p.zone ? ` · Zona: ${ZONE_LABEL[p.zone]}` : ""}`,
    `  Ficha: /catalogo?p=${p.slug} · Solicitar información: /contacto?producto=${p.slug}`,
    `  Descripción: ${p.desc}`,
    p.features?.length ? `  Características: ${p.features.join(" ")}` : "",
  ].filter(Boolean).join("\n")).join("\n");
}

const SYSTEM = `Eres el asistente virtual del sitio web de MC Spine, comercializadora mexicana de implantes y equipos médicos para cirugía de columna vertebral, empresa certificada en ISO 9001:2015 (Sistema de Gestión de Calidad, certificado por OLA Certificación Internacional). Más de 10 años de experiencia y más de 100 procedimientos apoyados.

TU TRABAJO
- Responder dudas sobre la empresa, sus productos y el sitio, y GUIAR al visitante a la página exacta donde puede ver más (ficha del producto, categoría, sección).
- Cuando hables de un producto, incluye siempre el enlace a su ficha (/catalogo?p=slug). Si el visitante quiere cotizar o pedir información de ese producto, añade también /contacto?producto=slug.
- Si buscan por zona (cervical, toracolumbar, lumbar) o por tipo de producto, recomienda los productos que correspondan y el enlace al catálogo filtrado.
- En el sitio hay un botón "Agregar a cotización" en cada producto; el visitante arma su lista en "Mi cotización" y la envía por WhatsApp o correo. Explícalo si preguntan cómo cotizar.
- Si el visitante pide hablar con alguien, con un asesor, con ventas, pide una cotización formal, precios, disponibilidad, tiempos de entrega o tiene una urgencia, marca whatsapp = true y dile que puede escribir por WhatsApp al +52 55 4367 6490. En whatsappText escribe un mensaje breve y natural, en primera persona del visitante, que resuma lo que necesita (por ejemplo: "Hola, me interesa información y cotización de PX-Titan®.").

REGLAS
- Responde solo con información de este contexto. No inventes productos, precios, existencias, medidas, indicaciones clínicas ni datos que no estén aquí. Si no lo sabes, dilo y ofrece WhatsApp.
- No des consejo médico ni diagnósticos; la elección del implante la hace el cirujano. Puedes describir los productos y orientar.
- No publicamos precios en el sitio: los precios y la disponibilidad se cotizan con un asesor (ofrece WhatsApp).
- Responde en el idioma del visitante (español o inglés). Tono profesional, cálido y breve: 1 a 4 frases. Puedes usar **negritas** y viñetas con "- " cuando ayude.
- Los enlaces SOLO pueden ser rutas de la lista "PÁGINAS" o las rutas de ficha/contacto de los productos. Máximo 4 enlaces, con etiquetas cortas. No escribas URLs dentro del texto de la respuesta; ponlas en "links".
- Si preguntan algo ajeno a MC Spine, redirige amablemente a lo que sí puedes ayudar.

DATOS DE CONTACTO
- Teléfono: +52 55 4367 6490 · WhatsApp: +52 55 4367 6490 · Correo: info@mcspine.mx
- Dirección: Baja California 245, 4to piso, Hipódromo Condesa, Cuauhtémoc, CDMX, C.P. 06170.
- Horario: lunes a viernes de 9:00 am a 6:00 pm. Respuesta a mensajes del formulario: menos de 24 horas hábiles.
- Facebook: disponible desde el pie de página del sitio.

EMPRESA
- Misión: traer motivación e innovación a nuestros clientes, ofreciendo soluciones especializadas que respondan a las necesidades quirúrgicas más exigentes.
- Visión: liderar la comercialización de la industria ortopédica, siendo la plataforma más eficiente y confiable en el tratamiento quirúrgico de la columna vertebral.
- Director General: Endrik Sánchez Guerrero. Trato directo y cercano con cada cirujano e institución.
- Forma de trabajo: 1) Consulta, 2) Selección del sistema adecuado, 3) Cotización con disponibilidad, 4) Acompañamiento hasta la entrega.
- Marcas que comercializamos: ${[...new Set(PRODUCTS.map((p) => p.brand).filter(Boolean))].join(", ")}.

PÁGINAS
${PAGES.map((p) => `- ${p.url} · ${p.label}: ${p.info}`).join("\n")}

CATÁLOGO (${PRODUCTS.length} productos)
${catalogText()}`;

const SCHEMA = {
  type: "OBJECT",
  properties: {
    reply: { type: "STRING", description: "Respuesta para el visitante." },
    links: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { label: { type: "STRING" }, url: { type: "STRING" } },
        required: ["label", "url"],
      },
    },
    whatsapp: { type: "BOOLEAN", description: "true si conviene ofrecer hablar con un asesor por WhatsApp." },
    whatsappText: { type: "STRING", description: "Mensaje sugerido para WhatsApp." },
  },
  required: ["reply", "links", "whatsapp"],
};

function cleanHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string" && m.text.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text.slice(0, MAX_MSG * 2) }] }));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  let data = "";
  for await (const chunk of req) { data += chunk; if (data.length > 100_000) break; }
  return JSON.parse(data || "{}");
}

function fallback(lang) {
  return lang === "en"
    ? { reply: "I'm having trouble answering right now. You can talk to our team on WhatsApp and they'll help you right away.", links: [{ label: "Contact", url: "/contacto" }], whatsapp: true, whatsappText: "Hello, I'd like more information about MC Spine products." }
    : { reply: "En este momento no puedo responder. Puedes hablar con nuestro equipo por WhatsApp y te atenderán de inmediato.", links: [{ label: "Contacto", url: "/contacto" }], whatsapp: true, whatsappText: "Hola, me gustaría más información sobre los productos MC Spine." };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Método no permitido" }); }

  let body;
  try { body = await readBody(req); } catch { return res.status(400).json({ error: "JSON inválido" }); }
  const lang = body.lang === "en" ? "en" : "es";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_MSG) : "";
  if (!message) return res.status(400).json({ error: "Mensaje vacío" });

  const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) { console.error("Falta GOOGLE_API_KEY"); return res.status(200).json(fallback(lang)); }

  const page = typeof body.page === "string" ? body.page.slice(0, 120) : "/";
  const contents = [
    ...cleanHistory(body.history),
    { role: "user", parts: [{ text: `[Página actual del visitante: ${page} · Idioma de la interfaz: ${lang === "en" ? "inglés" : "español"}]\n${message}` }] },
  ];
  // Gemini exige que la conversación empiece con un turno del usuario
  while (contents.length && contents[0].role !== "user") contents.shift();
  // y que los turnos alternen: se unen mensajes consecutivos del mismo rol
  for (let i = contents.length - 1; i > 0; i--) {
    if (contents[i].role === contents[i - 1].role) { contents[i - 1].parts.push(...contents[i].parts); contents.splice(i, 1); }
  }

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024, responseMimeType: "application/json", responseSchema: SCHEMA },
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!r.ok) { console.error("Gemini", r.status, (await r.text()).slice(0, 500)); return res.status(200).json(fallback(lang)); }
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
    const out = JSON.parse(text);

    const links = (Array.isArray(out.links) ? out.links : [])
      .filter((l) => l && typeof l.url === "string" && ALLOWED.has(l.url) && typeof l.label === "string")
      .slice(0, 4)
      .map((l) => ({ label: l.label.slice(0, 60), url: l.url }));

    return res.status(200).json({
      reply: String(out.reply || "").slice(0, 2000) || fallback(lang).reply,
      links,
      whatsapp: Boolean(out.whatsapp),
      whatsappText: typeof out.whatsappText === "string" ? out.whatsappText.slice(0, 300) : "",
      whatsappNumber: WA_NUMBER,
    });
  } catch (err) {
    console.error("Error del asistente", err);
    return res.status(200).json(fallback(lang));
  }
}
