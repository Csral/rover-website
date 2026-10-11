import { WebGLRenderer, Scene, OrthographicCamera } from 'three';
import { createGlobe } from './globe';

/** Keep the globe inside the O, so it follows the letter's layout and GSAP transforms. */
export function createHeroScene(stage: HTMLElement, animated: boolean) {
  const letter = stage.querySelector<HTMLElement>('.earth-letter')!;
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  letter.append(renderer.domElement);
  const scene = new Scene();
  const camera = new OrthographicCamera(-1.08, 1.08, 1.08, -1.08, 0.1, 10);
  camera.position.z = 4;
  const globe = createGlobe();
  scene.add(globe.group);
  let frame = 0,
    last = 0,
    time = 0;
  let visible = true,
    disposed = false,
    contextLost = false;
  function draw() {
    if (disposed || contextLost) return;
    globe.update(time, renderer.getPixelRatio());
    renderer.render(scene, camera);
  }
  function render(now: number) {
    frame = 0;
    if (disposed || !animated || !visible || document.hidden || contextLost) return;
    if (!last || now - last >= 1000 / 30) {
      if (last) time += Math.min((now - last) / 1000, 0.1);
      last = now;
      draw();
    }
    frame = requestAnimationFrame(render);
  }
  function update() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    if (!disposed && animated && visible && !document.hidden && !contextLost) frame = requestAnimationFrame(render);
  }
  const resize = new ResizeObserver(() => {
    if (disposed) return;
    renderer.setSize(letter.clientWidth, letter.clientHeight, false);
    draw();
  });
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  });
  const onContextLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    letter.classList.remove('globe-ready');
    update();
  };
  const onContextRestored = () => {
    if (disposed) return;
    contextLost = false;
    draw();
    letter.classList.add('globe-ready');
    update();
  };
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);
  renderer.setSize(letter.clientWidth, letter.clientHeight, false);
  draw();
  letter.classList.add('globe-ready');
  resize.observe(letter);
  observer.observe(stage);
  document.addEventListener('visibilitychange', update);
  update();
  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      letter.classList.remove('globe-ready');
      globe.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
