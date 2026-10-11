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
  const media = matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)');
  const controller = new AbortController();
  let observer: IntersectionObserver | undefined;

  function clear() {
    observer?.disconnect();
    observer = undefined;
    elements.forEach((element) => element.removeAttribute('data-reveal-state'));
  }

  function start() {
    clear();
    if (!media.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          (target as HTMLElement).dataset.revealState = 'shown';
          observer?.unobserve(target);
        });
      },
      { threshold: 0.15 }
    );
    elements.forEach((element) => {
      const { top, bottom } = element.getBoundingClientRect();
      if (top < innerHeight && bottom > 0) return;
      element.dataset.revealState = 'pending';
      observer!.observe(element);
    });
  }

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
