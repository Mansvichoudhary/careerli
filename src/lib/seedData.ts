// Realistic seed data for demo purposes
// This data is used to populate the UI when no database data exists

export const demoUsers = [
  {
    id: 'demo-1',
    username: 'ritik_sharma',
    full_name: 'Ritik Sharma',
    avatar_url: null,
    bio: 'Building cool web apps and learning everyday. Currently exploring React and Node.js.',
    role: 'student' as const,
    university: 'IIT Delhi',
    skills: ['React', 'Node.js', 'JavaScript', 'Python'],
    location: 'Delhi, India'
  },
  {
    id: 'demo-2',
    username: 'khushi_k',
    full_name: 'Khushi Khandelwal',
    avatar_url: null,
    bio: 'DSA enthusiast | Competitive programmer | Building my first startup',
    role: 'student' as const,
    university: 'BITS Pilani',
    skills: ['Python', 'C++', 'DSA', 'Java'],
    location: 'Rajasthan, India'
  },
  {
    id: 'demo-3',
    username: 'arjun_patel',
    full_name: 'Arjun Patel',
    avatar_url: null,
    bio: 'IoT developer and electronics hobbyist. Love building hardware projects.',
    role: 'student' as const,
    university: 'NIT Trichy',
    skills: ['Arduino', 'Raspberry Pi', 'C', 'Embedded'],
    location: 'Chennai, India'
  },
  {
    id: 'demo-4',
    username: 'neha_gupta',
    full_name: 'Neha Gupta',
    avatar_url: null,
    bio: 'Frontend developer passionate about UI/UX. Open source contributor.',
    role: 'student' as const,
    university: 'DTU Delhi',
    skills: ['React', 'TypeScript', 'Tailwind', 'Figma'],
    location: 'Delhi, India'
  },
  {
    id: 'demo-5',
    username: 'mansvi_c',
    full_name: 'Mansvi Choudhary',
    avatar_url: null,
    bio: '10+ years in software engineering. Passionate about helping students grow.',
    role: 'mentor' as const,
    university: 'Senior Engineer @ Google',
    skills: ['Full Stack', 'System Design', 'Mentorship', 'Career'],
    location: 'Bangalore, India'
  },
  {
    id: 'demo-6',
    username: 'vikram_rao',
    full_name: 'Vikram Rao',
    avatar_url: null,
    bio: 'Startup founder and tech lead. Helping students with career guidance.',
    role: 'mentor' as const,
    university: 'Founder @ TechStart',
    skills: ['Entrepreneurship', 'Product', 'Leadership', 'Hiring'],
    location: 'Mumbai, India'
  },
  {
    id: 'demo-7',
    username: 'priya_singh',
    full_name: 'Priya Singh',
    avatar_url: null,
    bio: 'ML/AI researcher. Working on NLP and computer vision projects.',
    role: 'student' as const,
    university: 'IIIT Hyderabad',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP'],
    location: 'Hyderabad, India'
  },
  {
    id: 'demo-8',
    username: 'dev_sharma',
    full_name: 'Dev Sharma',
    avatar_url: null,
    bio: 'Open source maintainer. Contributing to major React projects.',
    role: 'mentor' as const,
    university: 'Staff Engineer @ Meta',
    skills: ['React', 'Open Source', 'Architecture', 'JavaScript'],
    location: 'Remote'
  },
  {
    id: 'demo-9',
    username: 'ananya_joshi',
    full_name: 'Ananya Joshi',
    avatar_url: null,
    bio: 'Cloud and DevOps learner. AWS certified. Love automation.',
    role: 'student' as const,
    university: 'NSUT Delhi',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    location: 'Delhi, India'
  },
  {
    id: 'demo-10',
    username: 'rohan_das',
    full_name: 'Rohan Das',
    avatar_url: null,
    bio: 'Blockchain developer and Web3 enthusiast.',
    role: 'student' as const,
    university: 'IIT Kharagpur',
    skills: ['Solidity', 'Web3', 'Ethereum', 'Smart Contracts'],
    location: 'Kolkata, India'
  }
];

