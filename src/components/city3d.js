/**
 * 3D Antigravity City Canvas Component
 * Preserves and encapsulates the Three.js 3D city visualization created by teammates.
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let activeAnimationId = null;

export function initCity3D(canvas) {
  if (!canvas) return;

  // Cancel any previous loop
  if (activeAnimationId) {
    cancelAnimationFrame(activeAnimationId);
    activeAnimationId = null;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 1.2, 7);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0, 0);

  const group = new THREE.Group();
  scene.add(group);
  scene.add(new THREE.AmbientLight(0x9de3c4, 1.7));

  const keyLight = new THREE.PointLight(0x6ee0b1, 12, 15);
  keyLight.position.set(3, 4, 4);
  scene.add(keyLight);

  const material = new THREE.MeshStandardMaterial({ color: 0x16d9ff, roughness: 0.25, metalness: 0.35 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x075078, roughness: 0.45, metalness: 0.3 });

  for (let i = 0; i < 16; i++) {
    const h = 0.35 + Math.random() * 1.35;
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(0.35 + Math.random() * 0.35, h, 0.35 + Math.random() * 0.35),
      i % 3 === 0 ? material : dark
    );
    building.position.set((Math.random() - 0.5) * 4.5, h / 2 - 0.5, (Math.random() - 0.5) * 1.8);
    group.add(building);
  }

  const globe = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.22, 2),
    new THREE.MeshBasicMaterial({ color: 0x16d9ff, wireframe: true, transparent: true, opacity: 0.6 })
  );
  globe.position.set(0.35, 0.25, 0.2);
  group.add(globe);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.012, 8, 80),
    new THREE.MeshBasicMaterial({ color: 0xff3da8, transparent: true, opacity: 0.8 })
  );
  ring.rotation.x = 0.75;
  ring.position.set(0.35, 0.25, 0.2);
  group.add(ring);

  const particles = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0x8beeff, size: 0.035 })
  );
  const positions = [];
  for (let i = 0; i < 180; i++) {
    positions.push((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3);
  }
  particles.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  scene.add(particles);

  let targetX = 0;
  let targetY = 0;

  const onPointerMove = (e) => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    targetX = ((e.clientX - r.left) / r.width - 0.5) * 0.35;
    targetY = ((e.clientY - r.top) / r.height - 0.5) * 0.2;
  };
  canvas.addEventListener('pointermove', onPointerMove);

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }

  function animate(time) {
    group.rotation.y += (targetX - group.rotation.y) * 0.03 + 0.0015;
    group.rotation.x += (targetY - group.rotation.x) * 0.03;
    globe.rotation.y -= 0.004;
    ring.rotation.z += 0.006;
    particles.rotation.y += 0.0005;
    group.position.y = Math.sin(time * 0.0012) * 0.08;
    renderer.render(scene, camera);
    activeAnimationId = requestAnimationFrame(animate);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  animate(0);

  return () => {
    if (activeAnimationId) cancelAnimationFrame(activeAnimationId);
    observer.disconnect();
    canvas.removeEventListener('pointermove', onPointerMove);
  };
}
