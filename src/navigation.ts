import { getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Home',
      href: '/',
    },
    {
      text: 'Team',
      href: '/team',
    },
    {
      text: 'Blog',
      href: '/blog',
    },
    {
      text: 'Links',
      href: '/links',
    },
    {
      text: 'Records',
      href: 'http://records.teamodyssey.space/'
    }
  ],
};

export const footerData = {
  links: [{}, {}, {}, {}],
  socialLinks: [
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://www.instagram.com/teamodysseyhq' },
    {
      ariaLabel: 'LinkedIn',
      icon: 'tabler:brand-linkedin',
      href: 'https://www.linkedin.com/in/avv-b-rover-team/',
    },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/TeamOdysseyHQ/' },
  ],
};
