let dispose: (() => void) | undefined;
let currentPage: HTMLElement | null = null;

export function initReveals() {
  const page = document.getElementById('page-content');
  if (page && page === currentPage) return;
  dispose?.();
  if (!page) return;
  const elements = [...page.querySelectorAll<HTMLElement>('[data-reveal]')];
  if (elements.length === 0) return;
  currentPage = page;
  const media = matchMedia('(prefers-reduced-motion: no-preference)');
  const controller = new AbortController();
  const revealed = new Set<HTMLElement>();
  let observer: IntersectionObserver | undefined;

  function reveal(element: HTMLElement, animate = true) {
    revealed.add(element);
    element.dataset.revealState = animate ? 'shown' : 'done';
    observer?.unobserve(element);
  }

  function clear() {
    observer?.disconnect();
    observer = undefined;
    elements.forEach((element) => element.removeAttribute('data-reveal-state'));
  }

  function start() {
    clear();
    if (!media.matches || !('IntersectionObserver' in window)) {
      elements.forEach((element) => revealed.add(element));
      return;
    }
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          reveal(target as HTMLElement);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -12px 0px' }
    );
    const positions = elements.map((element) => ({ element, rect: element.getBoundingClientRect() }));
    positions.forEach(({ element, rect: { top, bottom } }) => {
      if (revealed.has(element)) return;
      if (top < innerHeight && bottom > 0) {
        revealed.add(element);
        return;
      }
      element.dataset.revealState = 'pending';
      observer!.observe(element);
    });
  }

  page.addEventListener(
    'animationend',
    (event) => {
      if (event.animationName !== 'scrap-reveal' || !(event.target instanceof HTMLElement)) return;
      // Release the transform so card hover styles can take over again.
      event.target.dataset.revealState = 'done';
    },
    { signal: controller.signal }
  );
  page.addEventListener(
    'focusin',
    (event) => {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>('[data-reveal]');
      if (element?.dataset.revealState === 'pending') reveal(element, false);
    },
    { signal: controller.signal }
  );
  media.addEventListener('change', start, { signal: controller.signal });
  document.addEventListener('astro:before-swap', () => dispose?.(), { once: true, signal: controller.signal });
  dispose = () => {
    clear();
    controller.abort();
    currentPage = null;
    dispose = undefined;
  };
  start();
}
