/* Three.js DNA helix hero scene */
(function () {
  'use strict';

  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  /* ── Renderer ───────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  /* ── Scene / Camera ─────────────────────────────────── */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 18);

  /* ── DNA Helix ──────────────────────────────────────── */
  const dnaGroup = new THREE.Group();
  scene.add(dnaGroup);

  const N = 400;          // particles per strand
  const ROTATIONS = 7;    // number of full turns
  const RADIUS = 3.5;
  const HEIGHT = 24;

  const s1Pos = new Float32Array(N * 3);
  const s2Pos = new Float32Array(N * 3);

  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2 * ROTATIONS;
    const y = (i / N - 0.5) * HEIGHT;

    s1Pos[i * 3]     = Math.cos(t) * RADIUS;
    s1Pos[i * 3 + 1] = y;
    s1Pos[i * 3 + 2] = Math.sin(t) * RADIUS;

    s2Pos[i * 3]     = Math.cos(t + Math.PI) * RADIUS;
    s2Pos[i * 3 + 1] = y;
    s2Pos[i * 3 + 2] = Math.sin(t + Math.PI) * RADIUS;
  }

  function makeStrand(positions, color) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.09,
      color,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.Points(geo, mat);
  }

  const strand1 = makeStrand(s1Pos, 0xFF4500);  // orange
  const strand2 = makeStrand(s2Pos, 0xFFB627);  // gold
  dnaGroup.add(strand1);
  dnaGroup.add(strand2);

  /* ── Connector rungs ────────────────────────────────── */
  const RUNG_STEP = 8;
  const rungVerts = [];
  for (let i = 0; i < N; i += RUNG_STEP) {
    const t = (i / N) * Math.PI * 2 * ROTATIONS;
    const y = (i / N - 0.5) * HEIGHT;
    rungVerts.push(
      Math.cos(t) * RADIUS, y, Math.sin(t) * RADIUS,
      Math.cos(t + Math.PI) * RADIUS, y, Math.sin(t + Math.PI) * RADIUS,
    );
  }
  const rungGeo = new THREE.BufferGeometry();
  rungGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(rungVerts), 3));
  const rungMat = new THREE.LineBasicMaterial({
    color: 0xFF6B35,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
  });
  dnaGroup.add(new THREE.LineSegments(rungGeo, rungMat));

  /* ── Ambient floating particles ─────────────────────── */
  const AMB = 1200;
  const ambPos = new Float32Array(AMB * 3);
  for (let i = 0; i < AMB; i++) {
    ambPos[i * 3]     = (Math.random() - 0.5) * 60;
    ambPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
    ambPos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
  }
  const ambGeo = new THREE.BufferGeometry();
  ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
  const ambMat = new THREE.PointsMaterial({
    size: 0.04,
    color: 0xFFB627,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ambParticles = new THREE.Points(ambGeo, ambMat);
  scene.add(ambParticles);

  /* ── Mouse interaction ──────────────────────────────── */
  let mx = 0, my = 0;
  document.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ── Scroll: move helix away as user scrolls ────────── */
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  /* ── Resize ─────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ── Expose theme color update API ──────────────────── */
  window.updateSceneColors = function (colors) {
    if (!colors) return;
    strand1.material.color.setHex(colors.primary);
    strand2.material.color.setHex(colors.secondary);
    rungMat.color.setHex(colors.primary);
    ambMat.color.setHex(colors.secondary);
  };

  /* ── Animation loop ─────────────────────────────────── */
  let time = 0;
  function tick() {
    requestAnimationFrame(tick);
    time += 0.008;

    // Spin the double helix
    dnaGroup.rotation.y += 0.004;

    // Subtle mouse tilt
    dnaGroup.rotation.x += (my * 0.25 - dnaGroup.rotation.x) * 0.05;
    dnaGroup.rotation.z += (-mx * 0.1  - dnaGroup.rotation.z) * 0.05;

    // Breathe: slight scale pulse
    const breathe = 1 + Math.sin(time) * 0.015;
    dnaGroup.scale.set(breathe, 1, breathe);

    // Drift camera slightly on scroll (parallax)
    camera.position.y = -scrollY * 0.004;

    // Rotate ambient cloud
    ambParticles.rotation.y += 0.0008;
    ambParticles.rotation.x += 0.0003;

    renderer.render(scene, camera);
  }
  tick();
}());
