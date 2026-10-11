import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import type { createHeroScene } from './hero-scene';

gsap.registerPlugin(DrawSVGPlugin, MorphSVGPlugin);
type HeroScene = NonNullable<ReturnType<typeof createHeroScene>>;
let cleanup: (() => void) | undefined;
let currentStage: HTMLElement | null = null;

export function initHome() {
  const stage = document.querySelector<HTMLElement>('.intro-stage');
  if (stage && stage === currentStage) return;
  cleanup?.();
  if (!stage) return;
  currentStage = stage;
  const note = stage.querySelector<HTMLElement>('.typed-note')!;
  const media = gsap.matchMedia();
  let scene: HeroScene | undefined;
  let sequence: gsap.core.Timeline | undefined;
  let disposed = false;

  media.add(
    { animated: '(prefers-reduced-motion: no-preference)', still: '(prefers-reduced-motion: reduce)' },
    (context) => {
      const animated = Boolean(context.conditions?.animated);
      let active = true;
      let resize: ResizeObserver | undefined;
      if (animated) stage.classList.add('kinetic-loading');

      function choreograph() {
        if (!active || disposed) return;
        stage!.classList.remove('kinetic-loading');
        note.textContent = "that's us";
        const q = <T extends Element = HTMLElement>(selector: string) => stage!.querySelector<T>(selector)!;
        const team = q('.team-word');
        const letters = [...stage!.querySelectorAll<HTMLElement>('.hero-letter')];
        const e = q<HTMLElement>('.letter-e'),
          a = q<HTMLElement>('.letter-a');
        const s1 = q<HTMLElement>('.letter-s-first'),
          s2 = q<HTMLElement>('.letter-s-second');
        const orbit = { angle: 0 };
        const typing = { count: 0 };
        const firstNote = "Yes, that's us";
        const finalNote = "that's us";
        let orbitX = (e.offsetLeft + e.offsetWidth / 2 + a.offsetLeft + a.offsetWidth / 2) / 2;
        let eRadius = orbitX - e.offsetLeft - e.offsetWidth / 2;
        let aRadius = a.offsetLeft + a.offsetWidth / 2 - orbitX;
        const setEX = gsap.quickSetter(e, 'x', 'px'),
          setEY = gsap.quickSetter(e, 'y', 'px');
        const setAX = gsap.quickSetter(a, 'x', 'px'),
          setAY = gsap.quickSetter(a, 'y', 'px');
        const inkPaths = [...stage!.querySelectorAll<SVGPathElement>('.pen-note path')];
        const arrowPaths = stage!.querySelectorAll('.rotating-arrow path, .return-arrow path');
        let fallenX = 0;
        let fallenY = 0;

        function settleArrow() {
          gsap.set(q('.rotating-arrow'), { rotation: -90, x: fallenX, y: fallenY });
        }

        function placeNotes() {
          const rect = stage!.getBoundingClientRect();
          const word = q('.odyssey-word').getBoundingClientRect();
          const mobile = stage!.clientWidth <= 700;
          const factor = mobile ? 155 / 240 : 1;
          const annotation = q<HTMLElement>('.hero-annotation');
          const sticky = q<HTMLElement>('.hero-sticky');
          const targetX = mobile ? word.left + word.width * 0.4 : word.right + 40;
          const targetY = mobile ? word.bottom + 28 : word.top + 10;
          const desiredLeft = targetX - rect.left - 38 * factor;
          const noteOffset = mobile ? 160 : 248;
          const noteWidth = mobile ? 145 : 210;
          const left = Math.min(desiredLeft, stage!.clientWidth - noteOffset - noteWidth - (mobile ? 25 : 45));
          const top = targetY - rect.top - 25 * factor;
          annotation.style.left = left + 'px';
          annotation.style.top = top + 'px';
          annotation.style.right = 'auto';
          annotation.style.bottom = 'auto';
          const stickyLeft = left + 210 * factor + (mobile ? 28 : 40);
          const stickyTop = top + 130 * factor + (mobile ? 18 : 28) + (mobile ? 34 : 38);
          sticky.style.left = stickyLeft + 'px';
          sticky.style.top = stickyTop + 'px';
          sticky.style.right = 'auto';
          sticky.style.bottom = 'auto';
          // Land the tail on the sticky's left edge, beside the actual scroll instruction.
          fallenX = stickyLeft - left - 210 * factor;
          fallenY = stickyTop + sticky.offsetHeight * 0.52 - top - 130 * factor;
        }
        placeNotes();
        resize = new ResizeObserver(() => {
          placeNotes();
          orbitX = (e.offsetLeft + e.offsetWidth / 2 + a.offsetLeft + a.offsetWidth / 2) / 2;
          eRadius = orbitX - e.offsetLeft - e.offsetWidth / 2;
          aRadius = a.offsetLeft + a.offsetWidth / 2 - orbitX;
          if (!animated || (sequence && sequence.time() >= sequence.labels.annotations + 2.8)) settleArrow();
        });
        resize.observe(stage!);
        if (!animated) {
          settleArrow();
          gsap.set(q('.arrow-line'), { attr: { d: 'M210 130C179 142 142 117 109 68' } });
          gsap.set(q('.arrow-head'), { attr: { d: 'M127 71 109 68 111 85' } });
          return;
        }

        sequence = gsap.timeline({ defaults: { ease: 'power3.out' } });
        // Reserve every letter's space so the word does not jump as it assembles.
        sequence
          .set(letters, { clearProps: 'transform,color,visibility,opacity' })
          .set([e, a, q('.letter-m'), ...letters.slice(4)], { autoAlpha: 0 })
          .set([q('.hero-sticky'), note], { autoAlpha: 0 })
          .set(note, { textContent: '' })
          .set(typing, { count: 0 })
          .set(orbit, { angle: 0 })
          .set(q('.rotating-arrow'), { rotation: 0, x: 0, y: 0 })
          .set(q('.rotating-arrow .arrow-line'), { attr: { d: 'M210 130C166 132 91 80 38 25' } })
          .set(q('.rotating-arrow .arrow-head'), { attr: { d: 'M55 28 38 25 41 43' } })
          .set(arrowPaths, { drawSVG: '0% 0%' })
          .set(inkPaths, { drawSVG: '0% 0%', fillOpacity: 0 })
          .set(q('.y-drawing'), { opacity: 1 })
          .set(q('.y-fill'), { opacity: 0 })
          .set(q('.y-reel'), { yPercent: 0 })
          .set(q('.hero-sticky .tape'), { scaleX: 0 })
          .set(team, { x: () => e.offsetWidth + a.offsetWidth })
          .to(team, { x: 0, duration: 1.2, ease: 'power2.inOut' }, 0.25)
          .fromTo(
            [e, a, q('.letter-m')],
            { x: -35, scaleX: 0.5 },
            { autoAlpha: 1, x: 0, scaleX: 1, duration: 0.6, stagger: 0.14 },
            0.4
          )
          .to(
            orbit,
            {
              angle: Math.PI * 4,
              duration: 2.2,
              ease: 'power2.inOut',
              onUpdate: () => {
                const { angle } = orbit;
                setEX(eRadius * (1 - Math.cos(angle)));
                setEY(-eRadius * Math.sin(angle));
                setAX(aRadius * (Math.cos(angle) - 1));
                setAY(aRadius * Math.sin(angle));
              },
            },
            1.15
          )
          .fromTo(
            q('.earth-letter'),
            { scale: 0.6, rotation: -30 },
            { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.9, ease: 'back.out(1.3)' },
            1.15
          )
          .fromTo(q('.letter-d'), { y: 35, rotation: 8 }, { autoAlpha: 1, y: 0, rotation: 0, duration: 0.6 }, 1.45)
          .set(q('.letter-y-first'), { autoAlpha: 1 }, 1.65)
          .fromTo(q('.y-arm'), { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 0.35 }, 1.65)
          .fromTo(q('.y-stem'), { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 0.55 }, 1.9)
          .to(q('.y-fill'), { opacity: 1, duration: 0.16 }, 2.4)
          .to(q('.y-drawing'), { opacity: 0, duration: 0.16 }, 2.4)
          .fromTo(s1, { y: -25, rotation: -15 }, { autoAlpha: 1, y: 0, rotation: 0, duration: 0.55 }, 1.95)
          .fromTo(q('.letter-e-last'), { scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.55 }, 2.15)
          .set(q('.letter-y-last'), { autoAlpha: 1 }, 2.3)
          .to(q('.y-reel'), { yPercent: -200 / 3, duration: 1.25, ease: 'power2.inOut' }, 2.3)
          // The second s originates on top of the first, then separates into its own slot.
          .to(s1, { scaleX: 0.7, rotation: -8, duration: 0.22 }, 3.55)
          .fromTo(
            s2,
            { x: () => s1.offsetLeft - s2.offsetLeft, scaleX: 0.7 },
            { autoAlpha: 1, x: 0, scaleX: 1, duration: 0.7, ease: 'back.out(1.4)' },
            3.6
          )
          .to(s1, { scaleX: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.4)' }, 3.77);

        // Start the notes as soon as the last letter settles.
        sequence.addLabel('annotations');
        sequence
          .to(q('.rotating-arrow .arrow-line'), { drawSVG: '0% 100% live', duration: 0.65 }, 'annotations')
          .to(q('.rotating-arrow .arrow-head'), { drawSVG: '0% 100% live', duration: 0.25 }, 'annotations+=0.52')
          .set(note, { autoAlpha: 1 }, 'annotations+=0.1')
          .to(
            typing,
            {
              count: firstNote.length,
              duration: 0.9,
              ease: 'none',
              onUpdate: () => {
                note.textContent = firstNote.slice(0, Math.round(typing.count));
              },
            },
            'annotations+=0.1'
          )
          // The stroke buckles first, then gravity pulls its tail and swings its tip down.
          .to(
            q('.rotating-arrow .arrow-line'),
            {
              morphSVG: 'M210 130C186 156 139 146 128 95S76 34 50 40',
              duration: 0.24,
              ease: 'power1.inOut',
            },
            'annotations+=1.65'
          )
          .to(
            q('.rotating-arrow .arrow-head'),
            {
              morphSVG: 'M66 38 50 40 48 57',
              duration: 0.24,
              ease: 'power1.inOut',
            },
            'annotations+=1.65'
          )
          .to(q('.rotating-arrow'), { rotation: 8, y: 7, duration: 0.24, ease: 'power1.in' }, 'annotations+=1.65')
          .to(
            q('.rotating-arrow'),
            {
              rotation: -104,
              x: () => fallenX + 4,
              y: () => fallenY + 8,
              duration: 0.66,
              ease: 'power2.in',
            },
            'annotations+=1.89'
          )
          .to(
            q('.rotating-arrow .arrow-line'),
            {
              morphSVG: 'M210 130C179 142 142 117 109 68',
              duration: 0.58,
              ease: 'power2.inOut',
            },
            'annotations+=1.89'
          )
          .to(
            q('.rotating-arrow .arrow-head'),
            {
              morphSVG: 'M127 71 109 68 111 85',
              duration: 0.58,
              ease: 'power2.inOut',
            },
            'annotations+=1.89'
          )
          .to(
            q('.rotating-arrow'),
            {
              rotation: -90,
              x: () => fallenX,
              y: () => fallenY,
              duration: 0.24,
              ease: 'power2.out',
            },
            'annotations+=2.55'
          )
          .to(q('.hero-sticky'), { autoAlpha: 1, duration: 0.2 }, 'annotations+=2.82')
          .set(q('.hero-sticky .tape'), { scaleX: 1 }, 'annotations+=2.82')
          .set(typing, { count: 0 }, 'annotations+=3.1')
          .to(
            typing,
            {
              count: finalNote.length,
              duration: 0.55,
              ease: 'none',
              onUpdate: () => {
                note.textContent = finalNote.slice(0, Math.round(typing.count));
              },
            },
            'annotations+=3.1'
          )
          .to(
            q('.return-arrow .return-line'),
            { drawSVG: '0% 100% live', duration: 0.85, ease: 'none' },
            'annotations+=3.1'
          )
          .to(
            q('.return-arrow .return-head'),
            { drawSVG: '0% 100% live', duration: 0.25, ease: 'none' },
            'annotations+=3.9'
          )
          .set(arrowPaths, { clearProps: 'strokeDasharray,strokeDashoffset' }, 'annotations+=4.15');
        inkPaths.forEach((path, index) => {
          const at = sequence!.labels.annotations + 3.1 + index * 0.055;
          sequence!
            .to(path, { drawSVG: '0% 100%', duration: 0.2, ease: 'none' }, at)
            .to(path, { fillOpacity: 1, duration: 0.1 }, at + 0.1);
        });
      }

      void document.fonts.ready.then(() => {
        if (active && !disposed) context.add(choreograph);
      });
      if (animated)
        void import('./hero-scene')
          .then(({ createHeroScene }) => {
            if (!active || disposed) return;
            try {
              scene = createHeroScene(stage!, animated);
            } catch {
              /* The inline geographic globe remains visible. */
            }
          })
          .catch(() => {
            /* The geographic SVG remains visible when WebGL is unavailable. */
          });

      return () => {
        active = false;
        resize?.disconnect();
        sequence?.kill();
        sequence = undefined;
        scene?.dispose();
        scene = undefined;
        stage.classList.remove('kinetic-loading');
        stage.querySelectorAll<HTMLElement>('.hero-annotation, .hero-sticky').forEach((element) => {
          ['left', 'top', 'right', 'bottom'].forEach((property) => element.style.removeProperty(property));
        });
        note.textContent = "that's us";
      };
    },
    stage
  );
  cleanup = () => {
    disposed = true;
    media.revert();
    currentStage = null;
    cleanup = undefined;
  };
  document.addEventListener('astro:before-swap', cleanup, { once: true });
}
