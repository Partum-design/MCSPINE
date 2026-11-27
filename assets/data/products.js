// MC Spine — catálogo de productos (Catálogo de productos MC Spine, edición 2026).
// Cada producto: { slug, zones, sub, name, brand, category, img, desc, features? }
//
// zones: zonas anatómicas donde se usa (un producto puede tener varias).
//   PROPUESTA DE CLASIFICACIÓN PENDIENTE DE VALIDACIÓN POR MC SPINE (minuta 26/11/2026).
//   Se basa en lo que dice cada ficha; PX-Titan no indica niveles en su técnica y se
//   propone como torácica y lumbar por ser un sistema de tornillos pediculares.
// sub: subcategoría acordada con el cliente (implantes | consumibles | equipos).
// category: tipo de producto, se muestra como etiqueta en la ficha.

export const SUBCATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "implantes", label: "Implantes" },
  { id: "consumibles", label: "Consumibles" },
  { id: "equipos", label: "Equipos" },
];

export const SUB_LABEL = { implantes: "Implantes", consumibles: "Consumibles", equipos: "Equipos" };

export const CATEGORY_LABEL = {
  fijacion: "Sistemas de fijación",
  cajas: "Cajas intersomáticas",
  implantes: "Prótesis y estabilización",
  biologicos: "Biológicos y selladores",
  equipos: "Equipos quirúrgicos",
};

// Orden de la columna, de arriba hacia abajo. "general" agrupa lo que se usa en cualquier nivel.
export const ZONES = [
  { id: "cervical", label: "Cervical", levels: "C1 – C7" },
  { id: "toracica", label: "Torácica", levels: "T1 – T12" },
  { id: "lumbar", label: "Lumbar y sacra", levels: "L1 – S1" },
  { id: "general", label: "Toda la columna", levels: "Uso en cualquier nivel" },
];

export const ZONE_LABEL = Object.fromEntries(ZONES.map((z) => [z.id, z.label]));

// Marcas con mayor peso visual (acuerdo de la minuta del 26/11/2026)
export const FEATURED_BRANDS = [
  { name: "Peter Brehm", logo: "/assets/img/marcas/peter-brehm.png", origin: "Alemania", w: 480, h: 455 },
  { name: "Medacta International", logo: "/assets/img/marcas/medacta.png", origin: "Suiza", w: 480, h: 187 },
];
export const isFeaturedBrand = (brand) => FEATURED_BRANDS.some((b) => b.name === brand);
export const brandInfo = (brand) => FEATURED_BRANDS.find((b) => b.name === brand);

