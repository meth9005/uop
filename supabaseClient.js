/**
 * Supabase Client & Unified Data Provider
 * English Teaching Unit (ETU) - Faculty of Engineering, University of Peradeniya
 */

const SUPABASE_URL = 'https://dbfnjoejntbxdnzixpls.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YjlyCxHROS4bddkt0T7A1A_PqkjBQEk';

let _supabaseClient = null;
if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
  try {
    _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.warn('Could not initialize Supabase client:', err);
  }
}

// Fallback curated dataset for groups, student rosters, showcase projects, and media moments
// Authentic media assets from University of Peradeniya Faculty of Engineering:
// - uopefac.jpg (Iconic Faculty of Engineering building & administrative grounds)
// - uope25.jpg (E/25 Engineering batch & technical workshop practicums)
// - uoplogo.png (Official English Teaching Unit & Faculty crest emblem)
// - AB01.jpeg (Engineering Language Fair opening event)
// - AB01.1.jpeg (Oral presentations on structural integrity)
const FALLBACK_DATA = {
  groups: [
    {
      id: '1503c47d-4112-4067-9861-abd40b5e4cec',
      name: 'Group AB01',
      slug: 'ab01',
      tagline: 'Pioneers in collaborative storytelling and visual media',
      description: 'Group AB01 focuses on innovative forms of communication, bridging technical engineering concepts with creative media, interactive drama, and visual documentation.',
      coverImage: 'AB01.jpeg',
      cardImage: 'AB01.jpeg',
      students: [
        { id: 'st_ab01_1', regNo: 'E/25/---', name: 'Methnal Liyanage', committee: 'Committee responsibillities', role: 'Group Leader' }
      ]
    },
    {
      id: 'cfc2c7ca-cbef-4fb2-95bf-d8ef020f3b00',
      name: 'Group AB02',
      slug: 'ab02',
      tagline: 'Exploring documentary arts and engineering narratives',
      description: 'Group AB02 specializes in documentary filmmaking, community research, and exploring societal impacts of modern engineering through in-depth investigative interviews.',
      coverImage: 'uopefac.jpg',
      cardImage: 'uopefac.jpg',
      students: [
        { id: 'st_ab02_1', regNo: 'E/25/022', name: 'Dinuka Senanayake', committee: 'Direction & Research', role: 'Group Leader' },
        { id: 'st_ab02_2', regNo: 'E/25/056', name: 'Anjana Silva', committee: 'Field Scriptwriting', role: 'Sub-Leader' },
        { id: 'st_ab02_3', regNo: 'E/25/091', name: 'Sachini Bandara', committee: 'Audio Engineering', role: 'Audio Specialist' },
        { id: 'st_ab02_4', regNo: 'E/25/133', name: 'Isuru Rathnayake', committee: 'Post-Production', role: 'Editor' },
        { id: 'st_ab02_5', regNo: 'E/25/167', name: 'Praveen Dias', committee: 'Public Outreach', role: 'Narrator' }
      ]
    },
    {
      id: 'cc25151a-d7ea-4b96-9e50-a2bccde4b4c1',
      name: 'Group AB03',
      slug: 'ab03',
      tagline: 'Creative presentations bridging language and technology',
      description: 'Group AB03 masters rhetorical eloquence, slide design, and persuasive technical speech, demonstrating how complex engineering concepts can be explained with clarity.',
      coverImage: 'uope25.jpg',
      cardImage: 'uope25.jpg',
      students: [
        { id: 'st_ab03_1', regNo: 'E/25/019', name: 'Hiran Jayasundara', committee: 'Speech & Rhetoric', role: 'Group Leader' },
        { id: 'st_ab03_2', regNo: 'E/25/048', name: 'Malithi Weerakkody', committee: 'Slide Architecture', role: 'Sub-Leader' },
        { id: 'st_ab03_3', regNo: 'E/25/088', name: 'Chamath Weerasinghe', committee: 'Data Visualization', role: 'Analyst' },
        { id: 'st_ab03_4', regNo: 'E/25/124', name: 'Nethmi Karunaratne', committee: 'Technical Speech', role: 'Presenter' },
        { id: 'st_ab03_5', regNo: 'E/25/159', name: 'Kusal Gunasekara', committee: 'Stage & Logistics', role: 'Coordinator' }
      ]
    },
    {
      id: '2eccdc5e-9f04-4639-98dc-97f2e33a724e',
      name: 'Group AB04',
      slug: 'ab04',
      tagline: 'Artistic expression through multimedia and gallery work',
      description: 'Group AB04 fuses engineering schematics, botanical sketches, and multimedia aesthetics into compelling visual art series that communicate engineering elegance.',
      coverImage: 'uopefac.jpg',
      cardImage: 'uopefac.jpg',
      students: [
        { id: 'st_ab04_1', regNo: 'E/25/007', name: 'Dulani Alahakoon', committee: 'Visual Fine Arts', role: 'Group Leader' },
        { id: 'st_ab04_2', regNo: 'E/25/042', name: 'Ravindu Dissanayake', committee: 'Digital Illustration', role: 'Sub-Leader' },
        { id: 'st_ab04_3', regNo: 'E/25/083', name: 'Oshada Herath', committee: 'Exhibition Curation', role: 'Curator' },
        { id: 'st_ab04_4', regNo: 'E/25/119', name: 'Rashmi Samarasinghe', committee: 'Mixed Media', role: 'Artist' },
        { id: 'st_ab04_5', regNo: 'E/25/161', name: 'Akalanka Mendis', committee: 'Photography & Lighting', role: 'Photographer' }
      ]
    }
  ],

  projects: [
    // AB01 Projects
    {
      id: 'p1',
      groupSlug: 'ab01',
      groupName: 'Group AB01',
      category: 'Group Activities',
      filterCategory: 'group-activities',
      icon: '🎭',
      title: 'Engineering Language Fair 2024',
      description: 'A vibrant group activity showcasing language skills through engineering themes, interactive games, and communication stalls.',
      youtubeUrl: 'https://www.youtube.com/embed/bEIa9mjhJvI?si=luDoyookJfwMPeQ3',
      imageUrl: 'AB01.jpeg',
      images: ['AB01.jpeg', 'AB01.1.jpeg', 'uopefac.jpg'],
      isVideo: true,
      time: '14:20'
    },
    {
      id: 'p2',
      groupSlug: 'ab01',
      groupName: 'Group AB01',
      category: 'Presentations',
      filterCategory: 'presentations',
      icon: '📊',
      title: 'Structural Integrity: An Oral Report',
      description: 'Students present findings on eco-friendly building materials and structural analysis using professional technical English.',
      youtubeUrl: null,
      imageUrl: 'AB01.1.jpeg',
      images: ['AB01.1.jpeg', 'AB01.jpeg'],
      isVideo: false,
      time: '08:20'
    },
    {
      id: 'p3',
      groupSlug: 'ab01',
      groupName: 'Group AB01',
      category: 'Documentaries',
      filterCategory: 'documentaries',
      icon: '🎬',
      title: "Campus Life: An Engineer's Story",
      description: 'A short documentary exploring the daily rhythm, resilience, and fellowship of first-year engineering students at Peradeniya.',
      youtubeUrl: null,
      imageUrl: 'uopefac.jpg',
      images: ['uopefac.jpg', 'uope25.jpg'],
      isVideo: true,
      time: '15:02'
    },
    {
      id: 'p4',
      groupSlug: 'ab01',
      groupName: 'Group AB01',
      category: 'Art & Explorer',
      filterCategory: 'art-explorer',
      icon: '🎨',
      title: 'Structures & Strokes',
      description: 'An art series inspired by civil engineering blueprints merged with the scenic greenery of the Peradeniya valley.',
      youtubeUrl: null,
      imageUrl: 'uope25.jpg',
      images: ['uope25.jpg', 'uopefac.jpg'],
      isVideo: false
    },

    // AB02 Projects
    {
      id: 'p5',
      groupSlug: 'ab02',
      groupName: 'Group AB02',
      category: 'Group Activities',
      filterCategory: 'group-activities',
      icon: '🎭',
      title: 'Inter-Group Debate: Technology & Society',
      description: 'A structured Oxford-style debate challenging the ethical limits of automated engineering systems in developing economies.',
      youtubeUrl: null,
      imageUrl: 'uopefac.jpg',
      images: ['uopefac.jpg', 'uope25.jpg'],
      isVideo: false
    },
    {
      id: 'p6',
      groupSlug: 'ab02',
      groupName: 'Group AB02',
      category: 'Presentations',
      filterCategory: 'presentations',
      icon: '📊',
      title: 'Renewable Energy: Speaking Up',
      description: 'Group AB02 presents their investigative study on decentralized solar grids across Central Province villages.',
      youtubeUrl: null,
      imageUrl: 'uope25.jpg',
      images: ['uope25.jpg', 'uopefac.jpg'],
      isVideo: true,
      time: '10:45'
    },
    {
      id: 'p7',
      groupSlug: 'ab02',
      groupName: 'Group AB02',
      category: 'Documentaries',
      filterCategory: 'documentaries',
      icon: '🎬',
      title: 'The Making of an Engineer',
      description: 'Following three undergraduates across their workshop practicums, exam weeks, and cultural festivals.',
      youtubeUrl: null,
      imageUrl: 'uopefac.jpg',
      images: ['uopefac.jpg', 'uope25.jpg'],
      isVideo: true,
      time: '18:30'
    },
    {
      id: 'p8',
      groupSlug: 'ab02',
      groupName: 'Group AB02',
      category: 'Art & Explorer',
      filterCategory: 'art-explorer',
      icon: '🎨',
      title: 'Circuit Paintings & Ink',
      description: 'Mixed-media fine art combining printed circuit board (PCB) traces with traditional Sri Lankan motifs.',
      youtubeUrl: null,
      imageUrl: 'uope25.jpg',
      images: ['uope25.jpg', 'uopefac.jpg'],
      isVideo: false
    },

    // AB03 Projects
    {
      id: 'p9',
      groupSlug: 'ab03',
      groupName: 'Group AB03',
      category: 'Group Activities',
      filterCategory: 'group-activities',
      icon: '🎭',
      title: 'Interactive Technical Drama',
      description: 'A theatrical performance highlighting workshop safety protocols written, directed, and acted entirely in English.',
      youtubeUrl: null,
      imageUrl: 'uope25.jpg',
      images: ['uope25.jpg', 'uopefac.jpg'],
      isVideo: false
    },
    {
      id: 'p10',
      groupSlug: 'ab03',
      groupName: 'Group AB03',
      category: 'Presentations',
      filterCategory: 'presentations',
      icon: '📊',
      title: 'AI and the Future of Communication',
      description: 'A visionary presentation analyzing how generative language tools assist bilingual engineering students.',
      youtubeUrl: null,
      imageUrl: 'uopefac.jpg',
      images: ['uopefac.jpg', 'uope25.jpg'],
      isVideo: true,
      time: '14:12'
    },
    {
      id: 'p11',
      groupSlug: 'ab03',
      groupName: 'Group AB03',
      category: 'Documentaries',
      filterCategory: 'documentaries',
      icon: '🎬',
      title: 'Green Concrete Innovations',
      description: 'A research documentary on civil engineering concrete alternatives tested in the faculty materials lab.',
      youtubeUrl: null,
      imageUrl: 'uope25.jpg',
      images: ['uope25.jpg', 'uopefac.jpg'],
      isVideo: true,
      time: '11:05'
    },
    {
      id: 'p12',
      groupSlug: 'ab03',
      groupName: 'Group AB03',
      category: 'Art & Explorer',
      filterCategory: 'art-explorer',
      icon: '🎨',
      title: 'Typography in Engineering Design',
      description: 'An exploration of technical lettering, font hierarchy, and readability in scientific documentation.',
      youtubeUrl: null,
      imageUrl: 'uopefac.jpg',
      images: ['uopefac.jpg', 'uope25.jpg'],
      isVideo: false
    },

    // AB04 Projects
    {
      id: 'p13',
      groupSlug: 'ab04',
      groupName: 'Group AB04',
      category: 'Group Activities',
      filterCategory: 'group-activities',
      icon: '🎭',
      title: 'Soundscapes of Engineering',
      description: 'An auditory and theatrical journey capturing workshop machinery, lecture halls, and monsoon rain on faculty roofs.',
      youtubeUrl: null,
      imageUrl: 'uopefac.jpg',
      images: ['uopefac.jpg', 'uope25.jpg'],
      isVideo: false
    },
    {
      id: 'p14',
      groupSlug: 'ab04',
      groupName: 'Group AB04',
      category: 'Presentations',
      filterCategory: 'presentations',
      icon: '📊',
      title: 'Design Manifesto: Clean Aesthetics',
      description: 'Group AB04 outlines principles for minimalist, human-centric design in civil and mechanical engineering.',
      youtubeUrl: null,
      imageUrl: 'uope25.jpg',
      images: ['uope25.jpg', 'uopefac.jpg'],
      isVideo: true,
      time: '09:15'
    },
    {
      id: 'p15',
      groupSlug: 'ab04',
      groupName: 'Group AB04',
      category: 'Documentaries',
      filterCategory: 'documentaries',
      icon: '🎬',
      title: 'Voices of Innovation',
      description: 'Behind the scenes with first-year engineers testing prototype electric vehicles in the faculty workshop.',
      youtubeUrl: null,
      imageUrl: 'uopefac.jpg',
      images: ['uopefac.jpg', 'uope25.jpg'],
      isVideo: true,
      time: '13:40'
    },
    {
      id: 'p16',
      groupSlug: 'ab04',
      groupName: 'Group AB04',
      category: 'Art & Explorer',
      filterCategory: 'art-explorer',
      icon: '🎨',
      title: 'Botanical Tech Sketches',
      description: 'Botanical drawings of campus trees intertwined with precision mechanical gears and draftsmanship.',
      youtubeUrl: null,
      imageUrl: 'uope25.jpg',
      images: ['uope25.jpg', 'uopefac.jpg'],
      isVideo: false
    }
  ],

  media: {
    ab01: [
      {
        url: 'AB01.jpeg',
        fullUrl: 'AB01.jpeg',
        activity: '🎭 Group Activities',
        title: 'Engineering Language Fair 2024 - Opening Stage Event',
        badge: 'AB01',
        height: 'h-52'
      },
      {
        url: 'AB01.1.jpeg',
        fullUrl: 'AB01.1.jpeg',
        activity: '📊 Presentations',
        title: 'Team Discussion on Structural Integrity Presentation',
        badge: 'AB01',
        height: 'h-72'
      },
      {
        url: 'uopefac.jpg',
        fullUrl: 'uopefac.jpg',
        activity: '🎬 Documentaries',
        title: 'Campus Life & Faculty Landmark Documentary Shoot',
        badge: 'AB01',
        height: 'h-64'
      },
      {
        url: 'uope25.jpg',
        fullUrl: 'uope25.jpg',
        activity: '🎨 Art & Explorer',
        title: 'Structures & Strokes - Artwork & Drafting Session',
        badge: 'AB01',
        height: 'h-56'
      },
      {
        url: 'AB01.jpeg',
        fullUrl: 'AB01.jpeg',
        activity: '🎭 Group Activities',
        title: 'Faculty Auditorium Gathering - UoP',
        badge: 'AB01',
        height: 'h-52'
      },
      {
        url: 'AB01.1.jpeg',
        fullUrl: 'AB01.1.jpeg',
        activity: '📊 Presentations',
        title: 'Field Observations Technical Presentation Preparation',
        badge: 'AB01',
        height: 'h-60'
      },
      {
        url: 'uopefac.jpg',
        fullUrl: 'uopefac.jpg',
        activity: '🎬 Documentaries',
        title: 'Iconic Faculty Building & Grounds View',
        badge: 'AB01',
        height: 'h-56'
      },
      {
        url: 'uope25.jpg',
        fullUrl: 'uope25.jpg',
        activity: '🎨 Art & Explorer',
        title: 'E/25 Batch Practicum & Media Documentation',
        badge: 'AB01',
        height: 'h-64'
      }
    ],
    ab02: [
      {
        url: 'uopefac.jpg',
        fullUrl: 'uopefac.jpg',
        activity: '🎬 Documentaries',
        title: 'Faculty Grounds Field Interviews & Filming',
        badge: 'AB02',
        height: 'h-60'
      },
      {
        url: 'uope25.jpg',
        fullUrl: 'uope25.jpg',
        activity: '🎬 Documentaries',
        title: 'Audio Recording & Workshop Narrations',
        badge: 'AB02',
        height: 'h-64'
      },
      {
        url: 'AB01.jpeg',
        fullUrl: 'AB01.jpeg',
        activity: '🎭 Group Activities',
        title: 'Inter-Group Technology Debate Team Practice',
        badge: 'AB02',
        height: 'h-52'
      },
      {
        url: 'uopefac.jpg',
        fullUrl: 'uopefac.jpg',
        activity: '📊 Presentations',
        title: 'Renewable Energy Field Survey Data Review',
        badge: 'AB02',
        height: 'h-72'
      },
      {
        url: 'uope25.jpg',
        fullUrl: 'uope25.jpg',
        activity: '🎬 Documentaries',
        title: 'Workshop Practicum Documentary B-Roll',
        badge: 'AB02',
        height: 'h-56'
      },
      {
        url: 'AB01.1.jpeg',
        fullUrl: 'AB01.1.jpeg',
        activity: '🎭 Group Activities',
        title: 'Cohort Brainstorming on Societal Impact',
        badge: 'AB02',
        height: 'h-52'
      },
      {
        url: 'uopefac.jpg',
        fullUrl: 'uopefac.jpg',
        activity: '🎨 Art & Explorer',
        title: 'Circuit Art Inking & Blueprint Sketching',
        badge: 'AB02',
        height: 'h-64'
      },
      {
        url: 'uope25.jpg',
        fullUrl: 'uope25.jpg',
        activity: '📊 Presentations',
        title: 'Team Presentation Dry Run in Engineering Hall',
        badge: 'AB02',
        height: 'h-56'
      }
    ],
    ab03: [
      {
        url: 'uope25.jpg',
        fullUrl: 'uope25.jpg',
        activity: '📊 Presentations',
        title: 'Keynote Speech Delivery at E.O.E. Pereira Theatre',
        badge: 'AB03',
        height: 'h-64'
      },
      {
        url: 'uopefac.jpg',
        fullUrl: 'uopefac.jpg',
        activity: '📊 Presentations',
        title: 'Slide Architecture & Typography Workshop',
        badge: 'AB03',
        height: 'h-52'
      },
      {
        url: 'AB01.1.jpeg',
        fullUrl: 'AB01.1.jpeg',
        activity: '📊 Presentations',
        title: 'AI & Language Model Demonstration on Stage',
        badge: 'AB03',
        height: 'h-72'
      },
      {
        url: 'AB01.jpeg',
        fullUrl: 'AB01.jpeg',
        activity: '🎭 Group Activities',
        title: 'Interactive Technical Drama Safety Showcase',
        badge: 'AB03',
        height: 'h-56'
      },
      {
        url: 'uopefac.jpg',
        fullUrl: 'uopefac.jpg',
        activity: '🎬 Documentaries',
        title: 'Green Concrete Lab Research Documentary',
        badge: 'AB03',
        height: 'h-60'
      },
      {
        url: 'uope25.jpg',
        fullUrl: 'uope25.jpg',
        activity: '📊 Presentations',
        title: 'Rhetoric & Public Speaking Mentorship Circle',
        badge: 'AB03',
        height: 'h-52'
      },
      {
        url: 'uopefac.jpg',
        fullUrl: 'uopefac.jpg',
        activity: '🎨 Art & Explorer',
        title: 'Infographic Poster Exhibition Hall',
        badge: 'AB03',
        height: 'h-64'
      },
      {
        url: 'AB01.jpeg',
        fullUrl: 'AB01.jpeg',
        activity: '🎭 Group Activities',
        title: 'Debate Award & Certificate Ceremony',
        badge: 'AB03',
        height: 'h-56'
      }
    ],
    ab04: [
      {
        url: 'uopefac.jpg',
        fullUrl: 'uopefac.jpg',
        activity: '🎨 Art & Explorer',
        title: 'Architectural Blueprint & Botanical Sketching',
        badge: 'AB04',
        height: 'h-64'
      },
      {
        url: 'uope25.jpg',
        fullUrl: 'uope25.jpg',
        activity: '🎨 Art & Explorer',
        title: 'Watercolor Wash of Faculty Arches',
        badge: 'AB04',
        height: 'h-52'
      },
      {
        url: 'AB01.jpeg',
        fullUrl: 'AB01.jpeg',
        activity: '🎭 Group Activities',
        title: 'Soundscapes of Engineering Multi-Sensory Stall',
        badge: 'AB04',
        height: 'h-72'
      },
      {
        url: 'uopefac.jpg',
        fullUrl: 'uopefac.jpg',
        activity: '🎬 Documentaries',
        title: 'Voices of Innovation EV Prototype Filming',
        badge: 'AB04',
        height: 'h-56'
      },
      {
        url: 'uope25.jpg',
        fullUrl: 'uope25.jpg',
        activity: '🎨 Art & Explorer',
        title: 'Botanical Tech Mixed-Media Sketching',
        badge: 'AB04',
        height: 'h-60'
      },
      {
        url: 'AB01.1.jpeg',
        fullUrl: 'AB01.1.jpeg',
        activity: '📊 Presentations',
        title: 'Design Manifesto: Clean Aesthetics Presentation',
        badge: 'AB04',
        height: 'h-52'
      },
      {
        url: 'uopefac.jpg',
        fullUrl: 'uopefac.jpg',
        activity: '🎨 Art & Explorer',
        title: 'Annual Exhibition Gallery Opening Reception',
        badge: 'AB04',
        height: 'h-64'
      },
      {
        url: 'uope25.jpg',
        fullUrl: 'uope25.jpg',
        activity: '🎨 Art & Explorer',
        title: 'Sculptural Installation in Civil Engineering Dept',
        badge: 'AB04',
        height: 'h-56'
      }
    ]
  }
};

