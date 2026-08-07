/*

Record:
me@csral.dev: removed subdivision field from each entry as no information regarding this was provided.
              Check commit: 4f469dc for previous entries which includes subdivision

*/

export type RoleEntries = 'Team Lead' | 'Technical Lead' | 'Administrative Lead' | 'Project Manager' | 'Member' | 'Mentor';
export type SubdivisionEntries = 'CS & AI' | 'Mechanical' | 'Science' | 'Media' | 'EC & EE';

export interface TeamMember {
  name: string;
  role: RoleEntries;
  subdivision?: SubdivisionEntries;
  speciality: string | null;
  about: string | null;
  photo?: string | null; // Filename (e.g. 'john-doe.jpg') placed in src/data/profilepic/
  socials: {
    github?: string;
    linkedin?: string;
    email?: string;
    website?: string;
  };
}

const teamData: Record<string, TeamMember[]> = {
  Mechanical: [
    {
      name: 'Tejasvi Maligi', role: 'Member', subdivision: 'Mechanical', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'tejasvi@rovah.org' }
    },
    {
      name: 'Korivi Susruth Achinthya', role: 'Member', subdivision: 'Mechanical', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'susruth@rovah.org' }
    },
    {
      name: 'Vishal Reddy B', role: 'Member', subdivision: 'Mechanical', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'vishal@rovah.org' }
    },
    {
      name: 'T Sathwik Reddy', role: 'Member', subdivision: 'Mechanical', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'sathwik@rovah.org' }
    },
    {
      name: 'K Uday Vikas', role: 'Member', subdivision: 'Mechanical', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'uday@rovah.org' }
    },
  ],

  Electrical: [
    {
      name: 'Deekshita Perala', role: 'Member', subdivision: 'EC & EE', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'deekshita@rovah.org' }
    },
    {
      name: 'Maanasha Ravichandran', role: 'Member', subdivision: 'EC & EE', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'maanasha@rovah.org' }
    },
    {
      name: 'Reyvanth R V', role: 'Member', subdivision: 'EC & EE', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'maanasha@rovah.org' }
    },
    {
      name: 'Jhansi', role: 'Member', subdivision: 'EC & EE', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'jhansi@rovah.org' }
    },
    {
      name: 'Ashish', role: 'Member', subdivision: 'EC & EE', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'ashish@rovah.org' }
    },
    {
      name: 'Haasini', role: 'Member', subdivision: 'EC & EE', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'haasini@rovah.org' }
    },
    {
      name: 'Sri Lekha K', role: 'Member', subdivision: 'EC & EE', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'srilekha@rovah.org' }
    },
    {
      name: 'Nithilan RameshKumar', role: 'Member', subdivision: 'EC & EE', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'nithilan@rovah.org' }
    },
  ],

  'CS and AI': [
    {
      name: 'C. Harshith Reddy', role: 'Member', subdivision: 'CS & AI', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'harshith@rovah.org' }
    },
    {
      name: 'Satya Srinivas Paladugu', role: 'Member', subdivision: 'CS & AI', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'satya@rovah.org' }
    },
    {
      name: 'Manasvini Kandikonda', role: 'Member', subdivision: 'CS & AI', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'manasvini@rovah.org' }
    },
    {
      name: 'Shaurya Pandey', role: 'Member', subdivision: 'CS & AI', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'shaurya@rovah.org' }
    },
    {
      name: 'K Deepti', role: 'Member', subdivision: 'CS & AI', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'deepti@rovah.org' }
    },
    {
      name: 'G Akhileshwar Reddy', role: 'Member', subdivision: 'CS & AI', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'akhileshwar@rovah.org' }
    },
    {
      name: 'Chirayu Nilesh Chaudhari', role: 'Member', subdivision: 'CS & AI', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'chirayu@rovah.org' }
    },
    {
      name: 'Niyatee Santosh Gamre', role: 'Member', subdivision: 'CS & AI', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'niyatee@rovah.org' }
    },
    {
      name: 'Manya Kumar', role: 'Member', subdivision: 'CS & AI', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'manya@rovah.org' }
    },
  ],

  Media: [
    {
      name: 'Kokkalla Akshaya', role: 'Member', subdivision: 'Media', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'akshaya@rovah.org' }
    },
    {
      name: 'Janya Billa', role: 'Member', subdivision: 'Media', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'janya@rovah.org' }
    },
  ],

  Science: [
    {
      name: 'Hanish', role: 'Member', subdivision: 'Science', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'hanish@rovah.org' }
    },
    {
      name: 'Roselina', role: 'Member', subdivision: 'Science', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'roselina@rovah.org' }
    },
    {
      name: 'Roshni', role: 'Member', subdivision: 'Science', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'roshni@rovah.org' }
    },
    {
      name: 'H.S Tarun', role: 'Member', subdivision: 'Science', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'tarun@rovah.org' }
    },
    {
      name: 'Rtamanyu', role: 'Member', subdivision: 'Science', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'rtamanyu@rovah.org' }
    },
    {
      name: 'Babitha', role: 'Member', subdivision: 'Science', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'babitha@rovah.org' }
    },
    {
      name: 'G Akhileshwar Reddy', role: 'Member', subdivision: 'Science', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'akhileshwar_s@rovah.org' }
    },
    {
      name: 'Kalyani Deepu Narayanan', role: 'Member', subdivision: 'Science', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'kalyani@rovah.org' }
    },
  ],

  Mentors: [
    {
      name: 'Dr. D. N. Kiran Pandiri', role: 'Mentor', speciality: null, about: null, photo: 'd-n-kiran-pandiri.png',
      socials: { website: 'https://www.amrita.edu/faculty/d-n-kiran-pandiri/', email: 'p_kiran@blr.amrita.edu', linkedin: 'https://www.linkedin.com/in/dr-kiran-pandiri-39758856/' }
    },
    {
      name: 'Dr. Rajesh M', role: 'Mentor', speciality: null, about: null, photo: 'dr_rajesh_m.png',
      socials: { website: 'https://www.amrita.edu/faculty/rajesh-m/', email: 'm_rajesh@blr.amrita.edu', linkedin: 'https://www.linkedin.com/in/rajesh-madathil-68986a24/' }
    },
  ],

  TeamLead: [
    {
      name: 'Shrivardhan', role: 'Administrative Lead', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'shrivardhan@rovah.org' }
    },
    {
      name: 'Ekansh', role: 'Technical Lead', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'ekansh@rovah.org' }
    },
    {
      name: 'Chaturya', role: 'Team Lead', subdivision: 'CS & AI', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'chaturya@rovah.org' }
    },
    {
      name: 'Lohitashwa Talamanchi', role: 'Team Lead', subdivision: 'Science', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'lohitashwa@rovah.org' }
    },
    {
      name: 'Prakhar', role: 'Team Lead', subdivision: 'EC & EE', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'prakhar@rovah.org' }
    },
    {
      name: 'M Nikhil', role: 'Team Lead', subdivision: 'Mechanical', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'nikhil@rovah.org' }
    },
    {
      name: 'Pragathi L', role: 'Team Lead', subdivision: 'Media', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'pragathi@rovah.org' }
    },
  ],
  'Project Manager': [
    {
      name: 'Roydon Vilber Rodrigues', role: 'Project Manager', subdivision: 'Mechanical', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'roydon@rovah.org' }
    },
    {
      name: 'Naga Vaishnavi', role: 'Project Manager', subdivision: 'Mechanical', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'vaishnavi@rovah.org' }
    },
    
    {
      name: 'Shainehaa VT', role: 'Project Manager', subdivision: 'EC & EE', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'shainehaa@rovah.org' }
    },
    {
      name: 'S.J. Yatish', role: 'Project Manager', subdivision: 'EC & EE', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'yatish@rovah.org' }
    },
    
    {
      name: 'Gokul Krishna M', role: 'Project Manager', subdivision: 'CS & AI', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'gokul@rovah.org' }
    },
    {
      name: 'Jahnavi S', role: 'Project Manager', subdivision: 'CS & AI', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'jahnavi@rovah.org' }
    },
    
    {
      name: 'Harshil Reddy', role: 'Project Manager', subdivision: 'Science', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'harshil@rovah.org' }
    },
    {
      name: 'Prithvi S', role: 'Project Manager', subdivision: 'Science', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'prithvi@rovah.org' }
    },

  ]
};

export default teamData;