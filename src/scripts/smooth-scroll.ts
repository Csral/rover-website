import Lenis from 'lenis';

let currentBody: HTMLElement | undefined;
let dispose: (() => void) | undefined;

export function initSmoothScroll() {
  if (currentBody === document.body) return;
  dispose?.();
  currentBody = document.body;
  const body = document.body;
  const controller = new AbortController();
  const { signal } = controller;
  const lenis = new Lenis({
    autoRaf: true,
    lerp: 0.1,
    syncTouch: false,
    respectReducedMotion: true,
    allowNestedScroll: true,
    stopInertiaOnNavigate: true,
  });

  // The team dialog locks the body rather than the document scroll container.
  function syncScrollLock() {
    const locked = ['hidden', 'clip'].includes(getComputedStyle(body).overflowY);
    if (locked && !lenis.isStopped) lenis.stop();
    else if (!locked && lenis.isStopped) lenis.start();
  }
  const observer = new MutationObserver(syncScrollLock);
  observer.observe(body, { attributes: true, attributeFilter: ['style', 'class'] });
  syncScrollLock();

  // Own same-page anchors so the browser and Astro don't also jump mid-tween.
  document.addEventListener(
    'click',
    (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self') || lenis.isStopped) return;
      const url = new URL(link.href);
      if (
        url.origin !== location.origin ||
        url.pathname !== location.pathname ||
        url.search !== location.search ||
        !url.hash
      )
        return;
      let target: HTMLElement | null;
      try {
        target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      } catch {
        return;
      }
      if (!target) return;
      event.preventDefault();
      const oldURL = location.href;
      const hashChanged = url.hash !== location.hash;
      if (hashChanged) history.pushState(history.state, '', url.hash);
      lenis.resize();
      lenis.scrollTo(target, {
        onComplete: () => {
          // Let deep-link handlers run after the tween, without competing jumps.
          if (hashChanged && location.hash === url.hash)
            window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL, newURL: location.href }));
          if (!target.hasAttribute('tabindex')) {
            target.setAttribute('tabindex', '-1');
            target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true, signal });
          }
          target.focus({ preventScroll: true });
        },
      });
    },
    { capture: true, signal }
  );

  dispose = () => {
    observer.disconnect();
    controller.abort();
    lenis.destroy();
    currentBody = undefined;
    dispose = undefined;
  };
  document.addEventListener('astro:before-swap', () => dispose?.(), { once: true, signal });
}
