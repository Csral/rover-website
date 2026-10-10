import { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, ShaderMaterial, Mesh } from 'three';

/** Low-resolution Martian dust, lit by a distant source on the right. */
export function createSmoke(container: HTMLElement) {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
  } catch {
    return undefined;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
  container.append(renderer.domElement);
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uAspect: { value: 1 } },
    vertexShader: `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uAspect;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(hash(i), hash(i+vec2(1.,0.)),u.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);
      }
      float fbm(vec2 p) { float v=0., a=.5; for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.02+3.1;a*=.5;}return v; }
      void main() {
        vec2 p = vUv*vec2(4.5,3.0); p.y -= uTime*.035;
        float n = fbm(p + vec2(fbm(p+uTime*.012),fbm(p-2.3)));
        float plume = exp(-pow((vUv.x - .35 - sin(vUv.y*5.0+uTime*.08)*.09)*3.7,2.0));
        float fade = (1.0-smoothstep(.18,.95,vUv.y))*smoothstep(0.,.12,vUv.y);
        vec2 toLight = (vUv - vec2(.92,.57))*vec2(uAspect,1.0);
        float distanceToLight = length(toLight);
        float scattering = exp(-distanceToLight*2.4);
        float dust = smoothstep(.28,.72,n);
        float alpha = dust*(plume*fade*.23 + scattering*.13);
        vec3 rust = vec3(.54,.19,.12);
        vec3 litDust = mix(rust,vec3(.85,.65,.43),scattering*.8);
        gl_FragColor = vec4(litDust,alpha);
      }`,
  });
  scene.add(new Mesh(geometry, material));
  let frame = 0;
  let visible = true;
  let paused = false;
  let disposed = false;
  let last = 0;
  const render = (now: number) => {
    frame = 0;
    if (disposed || paused || !visible || document.hidden) return;
    if (last) material.uniforms.uTime.value += Math.min((now - last) / 1000, 0.1);
    last = now;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  };
  const update = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    if (!disposed && !paused && visible && !document.hidden) frame = requestAnimationFrame(render);
  };
  const resize = new ResizeObserver(() => {
    // Half-size drawing buffer keeps this subtle atmospheric layer inexpensive.
    renderer.setSize(Math.max(1, container.clientWidth / 2), Math.max(1, container.clientHeight / 2), false);
    material.uniforms.uAspect.value = container.clientWidth / Math.max(1, container.clientHeight);
    if (paused || !visible || document.hidden) renderer.render(scene, camera);
  });
  resize.observe(container);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  });
  observer.observe(container);
  document.addEventListener('visibilitychange', update);
  update();
  return {
    setPaused(value: boolean) {
      paused = value;
      update();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
