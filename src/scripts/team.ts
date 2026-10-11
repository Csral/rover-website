import type { TeamDirectory } from '~/utils/team-directory';

type LegacyView = 'org' | 'grid' | 'compact';
let dispose: (() => void) | undefined;
let currentPage: HTMLElement | null = null;

export function initTeam() {
  const page = document.querySelector<HTMLElement>('[data-team-page]');
  if (page && page === currentPage) return;
  dispose?.();
  if (!page) return;
  currentPage = page;
  const find = <T extends Element = HTMLElement>(selector: string) => page.querySelector<T>(selector)!;
  const controller = new AbortController();
  const { signal } = controller;
  const modern = find('#team-modern');
  const legacy = find('#team-legacy');
  const styleButton = find<HTMLButtonElement>('#btn-team-style');
  const legacyButtons = [...page.querySelectorAll<HTMLButtonElement>('[data-legacy-view]')];
  const org = find('#view-org');
  const grid = find('#view-grid');
  const dialog = find<HTMLDialogElement>('#member-modal');
  const photo = find<HTMLImageElement>('#modal-photo');
  const avatar = find('#modal-avatar');
  const profiles: TeamDirectory['profiles'] = JSON.parse(find('#team-profiles').textContent || '{}');
  const socialLinks = [...page.querySelectorAll<HTMLAnchorElement>('[data-social]')];
  let lastCard: HTMLButtonElement | undefined;
  let previousOverflow = '';

  function setStyle(isLegacy: boolean) {
    modern.hidden = isLegacy;
    legacy.hidden = !isLegacy;
    styleButton.setAttribute('aria-pressed', String(isLegacy));
    styleButton.setAttribute('aria-label', `Switch to ${isLegacy ? 'Modern' : 'Legacy'} view`);
    find('[data-mode="modern"]').classList.toggle('selected', !isLegacy);
    find('[data-mode="legacy"]').classList.toggle('selected', isLegacy);
  }

  function setLegacyView(mode: LegacyView) {
    org.hidden = mode !== 'org';
    grid.hidden = mode === 'org';
    grid.classList.toggle('compact-mode', mode === 'compact');
    legacyButtons.forEach((button) => {
      const selected = button.dataset.legacyView === mode;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function openLinkedTeam() {
    let id: string;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const target = document.getElementById(id);
    if (target && modern.contains(target)) {
      setStyle(false);
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }

  function setField(key: 'speciality' | 'about', value?: string | null) {
    find(`#modal-${key}`).textContent = value || '';
    find(`[data-field="${key}"]`).hidden = !value;
  }

  function openMember(card: HTMLButtonElement) {
    const member = profiles[card.dataset.memberId || ''];
    if (!member) return;
    lastCard = card;
    find('#modal-name').textContent = member.name;
    find('#modal-role').textContent = member.role;
    const subdivision = card.dataset.subdivision || member.subdivision;
    find('#modal-subdivision').textContent = subdivision || '';
    find('#modal-subdivision').hidden = !subdivision;
    setField('speciality', member.role === 'Mentor' ? null : member.speciality);
    setField('about', member.about);
    photo.hidden = !member.photoUrl;
    avatar.hidden = Boolean(member.photoUrl);
    if (member.photoUrl) {
      photo.src = member.photoUrl;
      photo.alt = member.name;
    } else {
      photo.removeAttribute('src');
      avatar.textContent = member.name
        .split(' ')
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      avatar.style.background = card.dataset.avatarGradient || '#3b352d';
    }
    let hasSocials = false;
    socialLinks.forEach((link) => {
      const key = link.dataset.social as keyof typeof member.socials;
      const value = member.socials[key];
      const valid = Boolean(value && (key === 'email' ? value.includes('@') : /^https?:\/\//.test(value)));
      link.hidden = !valid;
      if (valid) link.href = key === 'email' ? `mailto:${value}` : value!;
      else link.removeAttribute('href');
      hasSocials ||= valid;
    });
    find('[data-field="socials"]').hidden = !hasSocials;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
  }

  styleButton.addEventListener('click', () => setStyle(styleButton.getAttribute('aria-pressed') !== 'true'), {
    signal,
  });
  page.addEventListener(
    'click',
    (event) => {
      const target = event.target as Element;
      const viewButton = target.closest<HTMLButtonElement>('[data-legacy-view]');
      if (viewButton) setLegacyView(viewButton.dataset.legacyView as LegacyView);
      const card = target.closest<HTMLButtonElement>('[data-member-id]');
      if (card) openMember(card);
    },
    { signal }
  );
  find('.profile-close').addEventListener('click', () => dialog.close(), { signal });
  dialog.addEventListener(
    'click',
    (event) => {
      if (event.target === dialog) dialog.close();
    },
    { signal }
  );
  dialog.addEventListener(
    'close',
    () => {
      document.body.style.overflow = previousOverflow;
      photo.removeAttribute('src');
      lastCard?.focus();
    },
    { signal }
  );
  dialog.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll<HTMLElement>('button, a[href]')].filter(
        (element) => !element.hidden && element.getClientRects().length > 0
      );
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    },
    { signal }
  );
  window.addEventListener('hashchange', openLinkedTeam, { signal });
  document.addEventListener('astro:before-swap', () => dispose?.(), { signal, once: true });
  dispose = () => {
    if (dialog.open) {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    }
    controller.abort();
    currentPage = null;
    dispose = undefined;
  };
  openLinkedTeam();
}
