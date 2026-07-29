export interface Sponsor {
  name: string;
  logo: string; // filename in src/data/sponsor-logo/
  website: string;
}

export const sponsors: Sponsor[] = [
  {
    name: 'OnlyScrews',
    logo: 'OnlyScrews.png',
    website: 'https://onlyscrews.in/',
  },
  {
    name: 'Probots',
    logo: 'Probotlogo.png',
    website: 'https://probots.co.in/',
  },
  {
    name: 'Protocase',
    logo: 'protocase-brand.png',
    website: 'https://www.protocase.com/',
  },
];
