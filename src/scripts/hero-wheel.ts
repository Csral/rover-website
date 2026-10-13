import {
  ACESFilmicToneMapping,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import type { Object3D } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function disposeModel(root: Object3D) {
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material.dispose());
  });
}

/** Render once; GSAP rolls the containing letter without a second GPU loop. */
export async function createHeroWheel(stage: HTMLElement, signal: AbortSignal) {
  const host = stage.querySelector<HTMLElement>('.wheel-model');
  if (!host || signal.aborted) return;
  const response = await fetch('/models/odyssey-wheel.glb', { signal });
  if (!response.ok) return;
  const buffer = await response.arrayBuffer();
  if (signal.aborted) return;
  const { scene: model } = await new GLTFLoader().parseAsync(buffer, '');
  if (signal.aborted) {
    disposeModel(model);
    return;
  }
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (error) {
    disposeModel(model);
    throw error;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.append(renderer.domElement);
  const scene = new Scene();
  model.rotation.set(-0.08, -0.18, 0);
  scene.add(model, new HemisphereLight(0xffedce, 0x242b3a, 2));
  const light = new DirectionalLight(0xffe6b7, 3);
  light.position.set(-3, 5, 6);
  scene.add(light);
  const rim = new DirectionalLight(0x9ab4d4, 1.2);
  rim.position.set(4, 1, -3);
  scene.add(rim);
  const camera = new OrthographicCamera(-1.22, 1.22, 1.22, -1.22, 0.1, 10);
  camera.position.z = 4;
  let disposed = false;
  let contextLost = false;

  function draw() {
    if (disposed || contextLost || signal.aborted) return;
    renderer.setSize(host!.clientWidth, host!.clientHeight, false);
    renderer.render(scene, camera);
    host!.classList.add('wheel-ready');
  }
  const resize = new ResizeObserver(draw);
  resize.observe(host);
  function onContextLost(event: Event) {
    event.preventDefault();
    contextLost = true;
    host!.classList.remove('wheel-ready');
  }
  function onContextRestored() {
    contextLost = false;
    draw();
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    resize.disconnect();
    signal.removeEventListener('abort', dispose);
    renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
    renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
    host!.classList.remove('wheel-ready');
    disposeModel(model);
    renderer.dispose();
    renderer.domElement.remove();
  }
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);
  signal.addEventListener('abort', dispose, { once: true });
  draw();
  return { dispose };
}
