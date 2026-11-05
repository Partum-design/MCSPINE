/* MC Spine · Columna 3D del hero (Three.js, modelado procedural)
   - Se arma vértebra por vértebra al terminar el preloader
   - Discos con brillo (bloom), partículas, paralaje con el puntero
   - Selector de zona: cervical / toracolumbar / lumbar
   - Solo renderiza mientras el hero está visible; respeta "reducir movimiento" */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const hero = document.querySelector("[data-hero3d]");
const canvas = hero?.querySelector("canvas");
if (hero && canvas) init();

function init() {
  let raf = 0, last = performance.now(), time = 0, lowQ = false, stopped = false;
  const perf = { n: 0, sum: 0, start: performance.now() };
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  const motionOff = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("a11y-motion");

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, powerPreference: "high-performance" });
  } catch {
    hero.classList.add("no-webgl");
    return;
  }
  // Sin aceleración gráfica real (SwiftShader, llvmpipe...) el 3D congela la página: se usa la imagen fija
  const force = new URLSearchParams(location.search).has("force3d");
  try {
    const gl = renderer.getContext();
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const gpu = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
    if (!force && /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i.test(gpu)) {
      renderer.dispose();
      hero.classList.add("no-webgl");
      return;
    }
  } catch { /* sin información del GPU: se intenta y se mide el rendimiento */ }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x06132a, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x06132a, 22, 70);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const camBase = { z: isMobile ? 19 : 15.5, y: 0 };
  camera.position.set(0, 0, camBase.z);

  /* ---------- Luces ---------- */
  scene.add(new THREE.HemisphereLight(0x9cc3ff, 0x07142b, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(-6, 6, 9);
  scene.add(key);
  const rimA = new THREE.PointLight(0x2f7bff, 90, 24, 1.6);
  rimA.position.set(4, 2, -5);
  scene.add(rimA);
  const rimB = new THREE.PointLight(0x5fd2ff, 55, 22, 1.6);
  rimB.position.set(-5, -4, -4);
  scene.add(rimB);

  /* ---------- Halo de fondo ---------- */
  const glowTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, "rgba(47,123,255,0.9)");
    grd.addColorStop(0.35, "rgba(31,90,200,0.35)");
    grd.addColorStop(1, "rgba(6,19,42,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  })();
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, opacity: 0.5 }));
  halo.scale.set(14, 20, 1);
  halo.position.set(0, 0, -6);
  scene.add(halo);

  /* ---------- Curva de la columna (lordosis / cifosis) ---------- */
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 5.6, 0.25),
    new THREE.Vector3(0, 4.3, 0.6),
    new THREE.Vector3(0, 2.9, 0.25),
    new THREE.Vector3(0, 1.1, -0.45),
    new THREE.Vector3(0, -0.8, -0.6),
    new THREE.Vector3(0, -2.3, -0.1),
    new THREE.Vector3(0, -3.7, 0.55),
    new THREE.Vector3(0, -5.0, 0.35),
    new THREE.Vector3(0, -6.1, -0.35),
  ]);

  // 7 cervicales, 12 torácicas, 5 lumbares
  const levels = [];
  for (let i = 0; i < 7; i++) levels.push({ zone: 0, r: 0.4 + i * 0.016, h: 0.26, gap: 0.11 });
  for (let i = 0; i < 12; i++) levels.push({ zone: 1, r: 0.52 + i * 0.02, h: 0.32 + i * 0.006, gap: 0.12 });
  for (let i = 0; i < 5; i++) levels.push({ zone: 2, r: 0.8 + i * 0.03, h: 0.44, gap: 0.17 });
  const total = levels.reduce((a, l) => a + l.h + l.gap, 0) + 0.9; // + sacro
  const scale = curve.getLength() / total;

  /* ---------- Materiales ---------- */
  const bone = new THREE.MeshPhysicalMaterial({
    color: 0xd4e3f6, roughness: 0.42, metalness: 0.04, clearcoat: 0.55, clearcoatRoughness: 0.35,
    emissive: 0x0b2350, emissiveIntensity: 0.22,
  });
  const discMats = [0, 1, 2].map(() => new THREE.MeshStandardMaterial({
    color: 0x8cc6ff, emissive: 0x2f86ff, emissiveIntensity: 1.4, roughness: 0.25, metalness: 0,
  }));

  /* ---------- Geometrías ---------- */
  const bodyGeo = (r, h) => {
    const pts = [];
    const n = 10;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const y = -h / 2 + t * h;
      const waist = 1 - 0.07 * Math.sin(Math.PI * t); // ligera cintura
      const edge = t < 0.12 ? 0.9 + t * 0.8 : t > 0.88 ? 0.9 + (1 - t) * 0.8 : 1;
      pts.push(new THREE.Vector2(r * waist * Math.min(edge, 1), y));
    }
    pts.unshift(new THREE.Vector2(0, -h / 2));
    pts.push(new THREE.Vector2(0, h / 2));
    const g = new THREE.LatheGeometry(pts, isMobile ? 22 : 32);
    g.scale(1.08, 1, 0.82);
    return g;
  };
  const capsule = (rad, len) => new THREE.CapsuleGeometry(rad, len, 4, isMobile ? 8 : 12);

  function vertebra(l) {
    const g = new THREE.Group();
    const r = l.r * scale, h = l.h * scale;
    g.add(new THREE.Mesh(bodyGeo(r, h), bone));
    // Arco posterior (agujero vertebral)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.5, r * 0.13, 8, isMobile ? 16 : 24), bone);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0, -r * 1.3);
    ring.scale.set(1.1, 1, 0.85);
    g.add(ring);
    // Apófisis espinosa (hacia atrás y abajo)
    const sp = new THREE.Mesh(capsule(r * 0.17, r * (l.zone === 1 ? 1.1 : 0.8)), bone);
    sp.rotation.x = Math.PI / 2 + (l.zone === 1 ? 0.75 : 0.35);
    sp.position.set(0, -h * 0.3, -r * 2.15);
    g.add(sp);
    // Apófisis transversas
    for (const s of [-1, 1]) {
      const tp = new THREE.Mesh(capsule(r * 0.15, r * (l.zone === 2 ? 0.75 : 0.55)), bone);
      tp.rotation.z = Math.PI / 2 + s * 0.18;
      tp.rotation.y = s * 0.35;
      tp.position.set(s * r * 0.95, h * 0.05, -r * 1.1);
      g.add(tp);
    }
    return g;
  }

  const spine = new THREE.Group();
  scene.add(spine);
  const parts = []; // { obj, home position, quaternion, delay }
  const zoneCenters = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const zoneCount = [0, 0, 0];
  const up = new THREE.Vector3(0, 1, 0);
  let s = 0;
  const L = curve.getLength();

  levels.forEach((l, i) => {
    const u = (s + (l.h / 2)) * scale / L;
    const p = curve.getPointAt(Math.min(u, 1));
    const tan = curve.getTangentAt(Math.min(u, 1)).multiplyScalar(-1);
    const q = new THREE.Quaternion().setFromUnitVectors(up, tan);
    const v = vertebra(l);
    v.position.copy(p);
    v.quaternion.copy(q);
    spine.add(v);
    parts.push({ obj: v, pos: p.clone(), quat: q.clone(), delay: i * 0.055 });
    zoneCenters[l.zone].add(p);
    zoneCount[l.zone]++;
    s += l.h + l.gap;
    // disco debajo de la vértebra
    if (i < levels.length - 1) {
      const du = (s - l.gap / 2) * scale / L;
      const dp = curve.getPointAt(Math.min(du, 1));
      const dq = new THREE.Quaternion().setFromUnitVectors(up, curve.getTangentAt(Math.min(du, 1)).multiplyScalar(-1));
      const r = (l.r + levels[i + 1].r) / 2 * scale;
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.98, r * 0.98, l.gap * scale * 0.72, isMobile ? 22 : 32), discMats[l.zone]);
      disc.scale.set(1.08, 1, 0.82);
      disc.position.copy(dp);
      disc.quaternion.copy(dq);
      spine.add(disc);
      parts.push({ obj: disc, pos: dp.clone(), quat: dq.clone(), delay: i * 0.055 + 0.03 });
    }
  });
  zoneCenters.forEach((c, z) => c.divideScalar(zoneCount[z]));

  // Sacro
  {
    const u = Math.min((s + 0.45) * scale / L, 0.995);
    const p = curve.getPointAt(u);
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push(new THREE.Vector2(0.95 * (1 - t) ** 0.8 * scale + 0.05, -t * 1.4 * scale));
    }
    const g = new THREE.LatheGeometry(pts, 28);
    g.scale(1.25, 1, 0.55);
    const sac = new THREE.Mesh(g, bone);
    sac.position.copy(p).add(new THREE.Vector3(0, 0.35, 0));
    sac.rotation.x = -0.45;
    spine.add(sac);
    parts.push({ obj: sac, pos: sac.position.clone(), quat: sac.quaternion.clone(), delay: levels.length * 0.055 });
  }

  // Centrar verticalmente
  const box = new THREE.Box3().setFromObject(spine);
  const center = box.getCenter(new THREE.Vector3());
  spine.position.y = -center.y;
  spine.rotation.y = -0.4;

  /* ---------- Partículas ---------- */
  const N = isMobile ? 160 : 380;
  const pGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  const spd = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 18;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1;
    spd[i] = 0.15 + Math.random() * 0.45;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dotTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.3, "rgba(140,198,255,.8)");
    grd.addColorStop(1, "rgba(47,123,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: isMobile ? 0.16 : 0.13, map: dotTex, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 0.85, color: 0x9fd0ff,
  }));
  scene.add(particles);

  /* ---------- Post-procesado ---------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), isMobile ? 0.55 : 0.62, 0.5, 0.6);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------- Tamaño ---------- */
  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w * (isMobile ? 0.5 : 0.75), h * (isMobile ? 0.5 : 0.75));
    camera.aspect = w / h;
    // en pantallas estrechas, alejar la cámara para que quepa la columna
    camera.position.z = camBase.z * Math.max(1, (0.5 / camera.aspect) * 0.6 + 0.55);
    camBase.zNow = camera.position.z;
    camera.updateProjectionMatrix();
    requestFrame();
  }
  new ResizeObserver(resize).observe(hero);

  /* ---------- Estado ---------- */
  let zone = -1;
  const zoneBtns = document.querySelectorAll("[data-hero-zone]");
  const hotspot = document.querySelector("[data-hotspot]");
  const hotspotLabel = hotspot?.querySelector("[data-hotspot-label]");
  const camTarget = { y: 0, z: 0, look: 0 };
  function setZone(z) {
    zone = z;
    discMats.forEach((m, i) => {
      m.userData.target = z === -1 ? 1.4 : i === z ? 3.4 : 0.55;
    });
    zoneBtns.forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.heroZone === z)));
    if (z >= 0) {
      const wp = zoneCenters[z].clone();
      spine.localToWorld(wp);
      camTarget.look = wp.y * 0.85;
      camTarget.y = wp.y * 0.85;
      camTarget.z = -(camBase.zNow || camBase.z) * 0.28;
      if (hotspotLabel) hotspotLabel.textContent = zoneBtns[z]?.dataset.label || "";
      hotspot?.classList.add("is-on");
    } else {
      camTarget.look = camTarget.y = camTarget.z = 0;
      hotspot?.classList.remove("is-on");
    }
    requestFrame();
  }
  discMats.forEach((m) => { m.userData.target = 1.4; });
  zoneBtns.forEach((b) => b.addEventListener("click", () => {
    const z = +b.dataset.heroZone;
    setZone(zone === z ? -1 : z);
    autoZone = false;
  }));

  // Recorrido automático por zonas mientras nadie interactúa
  let autoZone = true;
  let autoTimer = 0;

  /* ---------- Puntero ---------- */
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    ptr.x = (e.clientX - r.left) / r.width - 0.5;
    ptr.y = (e.clientY - r.top) / r.height - 0.5;
    requestFrame();
  }, { passive: true });

  /* ---------- Visibilidad / scroll ---------- */
  let visible = true, ratio = 1;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    ratio = e.intersectionRatio;
    if (visible) requestFrame();
  }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }).observe(hero);
  document.addEventListener("visibilitychange", () => !document.hidden && requestFrame());

  /* ---------- Entrada: la columna se arma ---------- */
  let assembleStart = null;
  const scatter = parts.map(() => ({
    off: new THREE.Vector3((Math.random() - 0.5) * 9, (Math.random() - 0.2) * 6, (Math.random() - 0.5) * 6),
    rot: new THREE.Euler(Math.random() * 3, Math.random() * 3, Math.random() * 3),
  }));
  const startAssembly = () => {
    if (assembleStart !== null) return;
    assembleStart = performance.now();
    hero.classList.add("is-live");
    requestFrame();
  };
  if (motionOff()) {
    assembleStart = -1e9;
    hero.classList.add("is-live");
  } else {
    parts.forEach((p, i) => {
      p.obj.position.copy(p.pos).add(scatter[i].off);
      p.obj.scale.setScalar(0.001);
    });
    if (window.__mcReady) startAssembly();
    else window.addEventListener("mc:ready", startAssembly, { once: true });
    setTimeout(startAssembly, 4500); // respaldo
  }
  const easeOut = (t) => 1 - Math.pow(1 - t, 4);
  const tmpQ = new THREE.Quaternion();

  /* ---------- Bucle ---------- */
  function requestFrame() { if (!raf && !stopped) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    const raw = (now - last) / 1000;
    const dt = Math.min(raw, 0.05);
    last = now;
    const still = motionOff();
    if (!still) time += dt;

    // armado
    let assembling = false;
    if (assembleStart !== null) {
      const el = (now - assembleStart) / 1000;
      parts.forEach((p, i) => {
        const t = Math.min(Math.max((el - p.delay) / 1.1, 0), 1);
        if (t < 1) assembling = true;
        const k = easeOut(t);
        p.obj.position.copy(p.pos).addScaledVector(scatter[i].off, 1 - k);
        tmpQ.setFromEuler(scatter[i].rot);
        p.obj.quaternion.copy(tmpQ).slerp(p.quat, k);
        p.obj.scale.setScalar(Math.max(k, 0.001));
      });
    }

    // giro suave + paralaje
    ptr.sx += (ptr.x - ptr.sx) * 0.06;
    ptr.sy += (ptr.y - ptr.sy) * 0.06;
    spine.rotation.y = -0.4 + (still ? 0 : Math.sin(time * 0.22) * 0.5) + ptr.sx * 0.6;
    spine.rotation.x = ptr.sy * 0.15;
    const out = 1 - ratio; // al salir del hero
    spine.rotation.z = out * 0.25;

    // cámara hacia la zona elegida
    const zNow = camBase.zNow || camBase.z;
    camera.position.y += (camTarget.y + ptr.sy * -0.6 - camera.position.y) * 0.05;
    camera.position.z += (zNow + camTarget.z + out * 4 - camera.position.z) * 0.05;
    camera.position.x += (ptr.sx * 1.2 - camera.position.x) * 0.05;
    camera.lookAt(0, camTarget.look, 0);

    // brillo de discos (pulso)
    discMats.forEach((m, i) => {
      const pulse = still ? 0 : Math.sin(time * 2 + i) * 0.25;
      m.emissiveIntensity += ((m.userData.target ?? 1.4) + pulse - m.emissiveIntensity) * 0.08;
    });

    // partículas que suben
    if (!still) {
      const a = pGeo.attributes.position.array;
      for (let i = 0; i < N; i++) {
        a[i * 3 + 1] += spd[i] * dt;
        a[i * 3] += Math.sin(time + i) * 0.002;
        if (a[i * 3 + 1] > 8) a[i * 3 + 1] = -8;
      }
      pGeo.attributes.position.needsUpdate = true;
    }

    // recorrido automático
    if (autoZone && !still && assembleStart !== null && !assembling) {
      autoTimer += dt;
      if (autoTimer > 4.2) { autoTimer = 0; setZone(zone >= 2 ? -1 : zone + 1); }
    }

    // etiqueta sobre la zona
    if (hotspot && zone >= 0) {
      const wp = zoneCenters[zone].clone();
      spine.localToWorld(wp);
      wp.x += 0.9;
      wp.project(camera);
      const x = (wp.x * 0.5 + 0.5) * hero.clientWidth;
      const y = (-wp.y * 0.5 + 0.5) * hero.clientHeight;
      const flip = x > hero.clientWidth - 230;
      hotspot.classList.toggle("is-flip", flip);
      hotspot.style.transform = `translate3d(${x}px, ${y}px, 0)${flip ? " translateX(-100%)" : ""}`;
    }

    if (lowQ) renderer.render(scene, camera); else composer.render();
    // Medición de rendimiento durante los primeros segundos
    if (!force && perf.n < 90 && now - perf.start > 400) {
      perf.n++; perf.sum += raw;
      if (perf.n === 45 || perf.n === 90) {
        const avg = perf.sum / perf.n;
        if (avg > 0.06 && lowQ) { stopped = true; hero.classList.remove("is-live"); hero.classList.add("no-webgl"); return; }
        if (avg > 0.034 && !lowQ) { lowQ = true; renderer.setPixelRatio(1); resize(); perf.n = 0; perf.sum = 0; }
      }
    }
    const moving = !still || assembling || Math.abs(ptr.x - ptr.sx) > 0.001;
    if (visible && !document.hidden && moving) requestFrame();
  }
  resize();
  requestFrame();
  // Expone para el panel de accesibilidad
  window.addEventListener("mc:a11y", () => requestFrame());
}