// Data service methods exposed globally
window.ETUDataService = {
  getSupabaseClient() {
    return _supabaseClient;
  },

  // Client-side image compressor & optimizer: converts File into crisp WebP/JPEG data URL (~80-150KB)
  async optimizeImageFile(file, maxWidth = 1280, quality = 0.85) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type || !file.type.startsWith('image/')) {
        return reject(new Error('Selected file is not an image'));
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          let dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl || !dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(dataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  // Batch optimizer for multiple image files
  async optimizeImageFiles(files, maxWidth = 1280, quality = 0.85) {
    const list = Array.from(files || []);
    const results = [];
    for (const file of list) {
      const dataUrl = await this.optimizeImageFile(file, maxWidth, quality);
      results.push(dataUrl);
    }
    return results;
  },

  // Helper to format YouTube URLs into standard embed URLs
  formatYouTubeEmbed(url) {
    if (!url) return null;
    const cleanUrl = url.trim();
    if (cleanUrl.includes('/embed/')) return cleanUrl;
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = cleanUrl.match(regExp);
      if (match && match[2] && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    } catch (e) {}
    return cleanUrl;
  },

  // Get local custom items from localStorage
  _getLocalCustoms(key) {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      const raw = localStorage.getItem('ETU_' + key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  _saveLocalCustoms(key, items) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem('ETU_' + key, JSON.stringify(items));
    } catch (e) {}
  },

  async getGroups() {
    let groups = [...FALLBACK_DATA.groups];

    if (_supabaseClient) {
      try {
        const { data, error } = await _supabaseClient.from('groups').select('*').order('name');
        if (!error && data && data.length > 0) {
          // Merge Supabase groups with fallback metadata
          groups = data.map(g => {
            const fb = FALLBACK_DATA.groups.find(f => f.slug.toLowerCase() === g.slug.toLowerCase());
            return {
              id: g.id,
              name: g.name,
              slug: g.slug.toLowerCase(),
              tagline: fb ? fb.tagline : `${g.name} Student Cohort`,
              description: fb ? fb.description : 'Engineering English and Technical Communication Cohort at University of Peradeniya.',
              coverImage: fb ? fb.coverImage : 'uopefac.jpg',
              cardImage: fb ? fb.cardImage : 'uopefac.jpg',
              students: fb ? fb.students : []
            };
          });
        }
      } catch (e) {
        console.warn('Falling back to local groups data:', e);
      }
    }

    // Merge any locally created groups
    const localGroups = this._getLocalCustoms('GROUPS');
    localGroups.forEach(lg => {
      const existingIdx = groups.findIndex(g => g.slug === lg.slug);
      if (existingIdx !== -1) {
        groups[existingIdx] = { ...groups[existingIdx], ...lg };
      } else {
        groups.push(lg);
      }
    });

    return groups;
  },

  async getGroupDetails(slug) {
    const cleanSlug = (slug || 'ab01').toLowerCase();
    const allGroups = await this.getGroups();
    const group = allGroups.find(g => g.slug.toLowerCase() === cleanSlug) || allGroups[0];
    const fallbackGroup = FALLBACK_DATA.groups.find(g => g.slug.toLowerCase() === cleanSlug) || FALLBACK_DATA.groups[0];

    // 1. Fetch Students (Members)
    let students = [...(fallbackGroup.students || [])];
    if (_supabaseClient && group.id) {
      try {
        const { data: memberRows, error: memberErr } = await _supabaseClient
          .from('members')
          .select('*')
          .eq('group_id', group.id)
          .order('created_at', { ascending: false });

        if (!memberErr && memberRows && memberRows.length > 0) {
          students = memberRows.map(m => ({
            id: m.id,
            regNo: m.reg_no || 'E/25/---',
            name: m.name,
            committee: m.committee || 'Committee responsibilities',
            role: m.role || 'Student'
          }));
        }
      } catch (e) {
        console.warn('Falling back to local students:', e);
      }
    }

    // Append locally added custom students for this group
    const localStudents = this._getLocalCustoms('STUDENTS_' + cleanSlug);
    localStudents.forEach(st => {
      if (!students.some(s => s.id === st.id)) {
        students.unshift(st);
      }
    });

    // 2. Fetch Projects
    const groupProjects = await this.getProjectsByGroup(group.slug, group.id);

    // 3. Fetch Media Gallery
    const media = this.getGroupMedia(cleanSlug);

    return {
      group: {
        ...fallbackGroup,
        ...group
      },
      students,
      projects: groupProjects,
      media
    };
  },

  getGroupMedia(slug) {
    const cleanSlug = (slug || 'ab01').toLowerCase();
    const fallbackMedia = FALLBACK_DATA.media[cleanSlug] || FALLBACK_DATA.media['ab01'] || [];
    const localMedia = this._getLocalCustoms('MEDIA_' + cleanSlug);
    return [...localMedia, ...fallbackMedia];
  },

  addGroupMedia(slug, mediaItem) {
    const cleanSlug = (slug || 'ab01').toLowerCase();
    const newMedia = {
      url: mediaItem.url || 'uopefac.jpg',
      fullUrl: mediaItem.fullUrl || mediaItem.url || 'uopefac.jpg',
      activity: mediaItem.activity || '📸 Group Moments',
      title: mediaItem.title || 'Cohort Photo Moment',
      badge: mediaItem.badge || cleanSlug.toUpperCase(),
      height: mediaItem.height || 'h-60'
    };
    const localMedia = this._getLocalCustoms('MEDIA_' + cleanSlug);
    localMedia.unshift(newMedia);
    this._saveLocalCustoms('MEDIA_' + cleanSlug, localMedia);
    return newMedia;
  },

  async getProjectsByGroup(slug, groupId = null) {
    const cleanSlug = (slug || 'ab01').toLowerCase();
    let groupProjects = FALLBACK_DATA.projects.filter(p => p.groupSlug.toLowerCase() === cleanSlug);

    if (_supabaseClient) {
      try {
        let query = _supabaseClient.from('projects').select('*, groups(name, slug)').order('created_at', { ascending: false });
        if (groupId) {
          query = query.eq('group_id', groupId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const filtered = data.filter(p => (p.groups && p.groups.slug.toLowerCase() === cleanSlug) || (groupId && p.group_id === groupId));
          if (filtered.length > 0) {
            groupProjects = filtered.map(p => {
              const projectImages = (Array.isArray(p.images) && p.images.length > 0)
                ? p.images
                : (p.file_url || p.image_url ? [p.file_url || p.image_url] : ['uopefac.jpg']);
              return {
                id: p.id,
                groupSlug: cleanSlug,
                groupName: p.groups ? p.groups.name : `Group ${cleanSlug.toUpperCase()}`,
                category: p.category || 'Group Activities',
                filterCategory: (p.category || 'group-activities').toLowerCase().replace(/[^a-z0-9]/g, '-'),
                title: p.title,
                description: p.description || '',
                youtubeUrl: this.formatYouTubeEmbed(p.youtube_url || p.youtubeUrl),
                imageUrl: projectImages[0],
                images: projectImages,
                isVideo: !!(p.youtube_url || p.youtubeUrl)
              };
            });
          }
        }
      } catch (e) {
        console.warn('Falling back to local group projects:', e);
      }
    }

    // Merge any locally added/modified projects for this group (local takes precedence)
    const localProjects = this._getLocalCustoms('PROJECTS_' + cleanSlug);
    localProjects.forEach(lp => {
      const idx = groupProjects.findIndex(p => p.id === lp.id);
      if (idx !== -1) {
        groupProjects[idx] = { ...groupProjects[idx], ...lp };
      } else {
        groupProjects.unshift(lp);
      }
    });

    return groupProjects;
  },

  async getAllProjects() {
    let allProjects = [...FALLBACK_DATA.projects];

    if (_supabaseClient) {
      try {
        const { data, error } = await _supabaseClient
          .from('projects')
          .select('*, groups(name, slug)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          allProjects = data.map(p => {
            const projectImages = (Array.isArray(p.images) && p.images.length > 0)
              ? p.images
              : (p.file_url || p.image_url ? [p.file_url || p.image_url] : ['uopefac.jpg']);
            return {
              id: p.id,
              groupSlug: p.groups ? p.groups.slug : 'ab01',
              groupName: p.groups ? p.groups.name : 'Group',
              category: p.category || 'Group Activities',
              filterCategory: (p.category || 'group-activities').toLowerCase().replace(/[^a-z0-9]/g, '-'),
              title: p.title,
              description: p.description || '',
              youtubeUrl: this.formatYouTubeEmbed(p.youtube_url || p.youtubeUrl),
              imageUrl: projectImages[0],
              images: projectImages,
              isVideo: !!(p.youtube_url || p.youtubeUrl)
            };
          });
        }
      } catch (e) {
        console.warn('Falling back to local all projects:', e);
      }
    }

    // Merge custom local projects across all known groups
    const allGroups = await this.getGroups();
    const groupSlugs = Array.from(new Set(['ab01', 'ab02', 'ab03', 'ab04', ...allGroups.map(g => g.slug)]));
    groupSlugs.forEach(slug => {
      const localProjects = this._getLocalCustoms('PROJECTS_' + slug);
      localProjects.forEach(lp => {
        const idx = allProjects.findIndex(p => p.id === lp.id);
        if (idx !== -1) {
          allProjects[idx] = { ...allProjects[idx], ...lp };
        } else {
          allProjects.unshift(lp);
        }
      });
    });

    return allProjects;
  },

  async getLatestProjects(limit = 3) {
    const all = await this.getAllProjects();
    return all.slice(0, limit);
  },

  // --------------------------------------------------------------------------
  // CONTENT MANAGEMENT / CRUD OPERATIONS
  // --------------------------------------------------------------------------

  // Add Student to Group
  async addStudent({ groupId, slug, name, regNo, committee, role }) {
    const cleanSlug = (slug || 'ab01').toLowerCase();
    let newStudent = {
      id: 'st_' + Date.now(),
      group_id: groupId,
      name: name.trim(),
      regNo: (regNo || 'E/25/---').trim(),
      committee: (committee || 'Committee responsibilities').trim(),
      role: (role || 'Member').trim()
    };

    if (_supabaseClient && groupId) {
      try {
        const { data, error } = await _supabaseClient
          .from('members')
          .insert([{
            group_id: groupId,
            name: newStudent.name,
            reg_no: newStudent.regNo,
            committee: newStudent.committee,
            role: newStudent.role
          }])
          .select();

        if (!error && data && data.length > 0) {
          newStudent.id = data[0].id;
        }
      } catch (err) {
        console.warn('Could not insert student to Supabase:', err);
      }
    }

    // Save to local cache
    const existing = this._getLocalCustoms('STUDENTS_' + cleanSlug);
    existing.unshift(newStudent);
    this._saveLocalCustoms('STUDENTS_' + cleanSlug, existing);

    return newStudent;
  },

  // Delete Student
  async deleteStudent(studentId, slug) {
    const cleanSlug = (slug || 'ab01').toLowerCase();
    if (_supabaseClient && studentId && !studentId.startsWith('st_')) {
      try {
        await _supabaseClient.from('members').delete().eq('id', studentId);
      } catch (err) {
        console.warn('Could not delete student from Supabase:', err);
      }
    }

    const existing = this._getLocalCustoms('STUDENTS_' + cleanSlug);
    const updated = existing.filter(s => s.id !== studentId);
    this._saveLocalCustoms('STUDENTS_' + cleanSlug, updated);
    return true;
  },

  // Add Project to Group (supports single or multiple images)
  async addProject({ groupId, slug, title, category, fileUrl, images, youtubeUrl, description }) {
    const cleanSlug = (slug || 'ab01').toLowerCase();
    const formattedYoutube = this.formatYouTubeEmbed(youtubeUrl);
    
    // Resolve multiple images list
    let projectImages = [];
    if (Array.isArray(images) && images.length > 0) {
      projectImages = images;
    } else if (fileUrl && fileUrl.trim()) {
      projectImages = [fileUrl.trim()];
    } else {
      projectImages = ['uopefac.jpg'];
    }
    const primaryImage = projectImages[0];

    let newProject = {
      id: 'p_' + Date.now(),
      groupSlug: cleanSlug,
      groupName: `Group ${cleanSlug.toUpperCase()}`,
      title: title.trim(),
      category: category || 'Group Activities',
      filterCategory: (category || 'group-activities').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      imageUrl: primaryImage,
      images: projectImages,
      youtubeUrl: formattedYoutube,
      description: description ? description.trim() : 'A student showcase project.',
      isVideo: !!formattedYoutube
    };

    if (_supabaseClient && groupId) {
      try {
        const { data, error } = await _supabaseClient
          .from('projects')
          .insert([{
            group_id: groupId,
            title: newProject.title,
            category: newProject.category,
            file_url: primaryImage,
            youtube_url: formattedYoutube
          }])
          .select();

        if (!error && data && data.length > 0) {
          newProject.id = data[0].id;
        }
      } catch (err) {
        console.warn('Could not insert project to Supabase:', err);
      }
    }

    const existing = this._getLocalCustoms('PROJECTS_' + cleanSlug);
    existing.unshift(newProject);
    this._saveLocalCustoms('PROJECTS_' + cleanSlug, existing);

    return newProject;
  },

  // Delete Project
  async deleteProject(projectId, slug) {
    const cleanSlug = (slug || 'ab01').toLowerCase();
    if (_supabaseClient && projectId && !projectId.startsWith('p_')) {
      try {
        await _supabaseClient.from('projects').delete().eq('id', projectId);
      } catch (err) {
        console.warn('Could not delete project from Supabase:', err);
      }
    }

    const existing = this._getLocalCustoms('PROJECTS_' + cleanSlug);
    const updated = existing.filter(p => p.id !== projectId);
    this._saveLocalCustoms('PROJECTS_' + cleanSlug, updated);
    return true;
  },

  // Update Group Info (tagline, description, cover)
  async updateGroupInfo({ groupId, slug, tagline, description, coverImage }) {
    const cleanSlug = (slug || 'ab01').toLowerCase();
    const existingGroups = await this.getGroups();
    const group = existingGroups.find(g => g.slug === cleanSlug);
    if (!group) return null;

    if (tagline !== undefined && tagline !== null) group.tagline = tagline.trim();
    if (description !== undefined && description !== null) group.description = description.trim();
    if (coverImage !== undefined && coverImage !== null && coverImage.trim()) {
      group.coverImage = coverImage.trim();
      group.cardImage = coverImage.trim();
    }

    if (_supabaseClient && (groupId || group.id)) {
      try {
        const targetId = groupId || group.id;
        if (!targetId.startsWith('grp_')) {
          await _supabaseClient
            .from('groups')
            .update({ name: group.name })
            .eq('id', targetId);
        }
      } catch (e) {
        console.warn('Could not update Supabase group:', e);
      }
    }

    const localGroups = this._getLocalCustoms('GROUPS');
    const idx = localGroups.findIndex(g => g.slug === cleanSlug);
    if (idx !== -1) {
      localGroups[idx] = { ...localGroups[idx], ...group };
    } else {
      localGroups.push(group);
    }
    this._saveLocalCustoms('GROUPS', localGroups);

    return group;
  },

  // Create a brand new cohort / group
  async createGroup({ name, slug, tagline, description, coverImage }) {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
    const resolvedCover = (coverImage && coverImage.trim()) ? coverImage.trim() : 'uopefac.jpg';
    let newGroup = {
      id: 'grp_' + Date.now(),
      name: name.trim(),
      slug: cleanSlug,
      tagline: (tagline || `${name} Cohort`).trim(),
      description: (description || 'Faculty of Engineering English Teaching Unit student group.').trim(),
      coverImage: resolvedCover,
      cardImage: resolvedCover,
      students: []
    };

    if (_supabaseClient) {
      try {
        const { data, error } = await _supabaseClient
          .from('groups')
          .insert([{ name: newGroup.name, slug: cleanSlug }])
          .select();

        if (!error && data && data.length > 0) {
          newGroup.id = data[0].id;
        }
      } catch (err) {
        console.warn('Could not insert new group to Supabase:', err);
      }
    }

    const localGroups = this._getLocalCustoms('GROUPS');
    localGroups.push(newGroup);
    this._saveLocalCustoms('GROUPS', localGroups);

    return newGroup;
  }
};
