import gsap from 'gsap';

/** A single delta gripper parks a, places e, then returns a to its slot. */
export function createDeltaSwap(pair: HTMLElement, e: HTMLElement, a: HTMLElement, lighting: { light: number }) {
  const mount = pair.closest<HTMLElement>('.team-stage')!;
  const bot = mount.querySelector<SVGSVGElement>('.delta-bot')!;
  const mechanism = bot.querySelector<SVGGElement>('.delta-mechanism')!;
  const casing = bot.querySelector<SVGPathElement>('.lamp-casing')!;
  const details = bot.querySelector<SVGGElement>('.lamp-details')!;
  const led = bot.querySelector<SVGPathElement>('.lamp-led')!;
  const glow = mount.querySelector<HTMLElement>('.pendant-glow')!;
  const head = bot.querySelector<SVGGElement>('.delta-head')!;
  const arms = [...bot.querySelectorAll<SVGGElement>('.delta-arm')].map((arm) => ({
    upper: arm.querySelector<SVGPathElement>('.delta-upper')!,
    rods: arm.querySelector<SVGPathElement>('.delta-rods')!,
    joint: arm.querySelector<SVGCircleElement>('.delta-joint')!,
  }));
  const leftJaw = bot.querySelector<SVGPathElement>('.delta-jaw-left')!;
  const rightJaw = bot.querySelector<SVGPathElement>('.delta-jaw-right')!;
  const anchors = [
    [48, 25],
    [160, 25],
    [272, 25],
  ];
  const pose = { eX: 1, eY: 0, aX: -1, aY: 0, headX: 0.5, headY: -0.29, grip: 0 };
  const setEX = gsap.quickSetter(e, 'x', 'px');
  const setEY = gsap.quickSetter(e, 'y', 'px');
  const setAX = gsap.quickSetter(a, 'x', 'px');
  const setAY = gsap.quickSetter(a, 'y', 'px');
  let font = 1,
    width = 1,
    eWidth = 1,
    aWidth = 1,
    pairLeft = 0,
    mountWidth = 1;

  function refresh() {
    // Read only when layout changes. The animation below uses this cached geometry.
    font = parseFloat(getComputedStyle(pair).fontSize);
    width = pair.offsetWidth;
    eWidth = e.offsetWidth;
    aWidth = a.offsetWidth;
    pairLeft = pair.offsetLeft;
    mountWidth = mount.offsetWidth;
  }
  refresh();
  const left = () => aWidth / 2 / width;
  const right = () => (aWidth + eWidth / 2) / width;
  const finalA = () => (eWidth + aWidth / 2) / width;

  function render() {
    setEX(pose.eX * aWidth);
    setEY(pose.eY * font);
    setAX(pose.aX * eWidth);
    setAY(pose.aY * font);
    // The fixture spans Team; the gripper moves only between e and a.
    const x = ((pairLeft + pose.headX * width) / mountWidth) * 320;
    const y = ((pose.headY + 0.45) / 1.1) * 190 - 16;
    head.setAttribute('transform', `translate(${x} ${y})`);
    leftJaw.setAttribute('transform', `translate(${pose.grip * 4} 0)`);
    rightJaw.setAttribute('transform', `translate(${-pose.grip * 4} 0)`);
    arms.forEach(({ upper, rods, joint }, index) => {
      const [ax, ay] = anchors[index];
      const spread = index === 0 ? -12 : index === 2 ? 12 : 0;
      const ex = ax + (x - ax) * 0.38 + spread;
      const ey = ay + (y - ay) * 0.48;
      upper.setAttribute('d', `M${ax} ${ay}L${ex} ${ey}`);
      rods.setAttribute('d', `M${ex - 2} ${ey}L${x - 5} ${y}M${ex + 2} ${ey}L${x + 5} ${y}`);
      joint.setAttribute('cx', String(ex));
      joint.setAttribute('cy', String(ey));
    });
  }

  const timeline = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onUpdate: render });
  timeline
    .to(casing, { morphSVG: 'M8 8H312V30H8Z', stroke: '#8996a8', duration: 0.25 }, 0)
    .to(details, { opacity: 0, duration: 0.16 }, 0)
    .to(mechanism, { autoAlpha: 1, duration: 0.18 }, 0.16)
    .to(pose, { headX: left, headY: 0.45, duration: 0.3 }, 0.45)
    .to(pose, { grip: 1, duration: 0.1 }, 0.75)
    .to(pose, { aY: -0.6, headY: -0.15, duration: 0.4 }, 0.85)
    .to(pose, { grip: 0, duration: 0.1 }, 1.25)
    .to(pose, { headX: right, headY: 0.45, duration: 0.3 }, 1.35)
    .to(pose, { grip: 1, duration: 0.1 }, 1.65)
    .to(pose, { eY: -0.02, headY: 0.43, duration: 0.2 }, 1.75)
    .to(pose, { eX: 0, headX: () => eWidth / 2 / width, duration: 0.38 }, 1.95)
    .to(pose, { eY: 0, headY: 0.45, duration: 0.18 }, 2.33)
    .to(pose, { grip: 0, duration: 0.08 }, 2.51)
    .to(pose, { headX: left, headY: -0.15, duration: 0.25 }, 2.59)
    .to(pose, { grip: 1, duration: 0.08 }, 2.84)
    .to(pose, { aX: 0, headX: finalA, duration: 0.38 }, 2.92)
    .to(pose, { aY: 0, headY: 0.45, duration: 0.3 }, 3.3)
    .to(pose, { grip: 0, duration: 0.08 }, 3.6)
    .to(pose, { headX: 0.5, headY: -0.29, duration: 0.25 }, 3.68)
    .to(mechanism, { autoAlpha: 0, duration: 0.16 }, 3.93)
    .to(casing, { morphSVG: 'M8 8H312L319 15 313 38H7L1 15Z', stroke: '#929ea8', duration: 0.25 }, 3.93)
    .to(details, { opacity: 1, duration: 0.2 }, 4.05)
    .to(led, { opacity: 1, duration: 0.35 }, 4.18)
    .to(glow, { opacity: 1, duration: 0.45 }, 4.18)
    .to(lighting, { light: 1, duration: 0.65 }, 4.18)
    .to(mount.closest('.kinetic-title'), { color: '#edcc99', duration: 0.45 }, 4.18);

  return { timeline, refresh };
}
