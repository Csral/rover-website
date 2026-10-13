import gsap from 'gsap';

let currentStamp: HTMLElement | null = null;
let dispose: (() => void) | undefined;

export function initRoverStamp() {
  const stamp = document.querySelector<HTMLElement>('.challenge-stamp');
  if (stamp && stamp === currentStamp) return;
  dispose?.();
  if (!stamp) return;
  currentStamp = stamp;
  const media = gsap.matchMedia();
  const controller = new AbortController();
  let stamped = false;

  media.add(
    { animated: '(prefers-reduced-motion: no-preference)', still: '(prefers-reduced-motion: reduce)' },
    (context) => {
      if (!context.conditions?.animated || !('IntersectionObserver' in window)) {
        stamped = true;
        return;
      }
      if (stamped) return;
      // Hide only the ink; observe its resting position, not its lifted pose.
      gsap.set(stamp, { autoAlpha: 0 });
      const observer = new IntersectionObserver(
        (entries) => {
          if (stamped || !entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.6)) return;
          stamped = true;
          observer.disconnect();
          context.add(() => {
            const press = gsap.timeline({ delay: 0.12 });
            press
              .set(stamp, { willChange: 'transform,opacity' })
              .fromTo(
                stamp,
                { autoAlpha: 0, scale: 1.75, y: -64, rotation: -24 },
                { autoAlpha: 1, duration: 0.08, ease: 'none' }
              )
              .to(stamp, { scale: 0.92, y: 3, rotation: -13, duration: 0.2, ease: 'power3.in' }, 0.02)
              .to(stamp, { scale: 1, y: 0, duration: 0.26, ease: 'back.out(1.6)' })
              .set(stamp, { clearProps: 'willChange' });

            const photo = stamp.parentElement?.querySelector<HTMLElement>('.rover-print');
            if (photo && matchMedia('(min-width: 701px)').matches) {
              press
                .to(photo, { y: 3, duration: 0.06, ease: 'power2.in' }, 0.22)
                .to(photo, { y: 0, duration: 0.2, ease: 'power2.out' }, 0.28);
            }
          });
        },
        { threshold: 0.6, rootMargin: '0px 0px -24px 0px' }
      );
      observer.observe(stamp);
      return () => observer.disconnect();
    }
  );

  dispose = () => {
    controller.abort();
    media.revert();
    currentStamp = null;
    dispose = undefined;
  };
  document.addEventListener('astro:before-swap', () => dispose?.(), { once: true, signal: controller.signal });
}
