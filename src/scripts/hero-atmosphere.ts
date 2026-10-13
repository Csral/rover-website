import { Application, CanvasSource, Sprite, Texture } from 'pixi.js';

export interface HeroLighting {
  light: number;
  wake: number;
}

/** Soft, shared textures keep the lighting and dust inexpensive to animate. */
function makeTexture(beam = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = beam ? 512 : 256;
  const context = canvas.getContext('2d')!;
  if (beam) {
    for (let y = 0; y < canvas.height; y++) {
      const depth = y / canvas.height;
      // The bar is a broad source: a narrow footprint at the LED widens below it.
      const spread = 42 + depth * 86;
      const gradient = context.createLinearGradient(128 - spread, 0, 128 + spread, 0);
      const intensity = Math.pow(1 - depth, 1.15);
      gradient.addColorStop(0, '#ffffff00');
      gradient.addColorStop(0.12, `rgba(255,255,255,${intensity * 0.65})`);
      gradient.addColorStop(0.3, `rgba(255,255,255,${intensity})`);
      gradient.addColorStop(0.7, `rgba(255,255,255,${intensity})`);
      gradient.addColorStop(0.88, `rgba(255,255,255,${intensity * 0.65})`);
      gradient.addColorStop(1, '#ffffff00');
      context.fillStyle = gradient;
      context.fillRect(0, y, 256, 1);
    }
  } else {
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.25, '#ffffff90');
    gradient.addColorStop(0.6, '#ffffff28');
    gradient.addColorStop(1, '#ffffff00');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
  }
  return new Texture({ source: new CanvasSource({ resource: canvas }) });
}

