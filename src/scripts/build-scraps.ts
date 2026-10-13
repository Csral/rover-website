import gsap from 'gsap';

let currentRow: HTMLElement | null = null;
let dispose: (() => void) | undefined;

export function initBuildScraps() {
  const row = document.querySelector<HTMLElement>('.build-scraps');
  if (row && row === currentRow) return;
  dispose?.();
  if (!row) return;
  const note = row.querySelector<HTMLElement>('.lined-note');
  const cards = [...row.querySelectorAll<HTMLElement>('.small-print')];
  if (!note || cards.length === 0) return;
  currentRow = row;
  const rotations = cards.map((card) => Number(gsap.getProperty(card, 'rotation')));
  const controller = new AbortController();
  const media = gsap.matchMedia();
  let opened = false;

  media.add(
    {
      desktop: '(min-width: 701px)',
      mobile: '(max-width: 700px)',
      animated: '(prefers-reduced-motion: no-preference)',
      still: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      if (!context.conditions?.animated || !('IntersectionObserver' in window)) {
        opened = true;
        return;
      }
      if (opened) return;

      function stack() {
        const positions = cards.map((card) => ({
          x: note!.offsetLeft + note!.offsetWidth / 2 - card.offsetLeft - card.offsetWidth / 2,
          y: note!.offsetTop + note!.offsetHeight / 2 - card.offsetTop - card.offsetHeight / 2,
          scale: Math.min(
            0.82,
            (note!.offsetWidth / card.offsetWidth) * 0.86,
            (note!.offsetHeight / card.offsetHeight) * 0.86
          ),
        }));
        cards.forEach((card, index) => gsap.set(card, { ...positions[index], rotation: 2 }));
      }
      stack();
      const resize = new ResizeObserver(() => {
        if (!opened) context.add(stack);
      });
      resize.observe(row);
      const observer = new IntersectionObserver(
        (entries) => {
          if (opened || !entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.25)) return;
          opened = true;
          observer.disconnect();
          resize.disconnect();
          context.add(() => {
            gsap.set(cards, { willChange: 'transform' });
            gsap.to(cards, {
              x: 0,
              y: 0,
              scale: 1,
              rotation: (index) => rotations[index],
              duration: 0.85,
              stagger: 0.08,
              ease: 'power3.out',
              clearProps: 'transform,willChange',
            });
          });
        },
        { threshold: 0.25, rootMargin: '0px 0px -40px 0px' }
      );
      observer.observe(note);
      return () => {
        observer.disconnect();
        resize.disconnect();
      };
    }
  );

  dispose = () => {
    controller.abort();
    media.revert();
    currentRow = null;
    dispose = undefined;
  };
  document.addEventListener('astro:before-swap', () => dispose?.(), { once: true, signal: controller.signal });
}
