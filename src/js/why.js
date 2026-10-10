/* IP3 Consulting — /why-ip3 journey.
 * Scroll position becomes a continuous scene coordinate u (0 opening, 1 complexity … 6 impact). A three.js world
 * (vendored r160, loaded only on this page) follows u behind the text: a contour landscape that is rough at first and
 * terraced once understood, system layers, evidence strata, signals that travel between states, policy documents and
 * the institutions a decision has to reach. Ported from the ip3website React-Three-Fiber scene; palette is IP3's.
 * The page reads completely without it: the static contour poster stays, and CSS draws the layers instead. */
const d = document;
const root = d.documentElement;
const wrap = d.querySelector('[data-wj]');

const COLORS = {
  bg: '#12100f', ground: '#2b221e', line: '#e8946f', warm: '#86c25a',
  pane: '#f0a98f', paneAccent: '#fff4ec', node: '#fff4ec', fill: '#2a201c',
};

/* ------------------------------------------------------------------ terrain (pure maths, seeded) */
const TERRAIN_SIZE = 44;
const SITE = { cx: 2.6, cz: 1.2, rx: 5.2, rz: 4.2, y: 0.22 };
const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
function hash(ix, iy, seed) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed + 1, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
const sm = (t) => t * t * (3 - 2 * t);
function valueNoise(x, y, seed) {
  const ix = Math.floor(x); const iy = Math.floor(y); const u = sm(x - ix); const v = sm(y - iy);
  const a = hash(ix, iy, seed); const b = hash(ix + 1, iy, seed); const c = hash(ix, iy + 1, seed); const e = hash(ix + 1, iy + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v;
}
function fbm(x, y, seed, octaves) {
  let amp = 0.5; let freq = 1; let sum = 0; let norm = 0;
  for (let i = 0; i < octaves; i++) { sum += amp * valueNoise(x * freq, y * freq, seed + i * 17); norm += amp; amp *= 0.5; freq *= 2.03; }
  return sum / norm;
}
function ridged(x, y, seed, octaves) {
  let amp = 0.55; let freq = 1; let sum = 0; let norm = 0;
  for (let i = 0; i < octaves; i++) { const n = 1 - Math.abs(2 * valueNoise(x * freq, y * freq, seed + i * 31) - 1); sum += amp * n * n; norm += amp; amp *= 0.5; freq *= 2.1; }
  return sum / norm;
}
const siteMask = (x, z) => smoothstep(0.75, 1.35, Math.hypot((x - SITE.cx) / SITE.rx, (z - SITE.cz) / SITE.rz));
const basinMask = (x, z) => lerp(0.22, 1, smoothstep(0.35, 1.05, Math.hypot(x * 0.085, z * 0.14)));
const edgeMask = (x, z) => 1 - smoothstep(17, 22, Math.hypot(x, z));
function roughHeight(x, z) {
  const nx = x * 0.11; const nz = z * 0.11;
  const r = ridged(nx + 3.1, nz - 1.7, 7, 4);
  const base = Math.max(0, r - 0.27) * 5.2 + fbm(nx * 2.4, nz * 2.4, 3, 3) * 0.35;
  return lerp(SITE.y, base * edgeMask(x, z) * basinMask(x, z), siteMask(x, z));
}
function terrace(v, steps, sharp) { const f = v * steps; const i = Math.floor(f); return (i + smoothstep(0.5 - sharp / 2, 0.5 + sharp / 2, f - i)) / steps; }
function calmHeight(x, z) {
  const nx = x * 0.11; const nz = z * 0.11;
  const v = Math.min(1, Math.max(0, (ridged(nx + 3.1, nz - 1.7, 7, 3) - 0.22) * 1.35));
  return lerp(SITE.y, terrace(v, 7, 0.45) * 3.1 * edgeMask(x, z) * basinMask(x, z), siteMask(x, z));
}
const terrainHeight = (x, z, order) => lerp(roughHeight(x, z), calmHeight(x, z), order);
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/* ------------------------------------------------------------------ story weights */
const win = (u, a, b, c, e) => smoothstep(a, b, u) * (1 - smoothstep(c, e, u));
function weightsFor(u) {
  const hero = 1 - smoothstep(0.0, 0.8, u);
  return {
    systems: Math.max(0.3 * hero, win(u, 0.35, 0.95, 1.55, 2.0)),
    links: smoothstep(0.55, 1.0, u) * (1 - smoothstep(1.5, 1.95, u)),
    strata: win(u, 1.45, 1.95, 2.5, 2.92),
    docs: Math.max(0.22 * hero, win(u, 3.3, 3.85, 4.5, 5.1)),
    buildings: smoothstep(4.0, 4.6, u) * (1 - 0.5 * smoothstep(5.4, 6.0, u)),
    rise: smoothstep(4.2, 5.3, u),
    order: smoothstep(1.9, 3.1, u),
    warm: smoothstep(4.8, 6.0, u),
    siteLabels: win(u, 4.6, 5.0, 5.6, 5.95),
    pulse: smoothstep(5.2, 5.9, u),
    hero,
  };
}

const CAMERA_KEYS = [
  { pos: [1.2, 6.4, 17.5], look: [0.6, 1.9, 0.0] },
  { pos: [5.0, 4.4, 15.4], look: [0.0, 3.1, -1.0] },
  { pos: [-3.2, 7.4, 14.2], look: [0.4, 2.7, 0.0] },
  { pos: [0.0, 3.6, 19.5], look: [-2.2, 0.9, 0.0] },
  { pos: [-2.4, 5.6, 12.6], look: [0.4, 2.6, 0.8] },
  { pos: [-1.0, 7.0, 10.8], look: [2.4, 0.4, 0.9] },
  { pos: [3.0, 11.5, 13.5], look: [2.6, 0.0, 0.6] },
];

/* ------------------------------------------------------------------ page wiring (works without WebGL) */
if (wrap) init();

function init() {
  const data = JSON.parse(wrap.querySelector('[data-wj-data]').textContent);
  const scenes = Array.prototype.slice.call(wrap.querySelectorAll('[data-wj-scene]'));
  const target = { current: 0 };
  const store = { focus: null };
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const mobileMQ = matchMedia('(max-width: 767px)');

  /* focus: chips and layer buttons pick one system or evidence layer; the 3D scene and the CSS stack both follow */
  const buttons = Array.prototype.slice.call(wrap.querySelectorAll('[data-focus]'));
  function setFocus(f) {
    store.focus = f;
    const key = f ? `${f.group}:${f.index}` : '';
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.focus === key)));
    wrap.querySelectorAll('[data-focus-layer]').forEach((el) => {
      const [g] = el.dataset.focusLayer.split(':');
      el.classList.toggle('is-on', el.dataset.focusLayer === key);
      el.classList.toggle('is-dim', !!f && f.group === g && el.dataset.focusLayer !== key);
    });
    wrap.querySelectorAll('[data-note]').forEach((el) => { el.hidden = !(f && f.group === 'systems' && String(f.index) === el.dataset.note); });
  }
  buttons.forEach((b) => b.addEventListener('click', () => {
    const [group, i] = b.dataset.focus.split(':');
    const same = store.focus && store.focus.group === group && store.focus.index === Number(i);
    setFocus(same ? null : { group, index: Number(i) });
  }));

  /* scroll → u: 0 when the opening is centred, 1 when the first scene is centred, and so on */
  const rail = Array.prototype.slice.call(wrap.querySelectorAll('[data-rail-link]'));
  const bars = Array.prototype.slice.call(wrap.querySelectorAll('[data-wj-mbar] i'));
  const mlabel = wrap.querySelector('[data-wj-mlabel]');
  let active = -1;
  let raf = 0;
  function compute() {
    raf = 0;
    const n = scenes.length;
    const mid = window.scrollY + window.innerHeight * 0.5;
    const centres = scenes.map((el) => { const r = el.getBoundingClientRect(); return r.top + window.scrollY + r.height / 2; });
    let u;
    if (mid <= centres[0]) u = 0;
    else if (mid >= centres[n - 1]) u = n - 1;
    else { let i = 0; while (i < n - 2 && mid >= centres[i + 1]) i++; u = i + (mid - centres[i]) / (centres[i + 1] - centres[i]); }
    target.current = u;
    const a = Math.round(u);
    if (a !== active) {
      active = a;
      rail.forEach((l, k) => { if (k + 1 === a) l.setAttribute('aria-current', 'step'); else l.removeAttribute('aria-current'); });
      bars.forEach((b, k) => b.classList.toggle('is-on', k + 1 <= a));
      if (mlabel) mlabel.textContent = a >= 1 && rail[a - 1] ? rail[a - 1].textContent : '';
      wrap.classList.toggle('is-story', a >= 1);
    }
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(compute); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(d.body);
  compute();

  /* the rail and mobile bar show only while the story fills the screen */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => wrap.classList.toggle('is-centred', !!(e && e.isIntersecting)), { rootMargin: '-45% 0px -45% 0px' }).observe(wrap);
    new IntersectionObserver(([e]) => wrap.classList.toggle('is-near', !!(e && e.isIntersecting)), { rootMargin: '-20% 0px -20% 0px' }).observe(wrap);
  }

  /* 3D on/off: automatic unless the reader chose, never on reduced motion or low-power devices unless asked */
  const toggle = wrap.querySelector('[data-wj-toggle]');
  const webgl = detectWebGL();
  let pref = 'auto';
  try {
    const q = new URLSearchParams(location.search).get('view');
    const s = q || localStorage.getItem('ip3-view');
    if (s === '3d' || s === 'simple') pref = s;
  } catch (e) { /* storage can be blocked */ }
  let failed = false;
  let world = null;
  let loading = false;
  const wanted = () => webgl && !failed && (pref === '3d' || (pref === 'auto' && !reduceMQ.matches && !lowPower()));
  function apply() {
    const on = wanted();
    root.dataset.view = on ? '3d' : 'simple';
    if (toggle) {
      toggle.hidden = !webgl;
      toggle.setAttribute('aria-pressed', String(on));
      toggle.textContent = on ? toggle.dataset.on : toggle.dataset.off;
    }
    if (on && !world && !loading) start();
    if (!on && world) { world.dispose(); world = null; wrap.removeAttribute('data-ready'); }
  }
  if (toggle) toggle.addEventListener('click', () => {
    failed = false;
    pref = wanted() ? 'simple' : '3d';
    try { localStorage.setItem('ip3-view', pref); } catch (e) { /* ignore */ }
    apply();
  });
  reduceMQ.addEventListener('change', apply);

  function start() {
    loading = true;
    import('/assets/vendor/three.module.min.js').then((THREE) => {
      loading = false;
      if (!wanted() || world) return;
      try {
        world = createWorld(THREE, {
          host: wrap.querySelector('[data-wj-canvas]'), data, target, store,
          mobile: mobileMQ.matches, reduced: reduceMQ.matches,
          onReady: () => wrap.setAttribute('data-ready', ''),
          onLost: () => { failed = true; apply(); },
        });
      } catch (e) { failed = true; apply(); }
      if (world && 'IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => { if (world) world.setRun(!!(e && e.isIntersecting)); }, { rootMargin: '10% 0px' }).observe(wrap);
      }
    }).catch(() => { loading = false; failed = true; apply(); });
  }
  apply();
}