/** The SVG and text remain the scene; Pixi adds air and light behind them. */
export async function createHeroAtmosphere(stage: HTMLElement, lighting: HeroLighting, signal: AbortSignal) {
  const app = new Application();
  await app.init({
    width: stage.clientWidth,
    height: stage.clientHeight,
    resolution: Math.min(devicePixelRatio, 1.5),
    autoDensity: true,
    backgroundAlpha: 0,
    antialias: false,
    preference: 'webgl',
    powerPreference: 'low-power',
    autoStart: false,
    eventFeatures: { move: false, globalMove: false, click: false, wheel: false },
  });
  if (signal.aborted) {
    app.destroy({ removeView: true, releaseGlobalResources: true }, { children: true });
    return;
  }

  const glowTexture = makeTexture();
  const beamTexture = makeTexture(true);
  function lightSprite(texture: Texture, tint: number) {
    const sprite = new Sprite({ texture, tint, anchor: 0.5, blendMode: 'add' });
    app.stage.addChild(sprite);
    return sprite;
  }
  app.stage.eventMode = 'none';
  app.stage.interactiveChildren = false;
  const coolHaze = lightSprite(glowTexture, 0x3e6e9e);
  const spill = lightSprite(beamTexture, 0xf5c785);
  spill.anchor.y = 0;
  const halo = lightSprite(glowTexture, 0xffd99c);
  const pool = lightSprite(glowTexture, 0xe8bd83);
  const wake = lightSprite(glowTexture, 0x5b8db8);
  const count = stage.clientWidth < 700 ? 24 : 48;
  const dust = Array.from({ length: count }, (_, i) => {
    const sprite = lightSprite(glowTexture, i % 4 === 0 ? 0x9bbddd : 0xffd9a3);
    sprite.width = sprite.height = 1.5 + (i % 3) * 0.8;
    return { sprite, x: Math.random(), y: Math.random(), speed: 3 + (i % 5), phase: i * 2.4 };
  });
  let width = 1,
    height = 1,
    lampX = 0,
    lampY = 0,
    lampWidth = 1;
  let visible = true,
    disposed = false,
    contextLost = false,
    elapsed = 0;

  function resize() {
    // All DOM measurements happen here, never in the ticker.
    const bounds = stage.getBoundingClientRect();
    const lamp = stage.querySelector('.delta-bot')!.getBoundingClientRect();
    width = stage.clientWidth;
    height = stage.clientHeight;
    lampWidth = lamp.width;
    lampX = lamp.left - bounds.left + lamp.width / 2;
    lampY = lamp.top - bounds.top + lamp.height * (34 / 190);
    app.renderer.resize(width, height);
    spill.position.set(lampX, lampY);
    spill.width = lampWidth * 3;
    spill.height = Math.min(height * 0.9, lampWidth * 1.9);
    halo.position.set(lampX, lampY + 12);
    halo.width = lampWidth * 1.4;
    halo.height = lampWidth * 0.25;
    pool.position.set(lampX, lampY + spill.height * 0.65);
    pool.width = lampWidth * 2.8;
    pool.height = lampWidth * 0.9;
    coolHaze.position.set(width * 0.72, height * 0.58);
    coolHaze.width = width * 0.8;
    coolHaze.height = height * 0.9;
    wake.position.set(lampX, lampY + lampWidth * 0.5);
    wake.width = lampWidth * 1.8;
    wake.height = lampWidth * 0.2;
  }

  function update() {
    if (disposed) return;
    if (visible && !document.hidden && !contextLost) app.start();
    else app.stop();
  }
  app.ticker.maxFPS = 30;
  app.ticker.add((ticker) => {
    const seconds = Math.min(ticker.deltaMS / 1000, 0.06);
    elapsed += seconds;
    const warmth = lighting.light;
    spill.alpha = warmth * 0.14;
    halo.alpha = warmth * 0.18;
    pool.alpha = warmth * 0.025;
    coolHaze.alpha = 0.028;
    wake.alpha = lighting.wake * 0.14;
    dust.forEach((particle) => {
      particle.y -= (seconds * particle.speed) / height;
      if (particle.y < 0) particle.y = 1;
      const x = particle.x * width + Math.sin(elapsed * 0.2 + particle.phase) * 14;
      const y = particle.y * height;
      particle.sprite.position.set(x, y);
      const depth = (y - lampY) / spill.height;
      const inBeam = Math.max(0, 1 - Math.abs(x - lampX) / (lampWidth * (0.5 + depth)));
      const lit = depth > 0 && depth < 1 ? inBeam * (1 - depth) * warmth : 0;
      particle.sprite.alpha = 0.025 + lit * (0.18 + 0.12 * Math.sin(elapsed + particle.phase));
    });
  });

  app.canvas.className = 'hero-atmosphere';
  app.canvas.setAttribute('aria-hidden', 'true');
  stage.prepend(app.canvas);
  resize();
  stage.classList.add('atmosphere-ready');
  const resizeObserver = new ResizeObserver(resize);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  });
  resizeObserver.observe(stage);
  resizeObserver.observe(stage.querySelector('.team-stage')!);
  visibilityObserver.observe(stage);
  document.addEventListener('visibilitychange', update);
  const onContextLost = () => {
    contextLost = true;
    stage.classList.remove('atmosphere-ready');
    update();
  };
  const onContextRestored = () => {
    contextLost = false;
    stage.classList.add('atmosphere-ready');
    update();
  };
  app.canvas.addEventListener('webglcontextlost', onContextLost);
  app.canvas.addEventListener('webglcontextrestored', onContextRestored);
  function dispose() {
    if (disposed) return;
    disposed = true;
    app.stop();
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    document.removeEventListener('visibilitychange', update);
    signal.removeEventListener('abort', dispose);
    app.canvas.removeEventListener('webglcontextlost', onContextLost);
    app.canvas.removeEventListener('webglcontextrestored', onContextRestored);
    stage.classList.remove('atmosphere-ready');
    app.destroy({ removeView: true, releaseGlobalResources: true }, { children: true });
    glowTexture.destroy(true);
    beamTexture.destroy(true);
  }
  signal.addEventListener('abort', dispose, { once: true });
  update();
  return { dispose };
}
