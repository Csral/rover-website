import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const subsystems = [
  {
    name: 'Mechanical',
    id: 'mechanical',
    mark: '↻',
    title: 'Give it a way to move.',
    description:
      'The physical build of Skanda, from its chassis and wheels to the robotic arm. The mechanical team makes sure the rover moves, reaches, and holds up on difficult terrain.',
    tags: ['Chassis & suspension', 'Robotic arm', 'Terrain navigation'],
  },
  {
    name: 'Electrical',
    id: 'electrical',
    mark: 'ϟ',
    title: 'Bring the machine to life.',
    description:
      'Sensors, power management, and stable communication. The electrical team connects the rover’s systems and keeps power and information flowing where they need to go.',
    tags: ['Power distribution', 'Sensors', 'Communication'],
  },
  {
    name: 'Computer science',
    id: 'computer-science',
    mark: '</>',
    title: 'Teach it what comes next.',
    description:
      'The programs that turn directions into action. The CS team builds the rover’s control software and algorithms for autonomous operations.',
    tags: ['Rover control', 'Autonomy', 'Algorithms'],
  },
  {
    name: 'Science',
    id: 'science',
    mark: '⚗',
    title: 'Look closer at the ground.',
    description:
      'Samples carry clues. The science team gathers and analyses them, designing experiments and turning the rover’s observations into useful insights.',
    tags: ['Sample collection', 'Scientific analysis', 'Experiments'],
  },
  {
    name: 'Media',
    id: 'media',
    mark: '✳',
    title: 'Tell the story behind it.',
    description:
      'Outreach, sponsorships, social media, and documentation. The media team shares the work and connects Team Odyssey with the people who help make it possible.',
    tags: ['Outreach', 'Sponsorships', 'Documentation'],
  },
];

export default function SubsystemNotebook() {
  const [selected, setSelected] = useState(0);
  const reducedMotion = useReducedMotion();
  const active = subsystems[selected];
  return (
    <div className="notebook">
      <div className="notebook-tabs" role="tablist" aria-label="Rover subsystems">
        {subsystems.map((subsystem, index) => (
          <button
            key={subsystem.name}
            id={`subsystem-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={selected === index}
            aria-controls="subsystem-panel"
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => {
              let next = index;
              if (event.key === 'ArrowRight') next = (index + 1) % subsystems.length;
              else if (event.key === 'ArrowLeft') next = (index + subsystems.length - 1) % subsystems.length;
              else if (event.key === 'Home') next = 0;
              else if (event.key === 'End') next = subsystems.length - 1;
              else return;
              event.preventDefault();
              setSelected(next);
              document.getElementById(`subsystem-tab-${next}`)?.focus();
            }}
          >
            {selected === index && (
              <motion.span
                className="tab-paper"
                layoutId="active-paper"
                transition={{ duration: reducedMotion ? 0 : 0.25 }}
              />
            )}
            <span>{subsystem.name}</span>
          </button>
        ))}
      </div>
      <div
        id="subsystem-panel"
        className="notebook-page"
        role="tabpanel"
        aria-labelledby={`subsystem-tab-${selected}`}
        tabIndex={0}
      >
        <div className="notebook-holes" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.name}
            className="notebook-content"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            <div>
              <span className="small-note">{`${active.name} subsystem`}</span>
              <h3>{active.title}</h3>
              <p>{active.description}</p>
              <ul className="subsystem-tags">
                {active.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <a className="ink-link" href={`/teams#${active.id}`}>
                {`Meet the ${active.name === 'Computer science' ? 'CS' : active.name.toLowerCase()} team`}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="subsystem-doodle" aria-hidden="true">
              <span>{active.mark}</span>
              <span className="handwritten">
                {active.name === 'Mechanical' ? 'Built to get a little dusty.' : 'One piece of the bigger picture.'}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
