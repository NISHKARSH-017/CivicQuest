import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.querySelector("#city3d");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
camera.position.set(0, 1.2, 7);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0, 0);
const group = new THREE.Group();
scene.add(group);
scene.add(new THREE.AmbientLight(0x9de3c4, 1.7));
const key = new THREE.PointLight(0x6ee0b1, 12, 15);
key.position.set(3, 4, 4);
scene.add(key);
const material = new THREE.MeshStandardMaterial({ color: 0x16d9ff, roughness: .25, metalness: .35 });
const dark = new THREE.MeshStandardMaterial({ color: 0x075078, roughness: .45, metalness: .3 });
for (let i = 0; i < 16; i++) {
  const h = .35 + Math.random() * 1.35;
  const building = new THREE.Mesh(new THREE.BoxGeometry(.35 + Math.random() * .35, h, .35 + Math.random() * .35), i % 3 === 0 ? material : dark);
  building.position.set((Math.random() - .5) * 4.5, h / 2 - .5, (Math.random() - .5) * 1.8);
  group.add(building);
}
const globe = new THREE.Mesh(new THREE.IcosahedronGeometry(1.22, 2), new THREE.MeshBasicMaterial({ color: 0x16d9ff, wireframe: true, transparent: true, opacity: .6 }));
globe.position.set(.35, .25, .2);
group.add(globe);
const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, .012, 8, 80), new THREE.MeshBasicMaterial({ color: 0xff3da8, transparent: true, opacity: .8 }));
ring.rotation.x = .75;
ring.position.set(.35, .25, .2);
group.add(ring);
const particles = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0x8beeff, size: .035 }));
const positions = [];
for (let i = 0; i < 180; i++) positions.push((Math.random() - .5) * 7, (Math.random() - .5) * 4, (Math.random() - .5) * 3);
particles.geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
scene.add(particles);
let targetX = 0, targetY = 0;
canvas.addEventListener("pointermove", (e) => { const r = canvas.getBoundingClientRect(); targetX = ((e.clientX - r.left) / r.width - .5) * .35; targetY = ((e.clientY - r.top) / r.height - .5) * .2; });
function resize() { const r = canvas.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); }
function animate(time) { group.rotation.y += (targetX - group.rotation.y) * .03 + .0015; group.rotation.x += (targetY - group.rotation.x) * .03; globe.rotation.y -= .004; ring.rotation.z += .006; particles.rotation.y += .0005; group.position.y = Math.sin(time * .0012) * .08; renderer.render(scene, camera); requestAnimationFrame(animate); }
new ResizeObserver(resize).observe(canvas); resize(); animate(0);
document.querySelector("#launch").addEventListener("click", () => { canvas.scrollIntoView({ behavior: "smooth", block: "center" }); canvas.animate([{ filter: "brightness(1)" }, { filter: "brightness(1.8)" }, { filter: "brightness(1)" }], { duration: 700 }); });

const modal = document.querySelector("#modal");
document.querySelectorAll(".panel").forEach((panel) => {
  panel.addEventListener("pointermove", (event) => {
    const box = panel.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width - .5) * 5;
    const y = ((event.clientY - box.top) / box.height - .5) * -5;
    panel.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateZ(4px)`;
  });
  panel.addEventListener("pointerleave", () => { panel.style.transform = ""; });
});
document.querySelector("#report").addEventListener("click", () => modal.classList.add("open"));
document.querySelector(".close").addEventListener("click", () => modal.classList.remove("open"));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.classList.remove("open"); if (e.key.toLowerCase() === "r" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) modal.classList.add("open"); });
modal.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); document.querySelector("#points").textContent = "2,890"; document.querySelector("#balance").innerHTML = "1,290 <small>pts</small>"; document.querySelector(".success").classList.add("show"); const toast = document.querySelector("#toast"); toast.classList.add("show"); setTimeout(() => { toast.classList.remove("show"); modal.classList.remove("open"); e.target.reset(); document.querySelector(".success").classList.remove("show"); }, 1800); });