export const PRODUCTS = [
  // ---------- Peter Brehm ----------
  {
    slug: "px-titan",
    zones: ["toracica", "lumbar"],
    sub: "implantes",
    name: "PX-Titan® Expertise Integration",
    brand: "Peter Brehm",
    category: "fijacion",
    img: "/assets/catalogo/px-titan.png",
    desc: "Sistema alemán de fijación segura y precisa para cirugía de columna, con tornillos con recubrimiento BONIT® que favorecen la integración ósea y permiten cementación en pacientes con baja calidad ósea.",
    features: [
      "Mejor integración ósea.",
      "Mayor fijación en hueso osteoporótico.",
      "Colocación más precisa y adaptable.",
      "Opción de aumento con cemento.",
      "Sistema esterilizado, empaquetado en individual y listo para utilizar.",
      "Compatible con técnicas abiertas y mínimamente invasivas.",
    ],
  },

  // ---------- Medacta International ----------
  {
    slug: "mecta-c",
    zones: ["cervical"],
    sub: "implantes",
    name: "Mecta-C® Stand Alone",
    brand: "Medacta International",
    category: "cajas",
    img: "/assets/catalogo/mecta-c.png",
    desc: "Integra caja intersomática y fijación anterior en un solo implante, eliminando la necesidad de una placa adicional y ofreciendo opciones de perfil y cero perfil para cirugía cervical.",
    features: [
      "Lordosis de 7° para adaptación anatómica.",
      "Diseño híbrido TiPEEK con placa de titanio.",
      "Integración de caja y fijación anterior en un solo sistema.",
      "Perfil reducido para minimizar la irritación de tejidos.",
      "Configuraciones: Flush (perfil bajo), Trio (menos tornillos), Quattro (mayor estabilidad) e Hybrid (zonas anatómicas complejas).",
    ],
  },
  {
    slug: "mectalif-anterior",
    zones: ["lumbar"],
    sub: "implantes",
    name: "MectaLIF® Anterior",
    brand: "Medacta International",
    category: "cajas",
    img: "/assets/catalogo/mectalif-anterior.png",
    desc: "Solución modular para fusión lumbar (ALIF) que integra caja intersomática y fijación anterior en un solo sistema. Fabricada en PEEK radiolúcido con recubrimiento de titanio (TiPEEK) y marcadores de tantalio.",
    features: [
      "Fijación stand-alone con guía impresa para orientación de tornillos.",
      "Diseño modular adaptable a cada nivel lumbar y anatomía.",
      "Múltiples placas y ángulos de lordosis (5°, 10°, 15° y 20°).",
      "Compatible con abordaje anterior y anterolateral.",
      "Tornillos Standard y Rescue.",
      "Configuraciones: Flush, Long, L5-S1, Lateral e Hybrid.",
    ],
  },
  {
    slug: "mectalif-transforaminal",
    zones: ["lumbar"],
    sub: "implantes",
    name: "MectaLIF® Transforaminal",
    brand: "Medacta International",
    category: "cajas",
    img: "/assets/catalogo/mectalif-transforaminal.png",
    desc: "Caja lumbar tipo banana para fusión intersomática por abordaje transforaminal (TLIF) unilateral, con amplia superficie de contacto y un sistema de colocación totalmente controlable.",
    features: [
      "Diseño anatómico tipo banana con amplia superficie de contacto.",
      "Punta autodistractora para una inserción sencilla.",
      "Colocación precisa y controlada del implante.",
      "Disponible en PEEK y TiPEEK (PEEK con recubrimiento de titanio).",
      "Marcadores radiopacos para una visualización clara.",
    ],
  },

  // ---------- Group FH Ortho ----------
  {
    slug: "cp-esp",
    zones: ["cervical"],
    sub: "implantes",
    name: "CP-ESP®",
    brand: "Group FH Ortho",
    category: "implantes",
    img: "/assets/catalogo/cp-esp.png",
    desc: "Prótesis de disco cervical que reemplaza el disco intervertebral conservando la movilidad natural del cuello, a diferencia de la fusión tradicional, con recubrimiento de hidroxiapatita que mejora su integración con el hueso.",
    features: [
      "Núcleo móvil de poliuretano quirúrgico.",
      "Fijación a los platillos vertebrales mediante pinchos superiores e inferiores.",
      "Fácil colocación con poco instrumental.",
      "Alternativa a la fusión cervical (ACDF).",
      "Movilidad controlada y multidireccional.",
      "Conserva la altura del espacio intervertebral.",
    ],
  },
  {
    slug: "lp-esp",
    zones: ["lumbar"],
    sub: "implantes",
    name: "LP-ESP®",
    brand: "Group FH Ortho",
    category: "implantes",
    img: "/assets/catalogo/lp-esp.png",
    desc: "Prótesis lumbar (disco artificial) que reemplaza el disco intervertebral manteniendo el movimiento natural de la zona, con recubrimiento de hidroxiapatita.",
    features: [
      "Preserva la movilidad segmentaria.",
      "Fijación a los platillos vertebrales mediante pinchos superiores e inferiores.",
      "Reduce la sobrecarga en niveles adyacentes.",
      "Restaura la lordosis lumbar.",
      "Mejora el balance sagital.",
      "Alternativa a la fusión en pacientes seleccionados.",
    ],
  },

  // ---------- SeaSpine ----------
  {
    slug: "regatta",
    zones: ["lumbar"],
    sub: "implantes",
    name: "REGATTA®",
    brand: "SeaSpine",
    category: "cajas",
    img: "/assets/catalogo/regatta.png",
    desc: "Sistema lateral lumbar (XLIF) de fusión por abordaje lateral que permite lograr una descompresión indirecta y restaurar la alineación sagital de manera segura y reproducible.",
    features: [
      "Abordaje lateral mínimamente invasivo (XLIF).",
      "Descompresión indirecta del canal y el foramen.",
      "Máxima cobertura de los platillos vertebrales.",
      "Anchos de 18 y 23 mm, longitudes de 40 a 60 mm y alturas de 8 a 14 mm.",
      "Lordosis de 0°, 10° y 15°.",
      "Placa lateral opcional de 4.5 mm con 1, 2 o 4 tornillos de ángulo variable (cono de 20°).",
    ],
  },
  {
    slug: "seaspine-interespinoso",
    zones: ["toracica", "lumbar"],
    sub: "implantes",
    name: "Sistema Interespinoso SeaSpine®",
    brand: "SeaSpine",
    category: "fijacion",
    img: "/assets/catalogo/seaspine-interespinoso.png",
    desc: "Dispositivo de fijación posterior que se coloca entre las apófisis espinosas para dar estabilidad, mantener el espacio interespinoso, limitar la extensión y favorecer la fusión ósea, como complemento en un solo nivel de la columna toracolumbar (T1–S1).",
    features: [
      "Complemento a la fijación principal.",
      "Mantiene el espacio interespinoso.",
      "Limita la extensión del segmento.",
      "Implante preensamblado de fácil colocación.",
      "Sistema compacto con mínima instrumentación.",
      "Disponible en Estándar, Acampanado y XL.",
    ],
  },

  // ---------- Medtronic ----------
  {
    slug: "diam",
    zones: ["lumbar"],
    sub: "implantes",
    name: "DIAM™",
    brand: "Medtronic",
    category: "implantes",
    img: "/assets/catalogo/diam.png",
    desc: "Sistema de estabilización dinámica lumbar: espaciador de polímero de grado quirúrgico y de fácil colocación que brinda soporte a la columna lumbar sin restringir por completo su movilidad.",
    features: [
      "Refuerzo con agujetas para mayor soporte y fijación.",
      "Preserva la movilidad controlada.",
      "Reduce la carga en vértebras adyacentes.",
      "Implante interespinoso tipo “shock absorber”.",
      "Técnica mínimamente invasiva.",
      "Tamaños de 8, 10, 12 y 14 mm.",
    ],
  },

  // ---------- SeohanCare ----------
  {
    slug: "megafix",
    zones: ["toracica", "lumbar"],
    sub: "implantes",
    name: "MEGAFIX®",
    brand: "SeohanCare",
    category: "fijacion",
    img: "/assets/catalogo/megafix.png",
    desc: "Sistema de fijación pedicular completo y adaptable, diseñado para tratar patologías en las zonas lumbar, torácica y sacra de la columna.",
    features: [
      "Tornillos poliaxiales de 50° (Ø 5.5–7.5 mm), barras y conectores.",
      "Travesaño (crosslink) tipo telescópico.",
      "Alta versatilidad de configuración.",
      "Diseño de bajo perfil.",
      "Fácil manejo en quirófano.",
    ],
  },
  {
    slug: "procage",
    zones: ["lumbar"],
    sub: "implantes",
    name: "PROCAGE™",
    brand: "SeohanCare",
    category: "cajas",
    img: "/assets/catalogo/procage.png",
    desc: "Caja intersomática lumbar expandible de titanio que se inserta fácilmente en espacios reducidos y se expande para restaurar la altura y estabilidad del segmento en cirugías con técnica PLIF o TLIF.",
    features: [
      "Diseño expandible intraoperatorio que minimiza el número de implantes.",
      "Lordosis de 4° y 8°, expandible de 8 a 13 mm.",
      "Inserción sencilla en espacios reducidos.",
      "Restauración controlada de la altura discal.",
      "Mejor contacto con los platillos vertebrales.",
    ],
  },
  {
    slug: "perfect-c",
    zones: ["cervical"],
    sub: "implantes",
    name: "PERFECT-C®",
    brand: "SeohanCare",
    category: "cajas",
    img: "/assets/catalogo/perfect-c.png",
    desc: "Sistema de fusión cervical stand-alone que integra caja intersomática y placa en un solo dispositivo, estabilizando el segmento sin requerir una placa cervical adicional.",
    features: [
      "Placa de bajo perfil disponible en dos anchos: 16 y 24 mm.",
      "Menor invasión y manipulación de tejidos.",
      "Fijación inmediata con tornillos de ángulo variable (hasta 40°).",
      "Reduce complicaciones postoperatorias.",
    ],
  },
  {
    slug: "banane",
    zones: ["lumbar"],
    sub: "implantes",
    name: "BANANE®",
    brand: "SeohanCare",
    category: "cajas",
    img: "/assets/catalogo/banane.png",
    desc: "Caja intersomática lumbar de PEEK para abordajes TLIF que favorece una adecuada integración ósea y ofrece una clara visualización radiográfica después de la cirugía.",
    features: [
      "Diseño curvo tipo “banana” para acceso TLIF.",
      "Inserción suave y controlada con menor retracción nerviosa.",
      "Excelente contacto con los platillos vertebrales.",
      "Alturas de 7 a 16 mm y anchos de 10 y 11 mm.",
      "Longitudes de 30, 33, 36 y 39 mm.",
    ],
  },

  // ---------- Biológicos ----------
  {
    slug: "orthoblast-ii",
    zones: ["general"],
    sub: "consumibles",
    name: "OrthoBlast® II",
    brand: "Biograft",
    category: "biologicos",
    img: "/assets/catalogo/orthoblast-ii.png",
    desc: "Injerto óseo DBM de origen natural compuesto por matriz ósea desmineralizada y hueso esponjoso; sustituto óseo listo para usar con alta capacidad de integración.",
    features: [
      "Listo para usar, sin preparación.",
      "Alta capacidad osteoinductiva.",
      "Excelente manipulación en quirófano.",
      "Permanece fijo sin desplazarse y es compatible con otros injertos.",
      "Putty de 5 y 10 cc; Paste de 1, 2 y 8 cc.",
    ],
  },
  {
    slug: "duraseal",
    zones: ["general"],
    sub: "consumibles",
    name: "DuraSeal®",
    brand: "Integra",
    category: "biologicos",
    img: "/assets/catalogo/duraseal.png",
    desc: "Sellador dural espinal a base de polímero diseñado para crear una barrera hermética sobre la duramadre.",
    features: [
      "Sellado hermético inmediato sin requerir refrigeración.",
      "Previene la fuga de líquido cefalorraquídeo.",
      "Preparación y aplicación rápida y sencilla.",
      "Alta biocompatibilidad con presentación craneal y lumbar.",
      "Absorción natural de 4 a 12 semanas.",
    ],
  },

  // ---------- Equipos quirúrgicos ----------
  {
    slug: "surgi-max-ultra",
    zones: ["general"],
    sub: "equipos",
    name: "Surgi-Max® Ultra",
    brand: "Elliquence",
    category: "equipos",
    img: "/assets/catalogo/surgi-max-ultra.png",
    desc: "Plataforma de radiofrecuencia que emplea ondas de 4.0 MHz a baja temperatura para cortar, coagular y tratar tejidos con gran precisión sin dañar las estructuras sanas.",
    features: [
      "Consola única para rizotomía y nucleoplastía.",
      "Función monopolar y bipolar.",
      "Hasta un 84% menos daño térmico lateral que el electrobisturí tradicional.",
      "Pedales de control, cables, placas neutras y maletín de transporte.",
      "Para tratamiento del dolor y procedimientos neuroquirúrgicos y ortopédicos.",
    ],
  },
  {
    slug: "trigger-flex",
    zones: ["general"],
    sub: "consumibles",
    name: "Trigger-Flex® Bipolar",
    brand: "Elliquence",
    category: "equipos",
    img: "/assets/catalogo/trigger-flex.png",
    desc: "Sistema bipolar estéril y de un solo uso diseñado para cirugía endoscópica de columna y procedimientos mínimamente invasivos, con radiofrecuencia de baja temperatura.",
    features: [
      "Precisión quirúrgica articulada.",
      "Tecnología RF exclusiva para Surgi-Max®.",
      "Diseñado para acceso y trabajo en espacios reducidos.",
      "Longitudes de trabajo: DTF-18 (18 cm), DTF-31 (31 cm), DTF-38 (38 cm) y DTF-40 (40 cm).",
      "Endoscopia de columna, discectomía endoscópica y hemostasia controlada.",
    ],
  },
  {
    slug: "pinzas-bipolares",
    zones: ["general"],
    sub: "equipos",
    name: "Pinzas Bipolares Reutilizables",
    brand: "Elliquence",
    category: "equipos",
    img: "/assets/catalogo/pinzas-bipolares.png",
    desc: "Pinzas bipolares con tecnología RF patentada, disponibles en diferentes configuraciones y diámetros para distintas necesidades quirúrgicas.",
    features: [
      "Bayoneta 19.1 cm – 1.0 mm y 20.3 cm – 1.0 mm.",
      "Bayoneta Micro-Punta 19.1 cm – 0.5 mm.",
      "Punta externa aislada disponible.",
      "Menor daño térmico que el electrobisturí convencional.",
      "Compatibles con endoscopía avanzada.",
    ],
  },
  {
    slug: "sonopet",
    zones: ["general"],
    sub: "equipos",
    name: "SONOPET®",
    brand: "Stryker",
    category: "equipos",
    img: "/assets/catalogo/sonopet.png",
    desc: "Aspirador ultrasónico quirúrgico para procedimientos que requieren remoción controlada de tejido con alta precisión, preservando estructuras sanas.",
    features: [
      "Alta precisión en la resección de tejido.",
      "Amplio catálogo de puntas de trabajo.",
      "Preservación de estructuras críticas.",
      "Menor daño térmico.",
      "Sistema integrado de ultrasonido, succión e irrigación.",
    ],
  },
];
