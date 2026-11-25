/* MC Spine · Columna 3D del logotipo (header)
   Siete vértebras con la misma curva y proporciones del logo original,
   girando despacio entre "MC" y "SPINE". Si no hay WebGL con aceleración
   real o el usuario pidió reducir movimiento, se queda la columna en SVG
   (o un cuadro fijo en 3D). */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js";

const logo = document.querySelector("[data-logo3d]");
const canvas = logo?.querySelector("canvas");
if (logo && canvas) init();

function init() {
  const motionOff = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("a11y-motion");

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    return; // sin WebGL: se queda el SVG
  }
  try {
    const gl = renderer.getContext();
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const gpu = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
    if (!new URLSearchParams(location.search).has("force3d") &&
        /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i.test(gpu)) {
      renderer.dispose();
      return;
    }
  } catch { /* sin datos del GPU: se intenta */ }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(16, 1, 0.1, 100);
  camera.position.set(0, 0, 44);

  scene.add(new THREE.HemisphereLight(0xc4dcff, 0x0a1a33, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-4, 5, 7);
  scene.add(key);
  const rim = new THREE.PointLight(0x4f95ff, 60, 30, 1.4);
  rim.position.set(4, 1, -5);
  scene.add(rim);

  /* Vértebras tomadas del logo (centro x/y, radio x, radio y del SVG original) */
  const SRC = [
    [106, 5, 7.5, 5.5], [102.5, 28, 8, 5.5], [100, 50.5, 8.5, 6], [102.5, 75.5, 10, 7],
    [105, 103.5, 11.5, 8], [110, 133, 13.5, 9.5], [100.5, 158.5, 8, 5],
  ];
  const k = 1 / 16;
  const bone = new THREE.MeshStandardMaterial({ color: 0xdde8f6, roughness: 0.42, metalness: 0.05, emissive: 0x0d2a5c, emissiveIntensity: 0.25 });
  const accent = new THREE.MeshStandardMaterial({ color: 0x7fb4ff, roughness: 0.35, metalness: 0.1, emissive: 0x1d5fd6, emissiveIntensity: 0.45 });
  const discMat = new THREE.MeshStandardMaterial({ color: 0x9ccbff, emissive: 0x2f86ff, emissiveIntensity: 1.2, roughness: 0.3 });

  const bodyGeo = (r, h) => {
    const pts = [new THREE.Vector2(0, -h / 2)];
    const n = 10;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const waist = 1 - 0.08 * Math.sin(Math.PI * t);
      const edge = t < 0.15 ? 0.86 + t * 0.93 : t > 0.85 ? 0.86 + (1 - t) * 0.93 : 1;
      pts.push(new THREE.Vector2(r * waist * Math.min(edge, 1), -h / 2 + t * h));
    }
    pts.push(new THREE.Vector2(0, h / 2));
    const g = new THREE.LatheGeometry(pts, 28);
    g.scale(1, 1, 0.8);
    return g;
  };
  const capsule = (rad, len) => new THREE.CapsuleGeometry(rad, len, 4, 10);

  const spine = new THREE.Group();
  scene.add(spine);
  const parts = [];
  const cy0 = (SRC[0][1] + SRC[SRC.length - 1][1]) / 2;

  SRC.forEach(([cx, cy, rx, ry], i) => {
    const r = rx * k, h = ry * 2 * k * 0.85;
    const mat = i === 5 ? accent : bone;
    const v = new THREE.Group();
    v.add(new THREE.Mesh(bodyGeo(r, h), mat));
    // apófisis espinosa hacia atrás
    const sp = new THREE.Mesh(capsule(r * 0.2, r * 0.9), mat);
    sp.rotation.x = Math.PI / 2 + 0.45;
    sp.position.set(0, -h * 0.25, -r * 1.35);
    v.add(sp);
    // apófisis transversas
    for (const s of [-1, 1]) {
      const tp = new THREE.Mesh(capsule(r * 0.16, r * 0.55), mat);
      tp.rotation.z = Math.PI / 2 + s * 0.15;
      tp.rotation.y = s * 0.4;
      tp.position.set(s * r * 0.95, 0, -r * 0.7);
      v.add(tp);
    }
    v.position.set((cx - 104) * k, (cy0 - cy) * k, 0);
    spine.add(v);
    parts.push({ obj: v, delay: i * 0.08 });

    // disco entre esta vértebra y la siguiente
    const nx = SRC[i + 1];
    if (nx) {
      const dr = (rx + nx[2]) / 2 * k * 0.92;
      const y1 = (cy0 - cy - ry) * k, y2 = (cy0 - nx[1] + nx[3]) * k;
      const d = new THREE.Mesh(new THREE.CylinderGeometry(dr, dr, Math.max((y1 - y2) * 0.45, 0.06), 24), discMat);
      d.scale.z = 0.8;
      d.position.set(((cx + nx[0]) / 2 - 104) * k, (y1 + y2) / 2, 0);
      spine.add(d);
      parts.push({ obj: d, delay: i * 0.08 + 0.04 });
    }
  });
  spine.rotation.x = 0.12;

  /* Tamaño: se ajusta la cámara para que la columna llene la altura del canvas */
  const fitH = 11.2;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = (fitH / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.updateProjectionMatrix();
    render();
  }
  const render = () => renderer.render(scene, camera);
  new ResizeObserver(resize).observe(canvas);

  /* Animación: se arma de arriba hacia abajo y luego gira lentamente */
  let raf = 0, last = performance.now(), time = 0, angle = -0.6, speed = 0.55, target = 0.55, built = false;
  const brand = logo.closest("a") || logo;
  brand.addEventListener("pointerenter", () => { target = 2.2; if (!raf) loop(); });
  brand.addEventListener("pointerleave", () => { target = 0.55; });

  function place(t) {
    let done = true;
    for (const p of parts) {
      const u = Math.min(Math.max((t - p.delay) / 0.5, 0), 1);
      if (u < 1) done = false;
      const e = 1 - Math.pow(1 - u, 3);
      p.obj.scale.setScalar(Math.max(e, 0.0001));
      p.obj.visible = u > 0;
    }
    return done;
  }

  function loop() {
    raf = 0;
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (document.hidden) return;
    time += dt;
    if (!built) built = place(time);
    if (motionOff()) {
      if (!built) { place(99); built = true; }
      spine.rotation.y = -0.6;
      render();
      return; // cuadro fijo
    }
    speed += (target - speed) * Math.min(dt * 4, 1);
    angle += dt * speed;
    spine.rotation.y = angle;
    render();
    raf = requestAnimationFrame(loop);
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !raf) { last = performance.now(); loop(); }
  });
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener?.("change", () => { if (!raf) loop(); });
  new MutationObserver(() => { if (!raf) { last = performance.now(); loop(); } })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  resize();
  logo.classList.add("is-3d");
  if (motionOff()) place(99);
  loop();
}