export const demoPosts = [
  {
    id: 'demo-post-1',
    title: 'Building a URL Shortener (Day 3)',
    content: 'Implemented basic routing and hash generation today. Still figuring out how to handle collisions efficiently. Any suggestions on best practices?',
    post_type: 'project',
    tags: ['React', 'Node.js', 'Project'],
    likes_count: 6,
    comments_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    is_anonymous: false,
    author: demoUsers[0],
    demo_comments: [
      { author: demoUsers[1], content: 'You can try base62 encoding, helps reduce collisions.' },
      { author: demoUsers[4], content: 'Also consider adding expiry logic early. Makes the system more scalable.' }
    ]
  },
  {
    id: 'demo-post-2',
    title: 'React vs JavaScript fundamentals?',
    content: 'Is it better to learn React first or focus on JavaScript fundamentals more deeply? I keep seeing conflicting advice online.',
    post_type: 'text',
    tags: ['Discussion', 'React', 'JavaScript'],
    likes_count: 12,
    comments_count: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    is_anonymous: false,
    author: demoUsers[1],
    demo_comments: [
      { author: demoUsers[4], content: 'Don\'t rush frameworks. Solid JS fundamentals will save you months later.' },
      { author: demoUsers[3], content: 'I started with React directly and had to go back to learn JS properly. Recommend fundamentals first!' }
    ]
  },
  {
    id: 'demo-post-3',
    title: 'Mentor Insight: Framework vs Fundamentals',
    content: 'Don\'t rush frameworks. Solid JS fundamentals will save you months later. I\'ve interviewed 100+ candidates, and the ones with strong fundamentals always stand out.',
    post_type: 'text',
    tags: ['Insight', 'Career', 'Mentorship'],
    likes_count: 24,
    comments_count: 8,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    is_anonymous: false,
    author: demoUsers[4],
    demo_comments: []
  },
  {
    id: 'demo-post-4',
    title: 'Check if a number is prime',
    content: 'Here\'s an optimized prime checking function I wrote. Uses the square root optimization to reduce time complexity.',
    post_type: 'code',
    code_content: `def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

# Test cases
print(f"is_prime(7) → {is_prime(7)}")   # True
print(f"is_prime(10) → {is_prime(10)}") # False
print(f"is_prime(97) → {is_prime(97)}") # True`,
    code_language: 'python',
    tags: ['Python', 'DSA', 'Code'],
    likes_count: 18,
    comments_count: 4,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    is_anonymous: false,
    author: demoUsers[1],
    demo_comments: [
      { author: demoUsers[6], content: 'You can also add a check for n == 2 at the start for slight optimization.' }
    ]
  },
  {
    id: 'demo-post-5',
    title: 'My First IoT Weather Station 🌡️',
    content: 'Finally got my Arduino weather station working! It tracks temperature, humidity, and sends data to my phone via WiFi. Took 3 weeks but totally worth it.',
    post_type: 'project',
    tags: ['Arduino', 'IoT', 'Hardware'],
    likes_count: 15,
    comments_count: 6,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    is_anonymous: false,
    author: demoUsers[2],
    demo_comments: []
  },
  {
    id: 'demo-post-6',
    title: 'React useCallback Deep Dive',
    content: `A quick tip on useCallback - only use it when passing callbacks to optimized child components. Otherwise, it can actually hurt performance.`,
    post_type: 'code',
    code_content: `// ❌ Unnecessary useCallback
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);

// ✅ Useful when passing to memo'd child
const MemoChild = React.memo(({ onClick }) => (
  <button onClick={onClick}>Click</button>
));

// Parent component
const Parent = () => {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <MemoChild onClick={handleClick} />;
};`,
    code_language: 'typescript',
    tags: ['React', 'TypeScript', 'Performance'],
    likes_count: 32,
    comments_count: 7,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
    is_anonymous: false,
    author: demoUsers[7],
    demo_comments: []
  }
];

export const demoEvents = [
  {
    id: 'demo-event-1',
    title: 'Campus Hackathon 2024',
    description: 'Join 500+ students building the future. 48 hours of coding, learning, and networking. Prizes worth ₹5 Lakhs!',
    event_type: 'hackathon',
    start_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week from now
    end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9).toISOString(), // 2 days duration
    location: 'IIT Delhi Campus',
    is_online: false,
    max_participants: 500,
    participant_count: 312,
    organizer: 'Career Community'
  },
  {
    id: 'demo-event-2',
    title: 'System Design Workshop',
    description: 'Learn how to design scalable systems from a Google engineer. Topics include load balancing, caching, and database sharding.',
    event_type: 'workshop',
    start_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
    location: null,
    is_online: true,
    max_participants: 200,
    participant_count: 145,
    organizer: 'Vikram Rao'
  },
  {
    id: 'demo-event-3',
    title: 'React Meetup Delhi',
    description: 'Monthly React developers meetup. Share projects, network, and learn from the community.',
    event_type: 'meetup',
    start_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(), // 2 weeks from now
    location: 'WeWork, Connaught Place',
    is_online: false,
    max_participants: 50,
    participant_count: 38,
    organizer: 'Delhi React Community'
  }
];

export const trendingTech = [
  { 
    name: 'Python', 
    abbr: 'Py', 
    change: '+24%', 
    color: 'bg-blue-500',
    reason: 'ML & automation projects trending',
    postCount: 142
  },
  { 
    name: 'Rust', 
    abbr: 'Rs', 
    change: '+18%', 
    color: 'bg-orange-500',
    reason: 'Systems programming gaining traction',
    postCount: 67
  },
  { 
    name: 'React', 
    abbr: 'Re', 
    change: '+12%', 
    color: 'bg-cyan-500',
    reason: 'Frontend projects increasing',
    postCount: 234
  },
  { 
    name: 'Docker', 
    abbr: 'Do', 
    change: '+15%', 
    color: 'bg-blue-600',
    reason: 'DevOps skills in demand',
    postCount: 89
  },
  { 
    name: 'TypeScript', 
    abbr: 'TS', 
    change: '+10%', 
    color: 'bg-blue-700',
    reason: 'Type safety becoming standard',
    postCount: 156
  }
];
