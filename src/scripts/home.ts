import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
let cleanup: (() => void) | undefined;

export function initHome() {
  cleanup?.();
  const intro = document.querySelector<HTMLElement>('.intro');
  if (!intro) return;
  const stage = intro.querySelector<HTMLElement>('.intro-stage')!;
  const toggle = stage.querySelector<HTMLButtonElement>('.motion-toggle')!;
  const media = gsap.matchMedia();
  const animations: gsap.core.Animation[] = [];
  let disposeSmoke: (() => void) | undefined;
  let setSmokePaused: ((paused: boolean) => void) | undefined;
  let disposed = false;
  let paused = false;

  const applyPause = () => {
    for (const animation of animations) {
      if (paused) animation.progress(1);
      animation.paused(paused);
    }
    setSmokePaused?.(paused);
    toggle.textContent = paused ? 'Resume atmosphere' : 'Pause atmosphere';
    toggle.setAttribute('aria-pressed', String(paused));
  };
  const onToggle = () => {
    paused = !paused;
    applyPause();
  };
  toggle.addEventListener('click', onToggle);

  media.add('(prefers-reduced-motion: no-preference)', () => {
    let active = true;
    stage.classList.add('intro-ready');
    gsap.set('.full-name', { autoAlpha: 0 });
    gsap.set('.full-name > span', { z: -100, rotationY: -5 });
    // Begin with two staggered initials, retract them, then reveal the complete name.
    const retract = gsap.to('.initial', {
      z: -160,
      scale: 0.88,
      rotationY: -8,
      duration: 0.8,
      delay: 0.65,
      stagger: 0.13,
      ease: 'power2.inOut',
    });
    const introTimeline = gsap
      .timeline({ delay: 1.3 })
      .to('.initials', { autoAlpha: 0, duration: 0.4 })
      .set('.full-name', { autoAlpha: 1 }, '<+.1')
      .fromTo(
        '.full-name > span',
        { opacity: 0, z: -100, rotationY: -5 },
        {
          opacity: 1,
          z: (index) => (index === 0 ? -20 : 25),
          rotationY: 0,
          duration: 1.1,
          stagger: 0.13,
          ease: 'power3.out',
        },
        '<'
      )
      .fromTo('.hero-bottom', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.65 }, '-=.5');
    const lightBreath = gsap.to('.light-halo', {
      opacity: 0.58,
      scale: 0.92,
      duration: 3.7,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    animations.push(retract, introTimeline, lightBreath);

    // The distant light disperses into the dark pages as the scrapbook opens.
    const scrollTimeline = gsap
      .timeline({
        scrollTrigger: {
          trigger: intro,
          start: 'top top',
          end: () => `+=${Math.round(innerHeight * 0.7)}`,
          pin: stage,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
      .to('.hero-content', { opacity: 0, y: -35, duration: 0.65, ease: 'none' }, 0)
      .to('.light-beam', { scale: 1.8, opacity: 0.6, duration: 0.6, transformOrigin: 'right center', ease: 'none' }, 0)
      .to('.light-wash', { opacity: 1, duration: 0.7, ease: 'none' }, 0.22)
      .to(['.light-source', '.smoke-canvas', '.motion-toggle'], { opacity: 0, duration: 0.3, ease: 'none' }, 0.5);

    const headerTween = gsap.to('.home-header', {
      opacity: 0,
      scrollTrigger: { trigger: intro, start: 'top top', end: '+=180', scrub: true },
      ease: 'none',
    });
    const container = stage.querySelector<HTMLElement>('.smoke-canvas')!;
    void import('./smoke')
      .then(({ createSmoke }) => {
        if (!active || disposed) return;
        const smoke = createSmoke(container);
        disposeSmoke = smoke?.dispose;
        setSmokePaused = smoke?.setPaused;
        setSmokePaused?.(paused);
      })
      .catch(() => {
        /* The static red haze remains when WebGL is unavailable. */
      });
    applyPause();
    return () => {
      active = false;
      disposeSmoke?.();
      disposeSmoke = undefined;
      setSmokePaused = undefined;
      animations.splice(0).forEach((animation) => animation.kill());
      scrollTimeline.kill();
      headerTween.kill();
      stage.classList.remove('intro-ready');
    };
  });

  void document.fonts.ready.then(() => {
    if (!disposed) ScrollTrigger.refresh();
  });
  cleanup = () => {
    disposed = true;
    media.revert();
    toggle.removeEventListener('click', onToggle);
    cleanup = undefined;
  };
  document.addEventListener('astro:before-swap', cleanup, { once: true });
}
