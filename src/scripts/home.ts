import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import type { createHeroScene } from './hero-scene';
import type { createHeroWheel } from './hero-wheel';
import { createDeltaSwap } from './delta-swap';
import { createLetterPrint } from './letter-print';
import { createPendantWires } from './hero-wires';
import type { HeroLighting } from './hero-atmosphere';

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
      const atmosphereController = new AbortController();
      const wheelController = new AbortController();
      let wheel: Awaited<ReturnType<typeof createHeroWheel>>;
      const wheelGlyph = stage.querySelector<HTMLElement>('.wheel-glyph')!;
      const wheelFace = wheelGlyph.querySelector<HTMLElement>('.wheel-model')!;
      const globeFace = wheelGlyph.querySelector<HTMLElement>('.wheel-globe')!;
      let swap: gsap.core.Timeline | undefined;
      let globeLoading = false;
      function showGlobe(show: boolean) {
        wheelGlyph.dataset.globe = String(show);
        swap?.kill();
        context.add(() => {
          if (!animated) {
            gsap.set(wheelFace, { opacity: show ? 0 : 1, rotationY: 0, rotationZ: 0, x: 0, scale: 1 });
            gsap.set(globeFace, { opacity: show ? 1 : 0, rotationY: 0, rotationZ: 0, x: 0, scale: 1 });
            return;
          }
          swap = gsap.timeline();
          if (show) {
            swap
              .to(wheelFace, { rotationY: -90, opacity: 0, duration: 0.28, ease: 'power2.in' }, 0)
              .to(
                globeFace,
                { rotationY: 0, rotationZ: 0, x: 0, scale: 1, opacity: 1, duration: 0.34, ease: 'power3.out' },
                0.16
              );
          } else {
            // Give the returning wheel a little roll too, once its face is hidden.
            if (Number(gsap.getProperty(wheelFace, 'opacity')) < 0.05)
              gsap.set(wheelFace, { rotationY: 0, rotationZ: -14, x: 0, scale: 0.92 });
            swap
              .to(globeFace, { rotationZ: 32, x: 0, scale: 0.92, opacity: 0, duration: 0.34, ease: 'power2.inOut' }, 0)
              .to(
                wheelFace,
                { rotationY: 0, rotationZ: 0, x: 0, scale: 1, opacity: 1, duration: 0.36, ease: 'power2.out' },
                0.1
              );
          }
        });
        scene?.setActive(show);
        if (!show || scene || globeLoading) return;
        globeLoading = true;
        void import('./hero-scene')
          .then(({ createHeroScene }) => {
            if (!active || disposed) return;
            scene = createHeroScene(stage!, animated);
            scene.setActive(wheelGlyph.dataset.globe === 'true');
          })
          .catch(() => {
            /* The geographic SVG handles hover when WebGL is unavailable. */
          })
          .finally(() => {
            globeLoading = false;
          });
      }
      wheelGlyph.addEventListener(
        'pointerenter',
        (event) => {
          if (event.pointerType !== 'touch') showGlobe(true);
        },
        { signal: wheelController.signal }
      );
      wheelGlyph.addEventListener(
        'pointerleave',
        (event) => {
          if (event.pointerType !== 'touch') showGlobe(false);
        },
        { signal: wheelController.signal }
      );
      wheelGlyph.addEventListener(
        'pointerup',
        (event) => {
          if (event.pointerType === 'touch') showGlobe(wheelGlyph.dataset.globe !== 'true');
        },
        { signal: wheelController.signal }
      );
      const lighting: HeroLighting = { light: 0, wake: 0 };
      let resize: ResizeObserver | undefined;
      if (animated) stage.classList.add('kinetic-loading');

      function choreograph() {
        if (!active || disposed) return;
        stage!.classList.remove('kinetic-loading');
        note.textContent = "that's us";
        const q = <T extends Element = HTMLElement>(selector: string) => stage!.querySelector<T>(selector)!;
        const team = q('.team-word');
        const ship = q<SVGSVGElement>('.hero-ship');
        const positionWires = createPendantWires(stage!);
        const accentBlue = getComputedStyle(stage!).getPropertyValue('--accent-blue').trim();
        const letters = [...stage!.querySelectorAll<HTMLElement>('.hero-letter')];
        const e = q<HTMLElement>('.letter-e'),
          a = q<HTMLElement>('.letter-a');
        const s1 = q<HTMLElement>('.letter-s-first'),
          s2 = q<HTMLElement>('.letter-s-second');
        const delta = animated ? createDeltaSwap(q<HTMLElement>('.orbit-pair'), e, a, lighting) : undefined;
        const printer = animated ? createLetterPrint(q<HTMLElement>('.letter-e-last')) : undefined;
        const typing = { count: 0 };
        const firstNote = "Yes, that's us";
        const finalNote = "that's us";
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
          const noteOffset = mobile ? 144 : 248;
          const noteWidth = mobile ? 125 : 210;
          const left = Math.max(
            8,
            Math.min(desiredLeft, stage!.clientWidth - noteOffset - noteWidth - (mobile ? 20 : 45))
          );
          let top = targetY - rect.top - 25 * factor;
          const stickyLeft = Math.min(
            left + 210 * factor + (mobile ? 28 : 40),
            stage!.clientWidth - sticky.offsetWidth - 22
          );
          const desiredStickyTop = top + 130 * factor + (mobile ? 18 : 28) + (mobile ? 34 : 38);
          const stickyTop = Math.min(
            desiredStickyTop,
            stage!.clientHeight - sticky.offsetHeight - (mobile ? 135 : 130)
          );
          // Raise the whole annotation together, preserving the gap above the sticky.
          top -= desiredStickyTop - stickyTop;
          annotation.style.left = left + 'px';
          annotation.style.top = top + 'px';
          annotation.style.right = 'auto';
          annotation.style.bottom = 'auto';
          sticky.style.left = stickyLeft + 'px';
          sticky.style.top = stickyTop + 'px';
          sticky.style.right = 'auto';
          sticky.style.bottom = 'auto';
          // Land the tail on the sticky's left edge, beside the actual scroll instruction.
          fallenX = stickyLeft - left - 210 * factor;
          fallenY = stickyTop + sticky.offsetHeight * 0.52 - top - 130 * factor;
        }
        placeNotes();
        positionWires();
        resize = new ResizeObserver(() => {
          placeNotes();
          delta?.refresh();
          positionWires();
          if (!animated || (sequence && sequence.time() >= sequence.labels.annotations + 2.8)) settleArrow();
        });
        resize.observe(stage!);
        if (!animated) {
          gsap.set([e, a], { clearProps: 'transform' });
          settleArrow();
          gsap.set(q('.arrow-line'), { attr: { d: 'M210 130C179 142 142 117 109 68' } });
          gsap.set(q('.arrow-head'), { attr: { d: 'M127 71 109 68 111 85' } });
          return;
        }

        sequence = gsap.timeline({ defaults: { ease: 'power3.out' } });
        const travel = stage!.clientWidth + team.offsetWidth;
        const wheelTravel = () =>
          q<HTMLElement>('.letter-o').getBoundingClientRect().left -
          stage!.getBoundingClientRect().left +
          q<HTMLElement>('.letter-o').offsetWidth;
        const wheelDistance = wheelTravel();
        const wheelRadius = q<HTMLElement>('.wheel-glyph').offsetWidth / 2.44;
        const wheelAngle = ((wheelDistance / wheelRadius) * 180) / Math.PI;
        sequence.addLabel('arrival', 1.6).addLabel('departure', 2.8).addLabel('odyssey', 2.2);
        // Team is the sail. Only the hull and rigging depart once it is delivered.
        sequence
          .set(letters, { clearProps: 'transform,color,visibility,opacity' })
          .set(letters.slice(4), { autoAlpha: 0 })
          .set(e, { x: a.offsetWidth })
          .set(a, { x: -e.offsetWidth })
          .set(ship, { autoAlpha: 1, x: 0, rotation: 0 })
          .set(q('.kinetic-title'), { color: '#c4bbaa' })
          .set([team, q('.odyssey-word')], { color: '#c4bbaa' })
          .set(q('.lamp-led'), { opacity: 0 })
          .set(q('.pendant-glow'), { opacity: 0 })
          .set(q('.hero-apology'), { '--caption-warmth': '0%' })
          .set(q('.delta-mechanism'), { autoAlpha: 0 })
          .set(stage!.querySelectorAll('.lamp-cables path'), { stroke: '#05070b' })
          .set([q('.hero-sticky'), note], { autoAlpha: 0 })
          .set(note, { textContent: '' })
          .set(typing, { count: 0 })
          .set(q('.rotating-arrow'), { rotation: 0, x: 0, y: 0 })
          .set(q('.rotating-arrow .arrow-line'), { attr: { d: 'M210 130C166 132 91 80 38 25' } })
          .set(q('.rotating-arrow .arrow-head'), { attr: { d: 'M55 28 38 25 41 43' } })
          .set(arrowPaths, { drawSVG: '0% 0%' })
          .set(inkPaths, { drawSVG: '0% 0%', fillOpacity: 0 })
          .set(q('.y-reel'), { yPercent: 0 })
          .set(q('.hero-sticky .tape'), { scaleX: 0 })
          .fromTo(team, { x: -travel, autoAlpha: 1 }, { x: 0, duration: 1.45, ease: 'power3.out' }, 0.15)
          .to(stage!.querySelectorAll('.lamp-cables path'), { stroke: accentBlue, duration: 0.25 }, 'arrival')
          .to(lighting, { wake: 1, duration: 0.25 }, 'arrival')
          .to(lighting, { wake: 0, duration: 0.8 }, 'arrival+=0.25')
          .add(delta!.timeline, 'arrival')
          .to(q('.hero-apology'), { '--caption-warmth': '16%', duration: 0.65 }, 'arrival+=4.18')
          .to(team, { color: '#edcc99', duration: 0.65 }, 'arrival+=4.18')
          .to(q('.odyssey-word'), { color: '#d9c8ae', duration: 0.65 }, 'arrival+=4.18')
          .to(ship, { x: -travel, rotation: -3, duration: 1.2, ease: 'power2.in' }, 'arrival')
          .set(ship, { autoAlpha: 0 }, 'departure')
          .fromTo(q('.letter-d'), { y: 35, rotation: 8 }, { autoAlpha: 1, y: 0, rotation: 0, duration: 0.6 }, 'odyssey')
          .set(q('.letter-y-first'), { autoAlpha: 1 }, 'odyssey+=0.2')
          .fromTo(s1, { y: -25, rotation: -15 }, { autoAlpha: 1, y: 0, rotation: 0, duration: 0.55 }, 'odyssey+=0.4')
          .set(q('.letter-e-last'), { autoAlpha: 1 }, 'odyssey+=0.6')
          .add(printer!, 'odyssey+=0.6')
          .set(q('.letter-y-last'), { autoAlpha: 1 }, 'odyssey+=0.75')
          .to(q('.y-reel'), { yPercent: -200 / 3, duration: 1.25, ease: 'power2.inOut' }, 'odyssey+=0.75')
          .set(q('.letter-o'), { autoAlpha: 1 }, 'departure')
          .fromTo(
            q('.letter-o'),
            { x: -wheelDistance, rotation: -wheelAngle },
            { x: 0, rotation: 0, duration: 1.0, ease: 'power2.out' },
            'departure'
          )
          .to(s1, { scaleX: 0.7, rotation: -8, duration: 0.22 }, 'odyssey+=1.7')
          .fromTo(
            s2,
            { x: () => s1.offsetLeft - s2.offsetLeft, scaleX: 0.7 },
            { autoAlpha: 1, x: 0, scaleX: 1, duration: 0.7, ease: 'back.out(1.4)' },
            'odyssey+=1.75'
          )
          .to(s1, { scaleX: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.4)' }, 'odyssey+=1.92');

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
      void import('./hero-wheel')
        .then(async ({ createHeroWheel }) => {
          if (!active || disposed) return;
          const instance = await createHeroWheel(stage, wheelController.signal);
          if (!active || disposed) instance?.dispose();
          else wheel = instance;
        })
        .catch(() => {
          /* The rendering of the same STL stays visible without WebGL. */
        });
      if (animated) {
        void import('./hero-atmosphere')
          .then(({ createHeroAtmosphere }) => {
            if (!active || disposed) return;
            return createHeroAtmosphere(stage, lighting, atmosphereController.signal);
          })
          .catch(() => {
            /* The CSS light remains available without a GPU renderer. */
          });
      }

      return () => {
        active = false;
        atmosphereController.abort();
        wheelController.abort();
        wheel?.dispose();
        swap?.kill();
        delete wheelGlyph.dataset.globe;
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