function detectWebGL() {
  try {
    const c = d.createElement('canvas');
    const gl = c.getContext('webgl2');
    if (!gl) return false;
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return true;
  } catch (e) { return false; }
}

function lowPower() {
  const nav = navigator;
  if (nav.connection && nav.connection.saveData) return true;
  if (nav.connection && nav.connection.effectiveType && /(^|-)(2g|3g)$/.test(nav.connection.effectiveType)) return true;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) return true;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2) return true;
  return false;
}

/* ------------------------------------------------------------------ the three.js world */
function createWorld(THREE, { host, data, target, store, mobile, reduced, onReady, onLost }) {
  const raw = (hex) => new THREE.Color().setStyle(hex, THREE.LinearSRGBColorSpace);
  const disposables = [];
  const keep = (x) => { disposables.push(x); return x; };

  const renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: false, powerPreference: 'high-performance' });
  const maxDpr = mobile ? 1.25 : 1.6;
  let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(COLORS.bg, 1);
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  const onContextLost = (e) => { e.preventDefault(); onLost(); };
  canvas.addEventListener('webglcontextlost', onContextLost);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 90);
  camera.position.set(0, 3, 16.5);
  let width = 1; let height = 1;
  function resize() {
    width = host.clientWidth || window.innerWidth; height = host.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const aspect = camera.aspect;
    if (aspect >= 1.1) camera.setViewOffset(width, height, -width * Math.min(0.17, 0.05 + (aspect - 1.1) * 0.12), 0, width, height);
    else camera.setViewOffset(width, height, 0, height * 0.2, width, height);
    camera.updateProjectionMatrix();
    pointScale = height * dpr * 0.62;
  }
  let pointScale = 400;

  /* driver: follows the scroll closely but never snaps */
  const driver = { u: 0, w: weightsFor(0) };
  function drive(delta) {
    const k = 1 - Math.exp(-Math.min(delta, 0.2) * 5.5);
    driver.u += (target.current - driver.u) * k;
    if (Math.abs(target.current - driver.u) < 0.0004) driver.u = target.current;
    driver.w = weightsFor(driver.u);
  }

  /* ---- layout derived from the CMS lists ---- */
  const systems = data.systems;
  const PANE = { w: 9, h: 5.4, y: 3.3 };
  const PANE_PATTERN = [0, 4, 1, 5, 2, 3];
  const NODE_LOCAL = [[-2.4, 1.4], [1.9, 1.0], [-1.2, -0.9], [2.7, -1.2], [0.2, 1.7], [-2.7, -0.3]];
  const panes = systems.map((s, i) => ({ x: i % 2 === 0 ? -0.55 : 0.55, y: PANE.y, z: 3.0 - i * 1.85, rotY: i % 2 === 0 ? 0.05 : -0.05 }));
  const nodes = panes.map((p, i) => { const [lx, ly] = NODE_LOCAL[i % NODE_LOCAL.length]; return new THREE.Vector3(p.x + lx * Math.cos(p.rotY), p.y + ly, p.z - lx * Math.sin(p.rotY)); });
  const linkPairs = [];
  const seen = new Set();
  systems.forEach((s, a) => s.relates.forEach((b) => { if (b < 0 || b === a) return; const key = [a, b].sort().join('|'); if (!seen.has(key)) { seen.add(key); linkPairs.push([a, b]); } }));
  const linkArcs = linkPairs.map(([a, b]) => {
    const pa = nodes[a]; const pb = nodes[b];
    const mid = pa.clone().add(pb).multiplyScalar(0.5); mid.y += 0.55 + pa.distanceTo(pb) * 0.08;
    return { a, b, points: new THREE.QuadraticBezierCurve3(pa, mid, pb).getPoints(20) };
  });
  const STRATA = { w: 8.6, d: 5.2, topY: 5.0, step: 0.95 };
  const STRATA_POS = { x: -0.6, z: 0.2, rotY: -0.18 };
  const STRATA_PATTERN = [5, 1, 0, 3, 2];
  const strata = data.evidence.map((name, i) => ({ name, y: STRATA.topY - i * STRATA.step, type: STRATA_PATTERN[i % STRATA_PATTERN.length] }));
  const flowCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.4, 7.4, 3.0), new THREE.Vector3(0.2, 5.4, 2.7), new THREE.Vector3(1.4, 3.4, 2.3),
    new THREE.Vector3(2.1, 1.7, 1.9), new THREE.Vector3(2.5, 0.6, 1.4),
  ], false, 'catmullrom', 0.5);
  const site = generateSite();

  /* ---- terrain: contour lines on the GPU, rough → terraced, warming where services land ---- */
  const tg = keep(new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, mobile ? 150 : 230, mobile ? 150 : 230));
  tg.rotateX(-Math.PI / 2);
  const tpos = tg.getAttribute('position');
  const rough = new Float32Array(tpos.count); const calm = new Float32Array(tpos.count);
  for (let i = 0; i < tpos.count; i++) { const x = tpos.getX(i); const z = tpos.getZ(i); rough[i] = roughHeight(x, z); calm[i] = calmHeight(x, z); }
  tg.setAttribute('aRough', new THREE.BufferAttribute(rough, 1));
  tg.setAttribute('aCalm', new THREE.BufferAttribute(calm, 1));
  const terrainMat = keep(new THREE.ShaderMaterial({
    vertexShader: `attribute float aRough; attribute float aCalm; uniform float uOrder; varying vec3 vWorld;
      void main(){ float h = mix(aRough, aCalm, uOrder); vec3 p = vec3(position.x, h, position.z); vWorld = p; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: `precision highp float;
      uniform float uOrder; uniform float uWarm; uniform float uPulse; uniform float uTime; uniform float uBright;
      uniform vec2 uSite; uniform vec3 uBg; uniform vec3 uGround; uniform vec3 uLine; uniform vec3 uWarmCol; varying vec3 vWorld;
      float contour(float f, float width){ float fw = fwidth(f); float g = abs(fract(f - 0.5) - 0.5) / max(fw, 1e-4); return 1.0 - smoothstep(width - 0.5, width + 0.9, g); }
      void main(){
        vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld))); if (n.y < 0.0) n = -n;
        float shade = clamp(dot(n, normalize(vec3(-0.45, 0.8, 0.35))), 0.0, 1.0);
        float f = vWorld.y / mix(0.26, 0.443, uOrder) + 0.5 * uOrder;
        float minor = contour(f, 0.85); float major = contour(f / 5.0, 1.5);
        float dSite = length(vWorld.xz - uSite); float fade = 1.0 - smoothstep(13.0, 21.0, length(vWorld.xz));
        float rad = fract(uTime * 0.085) * 17.0;
        float ring = exp(-pow((dSite - rad) / 0.7, 2.0)) * (1.0 - rad / 17.0) * uPulse;
        float warmth = clamp(uWarm * (1.0 - smoothstep(2.0, 13.0, dSite)) * 1.1 + ring, 0.0, 1.0);
        vec3 ground = mix(uBg, uGround, 0.35 + 0.65 * shade);
        ground = mix(ground, uGround * 1.15, 0.15 * smoothstep(0.0, 3.0, vWorld.y));
        vec3 lineCol = mix(uLine, uWarmCol, warmth);
        float a = (minor * 0.55 + major * 0.9) * (0.8 + 0.2 * smoothstep(0.0, 2.6, vWorld.y));
        a += ring * 0.55 * (minor + major);
        vec3 col = mix(ground, lineCol, clamp(a, 0.0, 1.0));
        col += uWarmCol * (ring * 0.14 + uWarm * (1.0 - smoothstep(0.0, 6.5, dSite)) * 0.07);
        col *= uBright; col = mix(uBg, col, fade);
        gl_FragColor = vec4(col, 1.0);
      }`,
    uniforms: {
      uOrder: { value: 0 }, uWarm: { value: 0 }, uPulse: { value: 0 }, uTime: { value: 0 }, uBright: { value: 1 },
      uSite: { value: new THREE.Vector2(SITE.cx, SITE.cz) }, uBg: { value: raw(COLORS.bg) }, uGround: { value: raw(COLORS.ground) },
      uLine: { value: raw(COLORS.line) }, uWarmCol: { value: raw(COLORS.warm) },
    },
  }));
  const terrain = new THREE.Mesh(tg, terrainMat);
  terrain.frustumCulled = false;
  scene.add(terrain);

  /* ---- patterned layers: one shader, a different texture of information per layer ---- */
  const patternFrag = `precision highp float;
    uniform float uOpacity; uniform float uFocus; uniform float uTime; uniform float uPattern; uniform vec2 uSize; uniform vec3 uColor; uniform vec3 uAccent; varying vec2 vUv;
    float aa(float d, float w){ float fw = fwidth(d); return 1.0 - smoothstep(w - fw, w + fw, d); }
    vec2 hash2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
    float pattern(vec2 p){
      if (uPattern < 0.5) { vec2 g = abs(fract(p / 0.5 - 0.5) - 0.5) * 0.5; return max(aa(g.x, 0.012), aa(g.y, 0.012)) * 0.75; }
      if (uPattern < 1.5) { vec2 c = fract(p / 0.34 - 0.5) - 0.5; return aa(length(c) * 0.34, 0.05) * 0.9; }
      if (uPattern < 2.5) { float dd = abs(fract((p.x + p.y) / 0.3) - 0.5) * 0.3; return aa(dd, 0.012) * 0.7; }
      if (uPattern < 3.5) { float dd = abs(fract(length(p * vec2(0.8, 1.0)) / 0.5 - 0.5) - 0.5) * 0.5; return aa(dd, 0.014) * 0.8; }
      if (uPattern < 4.5) { float y = p.y + sin(p.x * 1.6 + uTime * 0.25) * 0.16 + sin(p.x * 3.7) * 0.05; float dd = abs(fract(y / 0.32 - 0.5) - 0.5) * 0.32; return aa(dd, 0.014) * 0.8; }
      vec2 q = p * 1.15; vec2 i = floor(q); vec2 f = fract(q); float d1 = 8.0; float d2 = 8.0;
      for (int y = -1; y <= 1; y++) { for (int x = -1; x <= 1; x++) { vec2 g = vec2(float(x), float(y)); float dd = length(g + hash2(i + g) - f); if (dd < d1) { d2 = d1; d1 = dd; } else if (dd < d2) { d2 = dd; } } }
      return aa(d2 - d1, 0.045) * 0.85;
    }
    void main(){
      vec2 p = (vUv - 0.5) * uSize; float pat = pattern(p);
      vec2 e = min(vUv, 1.0 - vUv) * uSize; float edge = aa(min(e.x, e.y), 0.018);
      float inner = smoothstep(0.0, 0.7, min(e.x, e.y));
      vec3 col = mix(uColor, uAccent, uFocus * 0.55);
      float a = (0.045 + 0.03 * uFocus) + pat * 0.34 * inner + edge * 0.85;
      a *= uOpacity * (1.0 + uFocus * 1.15);
      gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
    }`;
  const patternVert = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
  const patternMaterial = (size, pattern) => keep(new THREE.ShaderMaterial({
    vertexShader: patternVert, fragmentShader: patternFrag, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: {
      uOpacity: { value: 0 }, uFocus: { value: 0 }, uTime: { value: 0 }, uPattern: { value: pattern },
      uSize: { value: new THREE.Vector2(size[0], size[1]) }, uColor: { value: raw(COLORS.pane) }, uAccent: { value: raw(COLORS.paneAccent) },
    },
  }));

  const paneGeo = keep(new THREE.PlaneGeometry(PANE.w, PANE.h));
  const paneObjs = panes.map((p, i) => {
    const mat = patternMaterial([PANE.w, PANE.h], PANE_PATTERN[i % PANE_PATTERN.length]);
    const mesh = new THREE.Mesh(paneGeo, mat);
    mesh.position.set(p.x, p.y, p.z); mesh.rotation.y = p.rotY; mesh.frustumCulled = false; mesh.renderOrder = i;
    scene.add(mesh);
    return { mesh, mat, focus: 0 };
  });

  const strataGeo = keep(new THREE.PlaneGeometry(STRATA.w, STRATA.d)); strataGeo.rotateX(-Math.PI / 2);
  const box = new THREE.BoxGeometry(STRATA.w, 0.1, STRATA.d);
  const edgeGeo = keep(new THREE.EdgesGeometry(box)); box.dispose();
  const strataObjs = strata.map((l, i) => {
    const group = new THREE.Group();
    group.position.set(STRATA_POS.x, l.y, STRATA_POS.z); group.rotation.y = STRATA_POS.rotY;
    const mat = patternMaterial([STRATA.w, STRATA.d], l.type);
    const mesh = new THREE.Mesh(strataGeo, mat); mesh.frustumCulled = false; mesh.renderOrder = i;
    const em = keep(new THREE.LineBasicMaterial({ color: COLORS.pane, transparent: true, opacity: 0, depthWrite: false }));
    const edges = new THREE.LineSegments(edgeGeo, em);
    group.add(mesh, edges); scene.add(group);
    return { mesh, mat, edges, em, focus: 0 };
  });

  /* ---- links between related systems: pulses run along each arc ---- */
  const lp = []; const lt = []; const lph = [];
  linkArcs.forEach((arc, ai) => {
    const phase = (ai * 0.37) % 1; const n = arc.points.length;
    for (let i = 0; i < n - 1; i++) {
      const a = arc.points[i]; const b = arc.points[i + 1];
      lp.push(a.x, a.y, a.z, b.x, b.y, b.z); lt.push(i / (n - 1), (i + 1) / (n - 1)); lph.push(phase, phase);
    }
  });
  const linkGeo = keep(new THREE.BufferGeometry());
  linkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lp), 3));
  linkGeo.setAttribute('aT', new THREE.BufferAttribute(new Float32Array(lt), 1));
  linkGeo.setAttribute('aPhase', new THREE.BufferAttribute(new Float32Array(lph), 1));
  const linkMat = keep(new THREE.ShaderMaterial({
    vertexShader: 'attribute float aT; attribute float aPhase; varying float vT; varying float vPhase; void main(){ vT = aT; vPhase = aPhase; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `precision highp float; uniform float uOpacity; uniform float uTime; uniform vec3 uColor; varying float vT; varying float vPhase;
      void main(){ float run = fract(vT - uTime * 0.12 - vPhase); float pulse = exp(-pow((run - 0.5) / 0.09, 2.0));
      gl_FragColor = vec4(mix(uColor, vec3(1.0, 0.97, 0.92), pulse * 0.6), (0.28 + pulse * 0.7) * uOpacity); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uOpacity: { value: 0 }, uTime: { value: 0 }, uColor: { value: raw(COLORS.pane) } },
  }));
  const links = new THREE.LineSegments(linkGeo, linkMat); links.frustumCulled = false; links.renderOrder = 4; scene.add(links);
  const nodeGeo = keep(new THREE.BufferGeometry());
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nodes.flatMap((v) => [v.x, v.y, v.z])), 3));
  const nodeMat = keep(new THREE.ShaderMaterial({
    vertexShader: 'uniform float uScale; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = clamp(0.5 * uScale / -mv.z, 6.0, 60.0); }',
    fragmentShader: `precision highp float; uniform float uOpacity; uniform vec3 uColor;
      void main(){ float dd = length(gl_PointCoord - 0.5) * 2.0; if (dd > 1.0) discard;
      float ring = 1.0 - smoothstep(0.0, 0.1, abs(dd - 0.5)); float core = 1.0 - smoothstep(0.0, 0.3, dd); float glow = pow(1.0 - dd, 2.0) * 0.4;
      gl_FragColor = vec4(uColor, (ring * 0.8 + core + glow) * uOpacity); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uOpacity: { value: 0 }, uScale: { value: 400 }, uColor: { value: raw(COLORS.node) } },
  }));
  const nodePts = new THREE.Points(nodeGeo, nodeMat); nodePts.frustumCulled = false; nodePts.renderOrder = 6; scene.add(nodePts);

  /* ---- institutions and the households around them rise out of the ordered ground ---- */
  const bGeo = keep(new THREE.BoxGeometry(1, 1, 1)); bGeo.translate(0, 0.5, 0);
  bGeo.setAttribute('aDelay', new THREE.InstancedBufferAttribute(new Float32Array(site.buildings.map((b) => b.delay)), 1));
  bGeo.setAttribute('aMain', new THREE.InstancedBufferAttribute(new Float32Array(site.buildings.map((b) => (b.h > 0.6 ? 1 : 0))), 1));
  const bMat = keep(new THREE.ShaderMaterial({
    vertexShader: `attribute float aDelay; attribute float aMain; uniform float uRise; varying vec2 vUv; varying vec3 vNormal; varying float vMain; varying float vShown;
      void main(){ vUv = uv; vNormal = normalize(mat3(instanceMatrix) * normal); vMain = aMain;
      float k = smoothstep(aDelay * 0.55, aDelay * 0.55 + 0.45, uRise); vShown = k;
      vec4 p = vec4(position, 1.0); p.y *= max(k, 0.001); gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * p; }`,
    fragmentShader: `precision highp float; uniform float uOpacity; uniform vec3 uFill; uniform vec3 uEdge; uniform vec3 uWarmCol; varying vec2 vUv; varying vec3 vNormal; varying float vMain; varying float vShown;
      void main(){ vec2 dd = min(vUv, 1.0 - vUv) / max(fwidth(vUv), vec2(1e-4)); float edge = 1.0 - smoothstep(0.9, 2.0, min(dd.x, dd.y));
      float top = smoothstep(0.5, 1.0, vNormal.y); vec3 fill = mix(uFill * 0.85, uFill * 1.45 + uWarmCol * vMain * 0.1, top);
      vec3 col = mix(fill, mix(uEdge, uWarmCol, vMain), edge);
      gl_FragColor = vec4(col + uWarmCol * vMain * top * 0.12, uOpacity * vShown * mix(0.78, 0.98, vMain)); }`,
    transparent: true,
    uniforms: { uRise: { value: 0 }, uOpacity: { value: 0 }, uFill: { value: raw(COLORS.fill) }, uEdge: { value: raw(COLORS.pane) }, uWarmCol: { value: raw(COLORS.warm) } },
  }));
  const buildings = new THREE.InstancedMesh(bGeo, bMat, site.buildings.length);
  const m4 = new THREE.Matrix4();
  site.buildings.forEach((b, i) => { m4.makeScale(b.w, b.h, b.d).setPosition(b.x, terrainHeight(b.x, b.z, 1) - 0.04, b.z); buildings.setMatrixAt(i, m4); });
  buildings.instanceMatrix.needsUpdate = true; buildings.frustumCulled = false; buildings.renderOrder = 2; scene.add(buildings);

  /* ---- policy documents travel the route from decision towards the institutions ---- */
  const DOCS = 6;
  const docGeo = keep(new THREE.PlaneGeometry(1.05, 1.4));
  const docs = Array.from({ length: DOCS }, (_, i) => {
    const tex = keep(new THREE.CanvasTexture(drawSheet(101 + i * 13)));
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const mat = keep(new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    const mesh = new THREE.Mesh(docGeo, mat); mesh.frustumCulled = false; mesh.renderOrder = 3; scene.add(mesh);
    return { mesh, mat };
  });
  const tmp = new THREE.Vector3(); const tan = new THREE.Vector3();

  /* ---- signals: thousands of points moving between the story's states on the GPU ---- */
  const sig = generateSignals(mobile ? 900 : 1900);
  const sigGeo = keep(new THREE.BufferGeometry());
  [['position', sig.scatter, 3], ['aScatter', sig.scatter, 3], ['aLink', sig.link, 3], ['aStrata', sig.strata, 3], ['aPattern', sig.pattern, 3],
    ['aFlow', sig.flow, 3], ['aServe', sig.serve, 3], ['aRand', sig.rand, 1], ['aWarm', sig.warm, 1]].forEach(([k, v, n]) => sigGeo.setAttribute(k, new THREE.BufferAttribute(v, n)));
  const sigMat = keep(new THREE.ShaderMaterial({
    vertexShader: `attribute vec3 aScatter; attribute vec3 aLink; attribute vec3 aStrata; attribute vec3 aPattern; attribute vec3 aFlow; attribute vec3 aServe; attribute float aRand; attribute float aWarm;
      uniform float uU; uniform float uTime; uniform float uScale; uniform float uSize; uniform float uHero; varying float vWarm; varying float vAlpha;
      float step_(float k, float r){ float s = k - 1.0 + 0.08 + r * 0.38; return smoothstep(s, s + 0.42, uU); }
      void main(){
        float r = aRand; float m1 = step_(1.0, r); float m2 = step_(2.0, r); float m3 = step_(3.0, r); float m4 = step_(4.0, r); float m5 = step_(5.0, r);
        vec3 p = aScatter; p = mix(p, aLink, m1); p = mix(p, aStrata, m2); p = mix(p, aPattern, m3); p = mix(p, aFlow, m4); p = mix(p, aServe, m5);
        float travel = m1 * (1.0 - m1) + m2 * (1.0 - m2) + m3 * (1.0 - m3) + m4 * (1.0 - m4) + m5 * (1.0 - m5);
        p.y += travel * 1.6 * (r - 0.3);
        float settled = m1 * 0.65 + m2 * 0.2 + m3 * 0.1 + m5 * 0.05;
        float t = uTime * (0.35 + r * 0.5); float amp = mix(0.32, 0.05, clamp(settled, 0.0, 1.0));
        p += vec3(sin(t + r * 31.0), cos(t * 0.9 + r * 17.0) * 0.6, sin(t * 0.8 + r * 53.0)) * amp;
        vWarm = aWarm * smoothstep(3.2, 4.5, uU);
        float groundSignal = (1.0 - aWarm) * smoothstep(4.2, 5.3, uU);
        vAlpha = mix(0.9, 0.18, groundSignal) * mix(1.0, 0.55, uHero);
        vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(uSize * (0.7 + r * 0.8) * mix(1.0, 1.5, vWarm) * uScale / -mv.z, 1.5, 22.0);
      }`,
    fragmentShader: `precision highp float; uniform vec3 uCool; uniform vec3 uWarmCol; varying float vWarm; varying float vAlpha;
      void main(){ float dd = length(gl_PointCoord - 0.5) * 2.0; if (dd > 1.0) discard;
      float core = 1.0 - smoothstep(0.0, 0.45, dd); float glow = pow(1.0 - dd, 2.0);
      gl_FragColor = vec4(mix(uCool, uWarmCol, vWarm) * (0.8 + core * 0.6), (core * 0.9 + glow * 0.45) * vAlpha); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uU: { value: 0 }, uTime: { value: 0 }, uScale: { value: 400 }, uSize: { value: 0.1 }, uHero: { value: 1 }, uCool: { value: raw(COLORS.pane) }, uWarmCol: { value: raw(COLORS.warm) } },
  }));
  const signals = new THREE.Points(sigGeo, sigMat); signals.frustumCulled = false; signals.renderOrder = 5; scene.add(signals);

  /* ---- labels: plain DOM, projected from 3D each frame, so type stays crisp ---- */
  const labelItems = [];
  const labelLayer = d.createElement('div');
  labelLayer.className = 'wj-labels'; labelLayer.setAttribute('aria-hidden', 'true');
  if (!mobile) {
    systems.forEach((s, i) => labelItems.push({ text: s.name, pos: nodes[i].clone(), anchor: 'left', group: 'systems', index: i,
      o: (w, u) => smoothstep(0.55, 1, w.systems) * (1 - w.hero) * (1 - smoothstep(1.55, 1.95, u)) }));
    const cos = Math.cos(STRATA_POS.rotY); const sin = Math.sin(STRATA_POS.rotY);
    strata.forEach((l, i) => { const lx = STRATA.w / 2 - 0.25; const lz = STRATA.d / 2;
      labelItems.push({ text: l.name, pos: new THREE.Vector3(STRATA_POS.x + lx * cos + lz * sin, l.y + 0.08, STRATA_POS.z - lx * sin + lz * cos), anchor: 'right', group: 'evidence', index: i,
        o: (w) => smoothstep(0.6, 1, w.strata) }); });
    site.clusters.forEach((c, i) => { if (!data.sites[i]) return; labelItems.push({ text: data.sites[i], pos: new THREE.Vector3(c.x, c.top + 0.4, c.z), anchor: 'center',
      o: (w) => w.siteLabels * smoothstep(0.45 + i * 0.08, 0.95, w.rise) }); });
    labelItems.forEach((it) => { const el = d.createElement('div'); el.className = `wj-label wj-label--${it.anchor}`; el.textContent = it.text; labelLayer.appendChild(el); it.el = el; });
    host.appendChild(labelLayer);
  }
  const v3 = new THREE.Vector3();

  /* ---- camera follows keyframes; on wide screens the image is shifted right of the text ---- */
  const pointer = { x: 0, y: 0 };
  const onPointer = (e) => { pointer.x = (e.clientX / window.innerWidth) * 2 - 1; pointer.y = -((e.clientY / window.innerHeight) * 2 - 1); };
  window.addEventListener('pointermove', onPointer, { passive: true });
  const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const cpos = new THREE.Vector3(); const clook = new THREE.Vector3(); const ca = new THREE.Vector3(); const cb = new THREE.Vector3();

  /* ---- frame loop: runs only while the journey is near the viewport ---- */
  const clock = new THREE.Clock();
  let running = false; let frame = 0; let frames = 0;
  const gov = { t: 0, n: 0, done: false };
  function tick() {
    frame = running ? requestAnimationFrame(tick) : 0;
    const delta = Math.min(clock.getDelta(), 0.5);
    const time = clock.elapsedTime;
    drive(delta);
    const w = driver.w; const u = driver.u;
    const focus = store.focus;

    const uu = Math.min(Math.max(u, 0), CAMERA_KEYS.length - 1);
    const i0 = Math.min(Math.floor(uu), CAMERA_KEYS.length - 2); const t = smoother(uu - i0);
    cpos.fromArray(CAMERA_KEYS[i0].pos).lerp(ca.fromArray(CAMERA_KEYS[i0 + 1].pos), t);
    clook.fromArray(CAMERA_KEYS[i0].look).lerp(cb.fromArray(CAMERA_KEYS[i0 + 1].look), t);
    const fit = camera.aspect >= 1.55 ? 1 : 1 + (1.55 - camera.aspect) * 0.82;
    cpos.sub(clook).multiplyScalar(fit).add(clook);
    if (!reduced) {
      cpos.x += Math.sin(time * 0.21) * 0.28 + pointer.x * (mobile ? 0 : 0.55);
      cpos.y += Math.sin(time * 0.17) * 0.12 + pointer.y * (mobile ? 0 : 0.22);
    }
    camera.position.copy(cpos); camera.lookAt(clook);

    const tu = terrainMat.uniforms;
    tu.uOrder.value = w.order; tu.uWarm.value = w.warm; tu.uPulse.value = w.pulse; tu.uTime.value = time;
    tu.uBright.value = 1 - 0.42 * Math.max(w.strata, w.docs * 0.7, w.systems * 0.35 * (1 - w.hero));

    const ease = 1 - Math.exp(-delta * 8);
    paneObjs.forEach((p, i) => {
      const dim = focus && focus.group === 'systems' ? (focus.index === i ? 1 : 0) : -1;
      p.focus += ((dim === 1 ? 1 : 0) - p.focus) * ease;
      p.mat.uniforms.uOpacity.value = w.systems * (dim === 0 ? 0.45 : 1);
      p.mat.uniforms.uFocus.value = p.focus * (w.systems > 0.5 ? 1 : 0);
      p.mat.uniforms.uTime.value = time;
      p.mesh.visible = w.systems > 0.01;
    });
    strataObjs.forEach((s, i) => {
      const dim = focus && focus.group === 'evidence' ? (focus.index === i ? 1 : 0) : -1;
      s.focus += ((dim === 1 ? 1 : 0) - s.focus) * ease;
      const faded = dim === 0 ? 0.4 : 1;
      s.mat.uniforms.uOpacity.value = w.strata * faded; s.mat.uniforms.uFocus.value = s.focus; s.mat.uniforms.uTime.value = time;
      s.em.opacity = w.strata * 0.7 * faded + s.focus * 0.3;
      s.em.color.set(dim === 1 ? COLORS.paneAccent : COLORS.pane);
      s.mesh.visible = s.edges.visible = w.strata > 0.01;
    });
    linkMat.uniforms.uOpacity.value = w.links; linkMat.uniforms.uTime.value = time; links.visible = w.links > 0.01;
    nodeMat.uniforms.uOpacity.value = w.links; nodeMat.uniforms.uScale.value = pointScale;
    bMat.uniforms.uRise.value = w.rise; bMat.uniforms.uOpacity.value = w.buildings; buildings.visible = w.buildings > 0.01;
    const dt = reduced ? 0 : time;
    docs.forEach((doc, i) => {
      const visible = w.docs > 0.01; doc.mesh.visible = visible; if (!visible) return;
      const p = reduced ? (i + 0.5) / DOCS : (dt * 0.045 + i / DOCS) % 1;
      flowCurve.getPointAt(p, tmp); flowCurve.getTangentAt(p, tan);
      doc.mesh.position.copy(tmp);
      doc.mesh.rotation.set(-0.25 + Math.sin(dt * 0.4 + i) * 0.04, -0.35 - tan.x * 0.12, -tan.y * 0.5 + Math.sin(dt * 0.3 + i * 2) * 0.03);
      doc.mesh.scale.setScalar((1 - 0.55 * smoothstep(0.78, 1, p)) * (0.8 + 0.2 * Math.sin(i * 1.7) ** 2 + 0.15));
      doc.mat.opacity = w.docs * 0.6 * smoothstep(0, 0.12, p) * (1 - smoothstep(0.5, 0.7, p));
    });
    const su = sigMat.uniforms; su.uU.value = u; su.uTime.value = time; su.uHero.value = w.hero; su.uScale.value = pointScale;

    renderer.render(scene, camera);

    for (const it of labelItems) {
      let o = it.o(w, u);
      const isFocused = !!(focus && it.group === focus.group && it.index === focus.index);
      if (focus && it.group === focus.group && !isFocused) o *= 0.4;
      v3.copy(it.pos).project(camera);
      if (o < 0.02 || v3.z > 1) { if (it.el.style.visibility !== 'hidden') it.el.style.visibility = 'hidden'; continue; }
      it.el.style.visibility = 'visible';
      it.el.style.opacity = o.toFixed(3);
      it.el.style.transform = `translate3d(${((v3.x * 0.5 + 0.5) * width).toFixed(1)}px, ${((-v3.y * 0.5 + 0.5) * height).toFixed(1)}px, 0)`;
      it.el.classList.toggle('is-focus', isFocused);
    }

    frames += 1;
    if (frames === 3) onReady();
    if (!gov.done) {
      gov.t += delta; gov.n += 1;
      if (gov.n >= 90) {
        const avg = gov.t / gov.n; gov.t = 0; gov.n = 0;
        const floor = mobile ? 0.8 : 0.9;
        if (avg > 1 / 32) { dpr = Math.max(floor, dpr * 0.78); renderer.setPixelRatio(dpr); resize(); if (dpr <= floor) gov.done = true; } else gov.done = true;
      }
    }
  }
  function setRun(on) {
    if (on === running) return;
    running = on;
    if (on) { clock.getDelta(); if (!frame) frame = requestAnimationFrame(tick); }
  }
  const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(host); else window.addEventListener('resize', resize);
  resize();
  setRun(true);

  return {
    setRun,
    dispose() {
      running = false; if (frame) cancelAnimationFrame(frame); frame = 0;
      if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      disposables.forEach((x) => x.dispose());
      renderer.dispose();
      canvas.remove(); labelLayer.remove();
    },
  };

  /* -------- seeded layouts (same seeds as the original, so the scene is identical between visits) -------- */
  function generateSite() {
    const rnd = mulberry32(2025);
    const out = { buildings: [], clusters: [] };
    const defs = [
      { x: 0.4, z: -1.2, main: [1.5, 1.1, 1.6], annex: 3 }, { x: 3.0, z: 1.9, main: [1.7, 0.9, 0.75], annex: 2 },
      { x: 4.7, z: -0.7, main: [1.0, 1.0, 0.95], annex: 2 }, { x: 1.2, z: 3.1, main: [1.4, 0.9, 0.55], annex: 3 },
    ];
    defs.forEach((c, ci) => {
      const [w, dd, h] = c.main;
      out.buildings.push({ x: c.x, z: c.z, w, d: dd, h, delay: ci * 0.12 });
      out.clusters.push({ x: c.x, z: c.z, top: SITE.y + h });
      for (let k = 0; k < c.annex; k++) {
        const ang = (k / c.annex) * Math.PI * 2 + rnd() * 0.8; const rad = 1.15 + rnd() * 0.5;
        out.buildings.push({ x: c.x + Math.cos(ang) * rad, z: c.z + Math.sin(ang) * rad, w: 0.45 + rnd() * 0.4, d: 0.4 + rnd() * 0.4, h: 0.22 + rnd() * 0.32, delay: ci * 0.12 + 0.1 + rnd() * 0.25 });
      }
    });
    for (let i = 0; i < 16; i++) {
      const x = SITE.cx + (rnd() - 0.5) * 7.4; const z = SITE.cz + (rnd() - 0.5) * 6.0;
      if (out.buildings.some((b) => Math.hypot(b.x - x, b.z - z) < 0.95)) continue;
      out.buildings.push({ x, z, w: 0.3 + rnd() * 0.2, d: 0.3 + rnd() * 0.2, h: 0.14 + rnd() * 0.12, delay: 0.45 + rnd() * 0.45 });
    }
    return out;
  }

  function generateSignals(count) {
    const rnd = mulberry32(7331);
    const gauss = () => (rnd() + rnd() + rnd() - 1.5) * 1.15;
    const mk = () => new Float32Array(count * 3);
    const s = { scatter: mk(), link: mk(), strata: mk(), pattern: mk(), flow: mk(), serve: mk(), rand: new Float32Array(count), warm: new Float32Array(count) };
    const settlements = Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2 + rnd() * 0.5; const r = 8.5 + rnd() * 6.5; return { x: Math.cos(a) * r + 1, z: Math.sin(a) * r * 0.8 + 0.5 }; });
    const pf = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const o = i * 3;
      s.rand[i] = rnd(); s.warm[i] = rnd() < 0.3 ? 1 : 0;
      s.scatter[o] = (rnd() - 0.5) * 20; s.scatter[o + 1] = 0.5 + rnd() * 7.5; s.scatter[o + 2] = -9 + rnd() * 15;
      if (linkArcs.length) {
        const arc = linkArcs[i % linkArcs.length]; const tt = rnd() * (arc.points.length - 1); const k = Math.floor(tt);
        const p0 = arc.points[k]; const p1 = arc.points[Math.min(k + 1, arc.points.length - 1)]; const f = tt - k;
        s.link[o] = p0.x + (p1.x - p0.x) * f + gauss() * 0.06; s.link[o + 1] = p0.y + (p1.y - p0.y) * f + gauss() * 0.06; s.link[o + 2] = p0.z + (p1.z - p0.z) * f + gauss() * 0.06;
      } else { s.link[o] = s.scatter[o]; s.link[o + 1] = s.scatter[o + 1]; s.link[o + 2] = s.scatter[o + 2]; }
      const si = strata.length ? i % strata.length : 0; const layer = strata[si] || { y: STRATA.topY };
      let sx; let sz;
      switch (si % 5) {
        case 0: sx = (Math.floor(rnd() * 3) - 1) * 2.4 + gauss() * 0.7; sz = (Math.floor(rnd() * 2) - 0.5) * 2 + gauss() * 0.6; break;
        case 1: sx = (Math.floor(rnd() * 14) / 13 - 0.5) * (STRATA.w - 1) + gauss() * 0.05; sz = (Math.floor(rnd() * 7) / 6 - 0.5) * (STRATA.d - 1) + gauss() * 0.05; break;
        case 2: sx = (rnd() - 0.5) * (STRATA.w - 1); sz = (Math.floor(rnd() * 8) / 7 - 0.5) * (STRATA.d - 1); break;
        case 3: { const ring = 0.7 + Math.floor(rnd() * 4) * 0.62; const ang = rnd() * Math.PI * 2; sx = Math.cos(ang) * ring * 1.5; sz = Math.sin(ang) * ring; break; }
        default: { const band = rnd() < 0.5 ? -0.55 : 0.55; sx = (rnd() - 0.5) * (STRATA.w - 1.2); sz = sx * 0.28 + band + gauss() * 0.06; }
      }
      // strata points sit in the rotated stack, so they line up with the slabs
      const c = Math.cos(STRATA_POS.rotY); const sn = Math.sin(STRATA_POS.rotY);
      s.strata[o] = STRATA_POS.x + sx * c + sz * sn; s.strata[o + 1] = layer.y + 0.04; s.strata[o + 2] = STRATA_POS.z - sx * sn + sz * c;
      if (rnd() < 0.06) { s.pattern[o] = 0; s.pattern[o + 1] = 1.2 + rnd() * 4.2; s.pattern[o + 2] = (rnd() - 0.5) * 1.6; } else {
        const x = (rnd() - 0.5) * 8.8; const supported = rnd() < 0.5; const base = 2.5 + 0.24 * x;
        const lift = supported ? Math.max(0, x) * 0.5 : 0.65 + Math.max(0, x) * 0.05;
        s.pattern[o] = x; s.pattern[o + 1] = base + lift - (supported ? 0.55 : 0) + gauss() * 0.1; s.pattern[o + 2] = (rnd() - 0.5) * 1.8;
      }
      flowCurve.getPoint(Math.pow(rnd(), 0.8), pf);
      s.flow[o] = pf.x + gauss() * 0.28; s.flow[o + 1] = pf.y + gauss() * 0.22; s.flow[o + 2] = pf.z + gauss() * 0.28;
      if (s.warm[i] === 1) {
        let x; let z;
        if (rnd() < 0.34) { x = SITE.cx + (rnd() - 0.5) * 7.4; z = SITE.cz + (rnd() - 0.5) * 6.0; } else { const st = settlements[Math.floor(rnd() * settlements.length)]; x = st.x + gauss() * 0.9; z = st.z + gauss() * 0.9; }
        s.serve[o] = x; s.serve[o + 1] = terrainHeight(x, z, 1) + 0.22 + rnd() * 0.12; s.serve[o + 2] = z;
      } else { s.serve[o] = s.scatter[o]; s.serve[o + 1] = s.scatter[o + 1]; s.serve[o + 2] = s.scatter[o + 2]; }
    }
    return s;
  }
}

