// MC Spine — catálogo de productos.
// Cada producto: { slug, name, category, img, desc }
// Categorías: implantes | fijacion | cajas | placas

export const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "implantes", label: "Implantes para columna" },
  { id: "fijacion", label: "Sistemas de fijación" },
  { id: "cajas", label: "Cajas intersomáticas" },
  { id: "placas", label: "Placas y tornillos" },
];

export const CATEGORY_LABEL = {
  implantes: "Implantes para columna",
  fijacion: "Sistemas de fijación",
  cajas: "Cajas intersomáticas",
  placas: "Placas y tornillos",
};

export const PRODUCTS = [
  {
    slug: "mobi-c2",
    name: "Mobi-C⁺",
    category: "implantes",
    img: "/assets/catalogo/mobi-c2.png",
    desc: "Disco artificial de segunda generación diseñado por un equipo de cirujanos especializados en ortopedia espinal. Cuenta con un sistema de implantación único, fiable y patentado.",
  },
  {
    slug: "mc",
    name: "MC⁺",
    category: "implantes",
    img: "/assets/catalogo/mc.png",
    desc: "La caja MC⁺ puede utilizarse de forma independiente o junto con un sistema de autorretención patentado, para aumentar la estabilidad primaria del implante cuando sea necesario.",
  },
  {
    slug: "roi-c",
    name: "ROI-C⁺",
    category: "implantes",
    img: "/assets/catalogo/roi-c.png",
    desc: "Los hemispikes de anclaje curvado y de autorretención se insertan directamente a lo largo del eje del disco a través del soporte del implante, asegurando la estabilidad durante el proceso de fusión.",
  },
  {
    slug: "mobidisc",
    name: "Mobidisc⁺",
    category: "implantes",
    img: "/assets/catalogo/mobidisc.png",
    desc: "Cumple dos requisitos del disco lumbar: la restauración de la movilidad fisiológica del segmento tratado y la colocación óptima del implante.",
  },
  {
    slug: "roi-a",
    name: "ROI-A⁺",
    category: "implantes",
    img: "/assets/catalogo/roi-a.png",
    desc: "Jaula ALIF con un sistema de anclaje innovador que evita el uso de placa anterior o tornillo. Su diseño de “perfil cero” asegura que ningún hardware sobresalga en forma anterior a los cuerpos vertebrales.",
  },
  {
    slug: "roi-t",
    name: "ROI-T⁺",
    category: "implantes",
    img: "/assets/catalogo/roi-t.png",
    desc: "Diseñado para respetar las limitaciones de un enfoque mínimamente invasivo. Su perfil atraumático se ajusta perfectamente a los requisitos de la fusión intervertebral.",
  },
  {
    slug: "dallos",
    name: "Dallos⁺",
    category: "implantes",
    img: "/assets/catalogo/dallos.png",
    desc: "Prótesis de tendones y ligamentos utilizada para la reconstrucción de ligamentos rotos y en la cirugía de baja movilidad.",
  },
  {
    slug: "hero",
    name: "HERO⁺",
    category: "implantes",
    img: "/assets/catalogo/hero.png",
    desc: "El sistema de placa cervical anterior HERO sirve para estabilizar la columna cervical después de una fusión ventral.",
  },

  {
    slug: "c-plate",
    name: "C-Plate⁺",
    category: "fijacion",
    img: "/assets/catalogo/c-plate.png",
    desc: "Su grosor estrecho, su mecanismo de bloqueo atraumático integrado y su diseño anatómico proporcionan un sistema que reduce el riesgo de complicaciones postoperatorias.",
  },
  {
    slug: "spinetune-l",
    name: "SpineTune® TL",
    category: "fijacion",
    img: "/assets/catalogo/spinetune-l.png",
    desc: "El sistema de tornillos toracolumbar SpineTune TL combina la versatilidad de los sistemas de tornillos poliaxiales de carga superior con la seguridad de implantes suministrados estériles.",
  },
  {
    slug: "tristan",
    name: "TRISTAN®",
    category: "fijacion",
    img: "/assets/catalogo/tristan.png",
    desc: "Sistema inteligente de dispositivos intercorporales, altamente eficiente por su instrumentación. Abre el campo para que el cirujano logre una precisión extrema combinada con una implantación rápida y segura.",
  },
  {
    slug: "tristan-s",
    name: "TRISTAN® S",
    category: "fijacion",
    img: "/assets/catalogo/tristan-s.png",
    desc: "Dispositivo inteligente con sistema de intercuerpo cervical altamente racional, ampliamente reconocido y aceptado para indicaciones de columna cervical.",
  },
  {
    slug: "venus6t",
    name: "VENUS 6T⁺",
    category: "fijacion",
    img: "/assets/catalogo/venus6t.png",
    desc: "Tres versiones diferentes para aplicaciones individuales: tornillos monoaxiales, tornillos poliaxiales y tornillos poliaxiales convalidados.",
  },
  {
    slug: "barras-fusion",
    name: "Barras Fusión Occipito-cervical",
    category: "fijacion",
    img: "/assets/catalogo/barras-fusion.png",
    desc: "Sistema indicado para proporcionar estabilidad y promover la fusión occipito-cervical, ya sea con las barras o con la placa.",
  },

  {
    slug: "avenue-l",
    name: "Avenue® L",
    category: "cajas",
    img: "/assets/catalogo/avenue-l.png",
    desc: "La jaula lumbar permite un anclaje seguro a través del acceso retroperitoneal lateral directo al espacio intervertebral, mediante la innovadora tecnología de placa de anclaje VerteBRIDGE.",
  },
  {
    slug: "interbridge",
    name: "InterBRIDGE®",
    category: "cajas",
    img: "/assets/catalogo/interbridge.png",
    desc: "Implante de fusión lumbar interespinoso que se coloca a través de un abordaje posterior mínimamente invasivo y unilateral, contribuyendo a acortar el tiempo de operación.",
  },
  {
    slug: "carlif",
    name: "CarLIF®",
    category: "cajas",
    img: "/assets/catalogo/carlif.png",
    desc: "Implantes que constituyen un nuevo paso importante en la cirugía de columna, con una función especial que complementa las nuevas tendencias en el tratamiento quirúrgico vertebral.",
  },
  {
    slug: "adonis-plif",
    name: "ADONIS® PLIF",
    category: "cajas",
    img: "/assets/catalogo/adonis-plif.png",
    desc: "Cajas destinadas a una fusión intersomática lumbar posterior.",
  },
  {
    slug: "adonis-tlif",
    name: "ADONIS® TLIF",
    category: "cajas",
    img: "/assets/catalogo/adonis-tlif.png",
    desc: "Implante de PEEK-Optima biocompatible para fusión intercorporal, utilizado en la enfermedad degenerativa del disco y la inestabilidad.",
  },
  {
    slug: "caja-bloqueada",
    name: "Caja Bloqueada",
    category: "cajas",
    img: "/assets/catalogo/caja-bloqueada.png",
    desc: "Marcadores de rayos X que facilitan el control radiográfico, ventana que permite el crecimiento del injerto de hueso y picos de titanio que proporcionan una interfaz ósea rígida.",
  },
  {
    slug: "caja-lumbar",
    name: "Caja Lumbar Tipo Banana",
    category: "cajas",
    img: "/assets/catalogo/caja-lumbar.png",
    desc: "Marcadores de rayos X que ayudan a visualizar el implante bajo control radiográfico. Canales de diseño en la superficie para guiar y girar la caja a la posición deseada.",
  },

  {
    slug: "inswing",
    name: "InSwing™",
    category: "placas",
    img: "/assets/catalogo/inswing.png",
    desc: "Espaciador interespinoso que ofrece una solución de descompresión para aliviar el dolor de la estenosis espinal lumbar (LSS).",
  },
  {
    slug: "placa-cervical-anterior",
    name: "Placa Cervical Anterior",
    category: "placas",
    img: "/assets/catalogo/placa-cervical-anterior.png",
    desc: "Sistema de placa anterior indicado para la fijación anterior de la columna cervical (desde C2 hasta C7).",
  },
  {
    slug: "placa-occipito-cervical",
    name: "Placa Para Fusión Occipito-cervical",
    category: "placas",
    img: "/assets/catalogo/placa-occipito-cervical.png",
    desc: "Permite acomodar los tornillos no lineales y ajustar a diferente altura. Tornillos poliaxiales con punta de canal.",
  },
  {
    slug: "malla-cervical",
    name: "Malla Cervical",
    category: "placas",
    img: "/assets/catalogo/malla-cervical.png",
    desc: "Diseñada para su inserción a través de un abordaje anterior o anterolateral. Arquitectura abierta que permite la fusión ósea.",
  },
  {
    slug: "tornillo-occipito",
    name: "Tornillo Occipito-cervical",
    category: "placas",
    img: "/assets/catalogo/tornillo-occipito.png",
    desc: "Ángulo de 15° en todas las direcciones que permite el ajuste de los tornillos para su fácil inserción.",
  },
  {
    slug: "tornillo-transpedicular",
    name: "Tornillo Transpedicular Poliaxial",
    category: "placas",
    img: "/assets/catalogo/tornillo-transpedicular.png",
    desc: "Tornillos autorroscantes para inserción rápida. El diseño especial en la cabeza del tornillo poliaxial ofrece una estabilidad angular más fuerte.",
  },
];
