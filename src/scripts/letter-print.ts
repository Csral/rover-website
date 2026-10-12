import gsap from 'gsap';

/** Raster infill, viewed from above, clipped to the same font as the finished letter. */
export function createLetterPrint(letter: HTMLElement) {
  const printer = letter.querySelector<SVGSVGElement>('.letter-printer')!;
  const fallback = letter.querySelector<HTMLElement>('.printed-letter')!;
  const stencil = printer.querySelector<SVGTextElement>('.print-stencil')!;
  const filament = printer.querySelector<SVGPathElement>('.print-filament')!;
  const head = printer.querySelector<SVGGElement>('.print-head')!;
  const gantry = printer.querySelector<SVGGElement>('.print-gantry')!;
  const crossbar = printer.querySelector<SVGRectElement>('.print-crossbar')!;
  const bed = printer.querySelector<SVGRectElement>('.print-bed')!;
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 103;
  const context = canvas.getContext('2d')!;
  const style = getComputedStyle(fallback);
  context.font = `${style.fontWeight} 100px ${style.fontFamily}`;
  const metrics = context.measureText('e');
  const ascent = metrics.fontBoundingBoxAscent;
  const descent = metrics.fontBoundingBoxDescent;
  const baseline = Number.isFinite(ascent + descent) ? (103 - ascent - descent) / 2 + ascent : 88;
  stencil.setAttribute('y', String(baseline));
  const left = -metrics.actualBoundingBoxLeft;
  const right = metrics.actualBoundingBoxRight;
  const top = baseline - metrics.actualBoundingBoxAscent;
  const bottom = baseline + metrics.actualBoundingBoxDescent;
  const frameLeft = left - 7;
  const frameRight = right + 7;
  const frameTop = top - 9;
  const frameBottom = bottom + 9;

  Object.entries({ x: frameLeft, y: frameTop, width: frameRight - frameLeft, height: frameBottom - frameTop }).forEach(
    ([attribute, value]) => bed.setAttribute(attribute, String(value))
  );
  crossbar.setAttribute('x', String(frameLeft));
  crossbar.setAttribute('width', String(frameRight - frameLeft));
  printer
    .querySelector('.print-rails')!
    .setAttribute(
      'd',
      `M${frameLeft + 2} ${frameTop + 3}V${frameBottom - 3}M${frameRight - 2} ${frameTop + 3}V${frameBottom - 3}`
    );
  const grid: string[] = [];
  for (let x = frameLeft + 8; x < frameRight; x += 8) grid.push(`M${x} ${frameTop}V${frameBottom}`);
  for (let y = frameTop + 8; y < frameBottom; y += 8) grid.push(`M${frameLeft} ${y}H${frameRight}`);
  printer.querySelector('.print-grid')!.setAttribute('d', grid.join(''));

  // Connect each pass at its edge. The glyph mask suppresses extrusion over the counter and outside the letter.
  const passes = Math.ceil((bottom - top) / 2.25);
  const spacing = (bottom - top) / passes;
  const path = [`M${left} ${bottom}`];
  for (let row = 0; row <= passes; row++) {
    const y = bottom - row * spacing;
    if (row) path.push(`V${y}`);
    path.push(`H${row % 2 ? left : right}`);
  }
  filament.setAttribute('d', path.join(''));
  const length = filament.getTotalLength();
  const cursor = { progress: 0, x: left, y: bottom };
  function moveHead() {
    // The nozzle is five units below the housing centre in this top-down drawing.
    head.setAttribute('transform', `translate(${cursor.x} ${cursor.y - 5})`);
    gantry.setAttribute('transform', `translate(0 ${cursor.y - 5})`);
  }
  function print() {
    const point = filament.getPointAtLength(cursor.progress * length);
    cursor.x = point.x;
    cursor.y = point.y;
    moveHead();
  }
  moveHead();

  return gsap
    .timeline({ defaults: { ease: 'none' } })
    .set(fallback, { opacity: 0 })
    .set(printer, { autoAlpha: 0 })
    .set(filament, { drawSVG: '0% 0%' })
    .to(printer, { autoAlpha: 1, duration: 0.16 }, 0)
    .to(cursor, { progress: 1, duration: 2.2, onUpdate: print }, 0.16)
    .to(filament, { drawSVG: '0% 100%', duration: 2.2 }, 0.16)
    .to(fallback, { opacity: 1, duration: 0.16 }, 2.36)
    .to(cursor, { x: frameRight - 3, y: frameTop + 3, duration: 0.24, ease: 'power2.inOut', onUpdate: moveHead }, 2.36)
    .to(printer, { autoAlpha: 0, duration: 0.2 }, 2.6);
}