/* An abstract policy document: heading, text lines, a table and a decision mark. No real words, nothing to misread. */
function drawSheet(seed) {
  const c = d.createElement('canvas'); c.width = 256; c.height = 340;
  const g = c.getContext('2d'); const rnd = mulberry32(seed);
  g.fillStyle = '#f3eee7'; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#12100f'; g.fillRect(22, 24, 96, 10);
  g.fillStyle = '#963f2e'; g.fillRect(22, 42, 52, 4);
  g.fillStyle = 'rgba(18,16,15,0.55)';
  for (let i = 0; i < 9; i++) g.fillRect(22, 68 + i * 13, Math.min(130 + rnd() * 100, 212), 4);
  g.strokeStyle = 'rgba(18,16,15,0.6)'; g.lineWidth = 1.5; g.strokeRect(22, 196, 212, 70);
  for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(22, 196 + i * 17.5); g.lineTo(234, 196 + i * 17.5); g.stroke(); }
  g.beginPath(); g.moveTo(22 + 212 / 3, 196); g.lineTo(22 + 212 / 3, 266); g.stroke();
  g.fillStyle = 'rgba(18,16,15,0.45)';
  for (let i = 0; i < 3; i++) g.fillRect(34, 204 + i * 17.5, 40 + rnd() * 20, 3);
  g.fillStyle = '#6ab43d'; g.beginPath(); g.arc(206, 306, 14, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f3eee7'; g.fillRect(199, 304, 14, 4);
  g.fillStyle = 'rgba(18,16,15,0.4)'; g.fillRect(22, 300, 84, 4); g.fillRect(22, 310, 60, 4);
  return c;
}
