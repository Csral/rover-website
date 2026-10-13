/** Two imperfect cable bundles hang independently, with a loose conductor in each. */
export function createPendantWires(stage: HTMLElement) {
  const svg = stage.querySelector<SVGSVGElement>('.lamp-cables')!;
  const lamp = stage.querySelector<SVGSVGElement>('.delta-bot')!;
  const paths = [...svg.querySelectorAll('path')];
  return () => {
    const box = stage.getBoundingClientRect();
    const fixture = lamp.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${stage.clientWidth} ${stage.clientHeight}`);
    const endY = Math.max(10, fixture.top - box.top + (fixture.height * 4) / 190);
    paths.forEach((path, index) => {
      const bundle = index < 3 ? 0 : 1;
      const strand = index % 3;
      const x = fixture.left - box.left + fixture.width * (bundle ? 0.8 : 0.2);
      const direction = bundle ? -1 : 1;
      const anchorOffset = direction * fixture.width * (bundle ? 0.055 : -0.045);
      const steps = Math.ceil(endY / 2);
      const points = Array.from({ length: steps + 1 }, (_, step) => {
        const t = step / steps;
        const envelope = Math.sin(Math.PI * t);
        const sag = direction * (bundle ? 11 : 16) * envelope;
        const kink = Math.sin(t * Math.PI * (bundle ? 3 : 2) + bundle) * envelope * 4;
        const twist = Math.sin((t * endY) / (bundle ? 4.7 : 5.5) + strand * 2.1);
        const loose = strand === 2 ? direction * 7 * Math.sin(t * Math.PI * 3) * envelope : 0;
        const cableX = x + anchorOffset * (1 - t) + sag + kink + twist * 2 * envelope + loose;
        return `${step ? 'L' : 'M'}${cableX.toFixed(2)} ${(t * endY).toFixed(2)}`;
      });
      path.setAttribute('d', points.join(''));
    });
  };
}
