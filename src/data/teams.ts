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
    // {
    //   name: 'Tejasvi Maligi', role: 'Member', subdivision: 'Mechanical', speciality: null, about: null, photo: 'default.png',
    //   socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'tejasvi@rovah.org' }
    // },
    {
      name: 'Roopavani SD', role: 'Member', subdivision: 'Mechanical', speciality: 'Code & CAD', about: 'Driven by curiosity, powered by creativity.', photo: 'Roopavani S.D.png',
      socials: { github: 'https://github.com/Roopa198', linkedin: 'https://www.linkedin.com/in/roopa-1253a19m08', email: 'sdroopa198@gmail.com' }
    },
    {
      name: 'S. V. Sanjay', role: 'Member', subdivision: 'Mechanical', speciality: 'Design and Fabrication', about: 'Mechanical Engineering student focused on innovation, design, and practical engineering solutions.', photo: 'Sv Sanjay.png',
      socials: { github: 'https://github.com/sanjaysivakumaran007', linkedin: 'https://www.linkedin.com/in/sv-sanjay-423253359', email: 'sanjaysivakumaran4@gmail.com' }
    },
    {
      name: 'Swanand Khanapurkar', role: 'Member', subdivision: 'Mechanical', speciality: 'Design and Analysis', about: 'Never quit learning.', photo: 'default.png',
      socials: { linkedin: 'https://www.linkedin.com/in/swanand-khanapurkar-374596390', email: 'swanandk878@gmail.com' }
    },
    {
      name: 'Korivi Susruth Achinthya', role: 'Member', subdivision: 'Mechanical', speciality: 'CAD & Robotics', about: 'Building intelligent robotic systems for exploration and innovation.', photo: 'Korivi Susruth Achinthya.png',
      socials: { github: 'https://github.com/susruthachinthya', linkedin: 'https://www.linkedin.com/in/susruth-achinthya-korivi-16651a384', email: 'susrutachinthyakorivi@gmail.com' }
    },
    {
      name: 'Vishal Reddy B', role: 'Member', subdivision: 'Mechanical', speciality: 'Communication & Creative Direction', about: 'A creative communicator turning bold ideas into reality.', photo: 'Vishal Reddy B.png',
      socials: { github: 'https://github.com/vishalredy2007', linkedin: 'https://www.linkedin.com/in/vishal-reddy-218a17424', email: 'vishal.121reddy@gmail.com' }
    },
    {
      name: 'T Sathwik Reddy', role: 'Member', subdivision: 'Mechanical', speciality: 'Robotics, CAD Design & Rover Mechanisms', about: 'Robotics & AI student passionate about developing intelligent mechanical systems for autonomous exploration vehicles.', photo: 'Tekula Sai Sathwik Reddy.png',
      socials: { github: 'https://github.com/Sathwik-reddy-tekula', linkedin: 'https://www.linkedin.com/in/sathwik-reddy-tekula', email: 'sathwik_tekula@teamodyssey.space' }
    },
    {
      name: 'K Uday Vikas', role: 'Member', subdivision: 'Mechanical', speciality: 'Fabrication', about: 'Good at fabrication.', photo: 'default.png',
      socials: { github: 'https://github.com/kudayvikas7-bot', linkedin: 'https://www.linkedin.com/in/kondoju-uday-vikas-064722397', email: 'kudayvikas7@gmail.com' }
    },
  ],

  Electrical: [
    {
      name: 'Deekshita Perala', role: 'Member', subdivision: 'EC & EE', speciality: 'Embedded Systems', about: 'Passionate engineer building electronic systems.', photo: 'Deekshita Perala.png',
      socials: { github: 'https://github.com/deekshitap', linkedin: 'https://www.linkedin.com/in/deekshita-perala-34aa99270', email: 'deekshita.perala@gmail.com' }
    },
    {
      name: 'Maanasha Ravichandran', role: 'Member', subdivision: 'EC & EE', speciality: 'Electronics and Sensors', about: 'Learning, building, and exploring embedded technologies.', photo: 'Maanasha Ravichandran.png',
      socials: { github: 'https://github.com/MaanashaRavi', linkedin: 'https://www.linkedin.com/in/maanasha-ravichandran-92b1a7369', email: 'r.maanasha2007@gmail.com' }
    },
    {
      name: 'Reyvanth R V', role: 'Member', subdivision: 'EC & EE', speciality: 'Embedded Systems, RF & Antenna Design', about: 'ECE student passionate about embedded systems, RF engineering, and VLSI.', photo: 'Reyvanth R V.png',
      socials: { github: 'https://github.com/reyvanth28', linkedin: 'https://www.linkedin.com/in/reyvanth-rv-nov28', email: 'reyvanth2811@gmail.com' }
    },
    {
      name: 'Jhansi', role: 'Member', subdivision: 'EC & EE', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: '—' }
    },
    {
      name: 'Ashish', role: 'Member', subdivision: 'EC & EE', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: '—' }
    },
    {
      name: 'Haasini', role: 'Member', subdivision: 'EC & EE', speciality: 'Autonomous Systems', about: 'Passionate engineer working on developing autonomous systems.', photo: 'Sai Haasini Ravinuthala.png',
      socials: { github: 'https://github.com/SerenePirate', linkedin: 'https://www.linkedin.com/in/sai-haasini-ravinuthala-14b73130a', email: 'saihaasini.r@gmail.com' }
    },
    {
      name: 'Sri Lekha K', role: 'Member', subdivision: 'EC & EE', speciality: null, about: 'Engineer interested in embedded systems and robotics.', photo: 'default.png',
      socials: { github: 'https://github.com/SriLekha1306', linkedin: 'https://www.linkedin.com/in/sri-lekha-k-b87482379', email: 'lekha.kondapalli@gmail.com' }
    },
    {
      name: 'Nithilan RameshKumar', role: 'Member', subdivision: 'EC & EE', speciality: 'Jack of all trades, master of none', about: 'Kasane Teto forever.', photo: 'Nithilan Rameshkumar.png',
      socials: { github: 'https://github.com/nithitsuki', linkedin: 'https://www.linkedin.com/in/nithilanr', email: 'hi@nithitsuki.com' }
    },
  ],

  'CS and AI': [
    {
      name: 'C. Harshith Reddy', role: 'Member', subdivision: 'CS & AI', speciality: 'AI for Robotics', about: 'AI & Data Science student with a passion for robotics and autonomous systems.', photo: 'Harshith Reddy.png',
      socials: { github: 'https://github.com/Harshith-coder2606', linkedin: 'https://www.linkedin.com/in/harshith-reddy-a13b53329', email: 'harshithch.2606@gmail.com' }
    },
    {
      name: 'Satya Srinivas Paladugu', role: 'Member', subdivision: 'CS & AI', speciality: 'Deep Learning & Networking', about: 'Likes to create issues, then solve them. New to the team and excited to contribute.', photo: 'Satya Srinivas Paladugu.png',
      socials: { github: 'https://github.com/saltypal', linkedin: 'https://www.linkedin.com/in/satya-paladugu-38122a318', email: 'satyaspaladuguplus@gmail.com' }
    },
    {
      name: 'Manasvini Kandikonda', role: 'Member', subdivision: 'CS & AI', speciality: 'Brainstorming & Problem Solving', about: 'Loves a good mix of mathematics, computer science, economics, and robotics.', photo: 'Manasvini Kandikonda.png',
      socials: { github: 'https://github.com/vini-ai2', linkedin: 'https://www.linkedin.com/in/manasvini-kandikonda', email: 'officialvinik@gmail.com' }
    },
    // {
    //   name: 'Shaurya Pandey', role: 'Member', subdivision: 'CS & AI', speciality: null, about: null, photo: 'default.png',
    //   socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: 'shaurya@rovah.org' }
    // },
    {
      name: 'K Deepti', role: 'Member', subdivision: 'CS & AI', speciality: 'Automation & Code Deployment', about: 'Enthusiastic about collaborating, sharing ideas, and building great systems as a team.', photo: 'K Deepti.png',
      socials: { github: 'https://github.com/Deepti0611', linkedin: 'https://www.linkedin.com/in/deepti-k-64a536318', email: 'deepukannan2006@gmail.com' }
    },
    {
      name: 'G Akhileshwar Reddy', role: 'Member', subdivision: 'CS & AI', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com/Akhileshwar23', linkedin: 'https://www.linkedin.com/in/g-akhileshwar-reddy-b595b5368', email: 'gakhileshwarreddy23@gmail.com' }
    },
    {
      name: 'Chirayu Nilesh Chaudhari', role: 'Member', subdivision: 'CS & AI', speciality: 'Embedded Systems, IoT & AI/ML', about: 'Always open to exploring new projects and ideas.', photo: 'Chirayu Chaudhari.png',
      socials: { github: 'https://github.com/Champion2049', linkedin: 'https://www.linkedin.com/in/chirayu-chaudhari-086aa3314', email: 'me.chirayu.6@gmail.com' }
    },
    {
      name: 'Niyatee Santosh Gamre', role: 'Member', subdivision: 'CS & AI', speciality: null, about: 'Trying to do the most with four years of college.', photo: 'Niyatee Gamre.png',
      socials: { github: 'https://github.com/NiyateeG', linkedin: 'https://www.linkedin.com/in/niyatee-gamre-b83bb438a', email: 'niyatee.gamre@gmail.com' }
    },
    {
      name: 'Manya Kumar', role: 'Member', subdivision: 'CS & AI', speciality: 'AI & Software Development', about: 'Proficient in Java, Python, C, HTML, CSS, and JavaScript, with a strong interest in AI and problem-solving.', photo: 'Manya Kumar.jpeg',
      socials: { linkedin: 'https://www.linkedin.com/in/manya-kumar-6265643a3', email: 'manya.kumar0911@gmail.com' }
    },
  ],

  Media: [
    {
      name: 'Kokkalla Akshaya', role: 'Member', subdivision: 'Media', speciality: 'Multitasking', about: 'Committed to excellence through hard work, punctuality, and dedication.', photo: 'Akshaya Kokkalla.png',
      socials: { github: 'https://github.com/akshayakokkalla', linkedin: 'https://www.linkedin.com/in/akshaya-kokkalla-4a591b372', email: 'akshayakokkalla@gmail.com' }
    },
    {
      name: 'Janya Billa', role: 'Member', subdivision: 'Media', speciality: 'Design & Media', about: 'Design enthusiast with a passion for creativity and visual storytelling.', photo: 'Janya Billa.png',
      socials: { github: 'https://github.com/janya26', linkedin: 'https://www.linkedin.com/in/janya-billa-58418333b', email: 'janyabilla26@gmail.com' }
    },
  ],

  Science: [
    {
      name: 'Hanish', role: 'Member', subdivision: 'Science', speciality: 'System Design and Analysis', about: 'Curious to develop astrobiological expedition systems.', photo: 'default.png',
      socials: { linkedin: 'https://www.linkedin.com/in/hanish-valluru', email: 'hanishv247@gmail.com' }
    },
    {
      name: 'Roselina', role: 'Member', subdivision: 'Science', speciality: 'Problem Solving', about: 'Loves to learn and help solve real-world problems.', photo: 'Roselina Bibin.png',
      socials: { linkedin: 'https://www.linkedin.com/in/roselina-bibin-760b68372', email: 'roselinabibin@gmail.com' }
    },
    {
      name: 'Roshni', role: 'Member', subdivision: 'Science', speciality: null, about: 'Combining creativity with engineering to build practical and innovative solutions.', photo: 'default.png',
      socials: { linkedin: 'https://www.linkedin.com/in/roshni-a-6a6636424', email: 'roshni.anbazhagan@gmail.com' }
    },
    {
      name: 'H.S Tarun', role: 'Member', subdivision: 'Science', speciality: 'Payload Systems & Astrobiology', about: 'Spearheading autonomous scientific payload design, stoichiometric validation, and biosignature detection protocols.', photo: 'H S Tarun.png',
      socials: { github: 'https://github.com/itz-ur-boy-HST', linkedin: 'https://www.linkedin.com/in/h-s-tarun-766198369', email: 'hst3695@gmail.com' }
    },
    {
      name: 'Rtamanyu', role: 'Member', subdivision: 'Science', speciality: 'AI, DSA, C++, Python & ROS', about: 'An AI enthusiast with a broad pool of coding experience.', photo: 'Rtamanyu N J.png',
      socials: { github: 'https://github.com/God-Gamer-Manyu', linkedin: 'https://www.linkedin.com/in/rtamanyu-nadumuri-799b06316', email: 'rtamanyu@gmail.com' }
    },
    {
      name: 'Babitha', role: 'Member', subdivision: 'Science', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: '—' }
    },
    {
      name: 'G Akhileshwar Reddy', role: 'Member', subdivision: 'Science', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com/Akhileshwar23', linkedin: 'https://www.linkedin.com/in/g-akhileshwar-reddy-b595b5368', email: 'gakhileshwarreddy23@gmail.com' }
    },
    {
      name: 'Kalyani Deepu Narayanan', role: 'Member', subdivision: 'Science', speciality: 'Problem Solving & Adaptability', about: 'Enthusiastic about autonomous robots, intelligent systems, and space exploration.', photo: 'Kalyani Deepu Narayanan.png',
      socials: { github: 'https://github.com/kalyani090906', linkedin: 'https://www.linkedin.com/in/kalyani-deepu-narayanan', email: 'ndkalyani2006@gmail.com' }
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
      name: 'Shrivardhan', role: 'Administrative Lead', speciality: 'Adaptability', about: 'Always listening and learning.', photo: 'default.png',
      socials: { github: 'https://github.com/aardens', linkedin: 'https://www.linkedin.com/in/m-shrivardhan-9497ba203', email: 'shrivardhanmeda@gmail.com' }
    },
    {
      name: 'Ekansh', role: 'Technical Lead', speciality: 'CSE & Robotics', about: 'Engineering student curious about robotics and AI.', photo: 'Ekansh Khullar.png',
      socials: { github: 'https://github.com/Ekansh-K', linkedin: 'https://www.linkedin.com/in/ekansh-khullar-b0916a327', email: 'ekanshkhullar9@gmail.com' }
    },
    {
      // my pfp was rejected :(
      // We are soo back!
      name: 'Chaturya', role: 'Team Lead', subdivision: 'CS & AI', speciality: 'Ig bro', about: 'I do have a lot to say, just check csral.dev. Have a nice day!', photo: 'Chaturya.png',
      socials: { github: 'https://github.com/Csral', linkedin: 'https://www.linkedin.com/in/chaturya-reddy-247b01352/', email: 'me@csral.dev' }
    },
    {
      name: 'Lohitashwa Talamanchi', role: 'Team Lead', subdivision: 'Science', speciality: 'PCB Design', about: 'Electronics and Communication Engineer leading scientific payload development and embedded module integration.', photo: 'default.png',
      socials: { github: 'https://github.com/ashwa04', linkedin: 'https://www.linkedin.com/in/lohithashwa-talamanchi-51739b327', email: 'lohithashwa@gmail.com' }
    },
    {
      name: 'Prakhar', role: 'Team Lead', subdivision: 'EC & EE', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: '—' }
    },
    {
      name: 'M Nikhil', role: 'Team Lead', subdivision: 'Mechanical', speciality: 'Mechanical Design & Analysis', about: 'Integrating design, analysis, and manufacturing into one cohesive rover system.', photo: 'Nikhil M.png',
      socials: { linkedin: 'https://www.linkedin.com/in/nikhil-moddu-454501376', email: 'moddunikhil@gmail.com' }
    },
    {
      name: 'Pragathi L', role: 'Team Lead', subdivision: 'Media', speciality: null, about: null, photo: 'default.png',
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', email: '—' }
    },
  ],
  'Project Manager': [
    {
      name: 'Roydon Vilber Rodrigues', role: 'Project Manager', subdivision: 'Mechanical', speciality: 'AI & Intelligent Systems', about: 'Always eager to learn, build, and turn ideas into impactful solutions.', photo: 'Roydon Vilber Rodrigues.png',
      socials: { github: 'https://github.com/Royalty-Codes', linkedin: 'https://www.linkedin.com/in/roydon-rodrigues-4a768b34a', email: 'roydonvilber@gmail.com' }
    },
    {
      name: 'Naga Vaishnavi', role: 'Project Manager', subdivision: 'Mechanical', speciality: null, about: 'Balancing books, bots, and big ideas.', photo: 'Naga Vaishnavi.png',
      socials: { github: 'https://github.com/nagavaishnavi2417-dot', linkedin: 'https://www.linkedin.com/in/naga-vaishnavi-shrinivasan-564b00385', email: 'naga.vaishnavi2417@gmail.com' }
    },

    {
      name: 'Shainehaa VT', role: 'Project Manager', subdivision: 'EC & EE', speciality: 'ECE Project Management', about: 'A curious mind in robotics and AI, chasing ambitious ideas and learning every day.', photo: 'default.png',
      socials: { github: 'https://github.com/Shainehaa', linkedin: 'https://www.linkedin.com/in/shainehaa-vt', email: 'vt.shainehaa@gmail.com' }
    },
    {
      name: 'S.J. Yatish', role: 'Project Manager', subdivision: 'EC & EE', speciality: 'Decision Making', about: 'Coordinates every pit stop, deadline, and decision for a winning finish.', photo: 'S.J. Yatish.png',
      socials: { github: 'https://github.com/yatishsj-27', linkedin: 'https://www.linkedin.com/in/yatish-s-j', email: 'sjyatish27@gmail.com' }
    },

    {
      name: 'Gokul Krishna M', role: 'Project Manager', subdivision: 'CS & AI', speciality: 'AI & Autonomous Systems', about: 'AI and Data Science student coordinating the CS & AI subsystem for IRC 2027.', photo: 'default.png',
      socials: { github: 'https://github.com/GokulKrishna005', linkedin: 'https://www.linkedin.com/in/gokul-krishna-m-208300232', email: 'gokulkrishna.m2005.lap@gmail.com' }
    },
    {
      name: 'Jahnavi S', role: 'Project Manager', subdivision: 'CS & AI', speciality: 'Documentation, Development & Coordination', about: 'Overseeing project planning, team coordination, resource management, and competition preparation.', photo: 'Jahnavi S.png',
      socials: { github: 'https://github.com/JahnaviSatish', linkedin: 'https://www.linkedin.com/in/jahnavi-satish-3025b7420', email: 'jahnavisatish29@gmail.com' }
    },

    {
      name: 'Harshil Reddy', role: 'Project Manager', subdivision: 'Science', speciality: 'People & Teamwork', about: 'A fast and passionate learner.', photo: 'Harshil Reddy.png',
      socials: { github: 'https://github.com/harsxil', linkedin: 'https://www.linkedin.com/in/harshil-reddy-b67792333', email: 'harshilreddy2606@gmail.com' }
    },
    {
      name: 'Prithvi S', role: 'Project Manager', subdivision: 'Science', speciality: 'Adaptability', about: 'Obscure intellect enthusiast.', photo: 'PRITHVI S.png',
      socials: { github: 'https://github.com/prith-v2049', linkedin: 'https://www.linkedin.com/in/prithvi-s-351a7b359', email: 'prthvi.s.ramar1@gmail.com' }
    },

  ]
};

export default teamData;
