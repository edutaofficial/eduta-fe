export const CONSTANTS = {
  // HERO - slides data for homepage hero section
  HERO_SLIDES: [
    {
      id: 1,
      title: "Master Web Development Skills",
      subtitle: "Learn from Industry Experts",
      description: "Build real-world projects with modern technologies",
      image: "https://placehold.co/650x650/2977A9/FFFFFF/png?text=Web+Development",
      buttonText: "Start for free",
    },
    {
      id: 2,
      title: "Advance Your Career Today",
      subtitle: "Transform Your Future",
      description: "Join thousands of successful graduates worldwide",
      image: "https://placehold.co/650x650/10B981/FFFFFF/png?text=Career+Growth",
      buttonText: "Start for free",
    },
    {
      id: 3,
      title: "Learn at Your Own Pace",
      subtitle: "Flexible Online Learning",
      description: "Access courses anytime, anywhere on any device",
      image: "https://placehold.co/650x650/F59E0B/FFFFFF/png?text=Online+Learning",
      buttonText: "Start for free",
    },
  ],
  PLACEHOLDER_IMAGE: (width: number, height: number) =>
    `https://placehold.co/${width}x${height}.svg`,

  // TEMPORARY DATA - Replace with backend data in production
  BLOG_POSTS: [
    {
      id: "1",
      title: "Getting Started with Web Development",
      description:
        "Learn the fundamentals of web development including HTML, CSS, and JavaScript.",
      imageUrl: "https://placehold.co/215x215.svg",
      href: "/blog/getting-started-web-dev",
    },
    {
      id: "2",
      title: "Advanced React Patterns",
      description:
        "Explore advanced React patterns and best practices for building scalable applications.",
      href: "/blog/advanced-react-patterns",
    },
    {
      id: "3",
      title: "TypeScript for Beginners",
      description:
        "A comprehensive guide to getting started with TypeScript in your projects.",
      href: "/blog/typescript-beginners",
    },
  ],

  // TEMPORARY DATA - Replace with backend data in production
  CATEGORIES: [
    {
      id: "1",
      name: "Web Development",
      description:
        "Master modern web technologies including HTML, CSS, JavaScript, React, and more.",
      href: "/category/web-development",
    },
    {
      id: "2",
      name: "Mobile Development",
      description:
        "Learn to build native and cross-platform mobile applications for iOS and Android.",
      href: "/category/mobile-development",
    },
    {
      id: "3",
      name: "Data Science",
      description:
        "Explore data analysis, machine learning, and artificial intelligence concepts.",
      href: "/category/data-science",
    },
    {
      id: "4",
      name: "UI/UX Design",
      description:
        "Master user interface and user experience design principles and tools.",
      href: "/category/ui-ux-design",
    },
    {
      id: "5",
      name: "Cloud Computing",
      description:
        "Learn cloud platforms like AWS, Azure, and Google Cloud for modern applications.",
      href: "/category/cloud-computing",
    },
    {
      id: "6",
      name: "Cybersecurity",
      description:
        "Understand security fundamentals and protect applications from threats.",
      href: "/category/cybersecurity",
    },
    {
      id: "7",
      name: "DevOps",
      description:
        "Automate, deploy, and monitor modern applications with CI/CD and tooling.",
      href: "/category/devops",
    },
    {
      id: "8",
      name: "Product Management",
      description:
        "Learn discovery, roadmapping, prioritization, and shipping customer value.",
      href: "/category/product-management",
    },
  ],

  // TEMPORARY DATA - Replace with backend data in production
  USER_DATA: {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://github.com/shadcn.png",
    fallback: "JD",
  },

  // Explore Courses - categories and demo courses
  COURSE_CATEGORIES: [
    {
      id: "web-dev",
      name: "Web Development",
      subcategories: [
        "JavaScript",
        "React",
        "Next.js",
        "TypeScript",
        "Node.js",
        "CSS",
        "Tailwind",
      ],
    },
    {
      id: "data",
      name: "Data & Analytics",
      subcategories: [
        "Python",
        "Pandas",
        "SQL",
        "Machine Learning",
        "Deep Learning",
        "Power BI",
        "R",
      ],
    },
    {
      id: "design",
      name: "Design",
      subcategories: [
        "UI/UX",
        "Figma",
        "Prototyping",
        "Design Systems",
        "Accessibility",
        "Motion",
      ],
    },
    {
      id: "mobile",
      name: "Mobile Development",
      subcategories: [
        "Flutter",
        "React Native",
        "Swift",
        "Kotlin",
        "Firebase",
      ],
    },
    {
      id: "cloud",
      name: "Cloud & DevOps",
      subcategories: [
        "AWS",
        "Azure",
        "GCP",
        "Docker",
        "Kubernetes",
        "CI/CD",
      ],
    },
    {
      id: "business",
      name: "Business & PM",
      subcategories: [
        "Product Management",
        "Agile",
        "Scrum",
        "Leadership",
        "OKRs",
      ],
    },
  ],

  COURSES: [
    {
      id: "c1",
      title: "Modern React & TypeScript",
      company: "Eduta Originals",
      image: "https://placehold.co/600x360/png?text=React+%2B+TS",
      rating: 4.5,
      ratingCount: 1233,
      enrollments: 120,
      impressions: 340,
      featured: true,
      categoryId: "web-dev",
      subcategory: "React",
      price: 0,
    },
    {
      id: "c2",
      title: "Next.js 15 App Router Mastery",
      company: "Eduta",
      image: "https://placehold.co/600x360/png?text=Next.js+15",
      rating: 4.6,
      ratingCount: 987,
      enrollments: 220,
      impressions: 680,
      featured: true,
      categoryId: "web-dev",
      subcategory: "Next.js",
      price: 0,
    },
    {
      id: "c3",
      title: "Python for Data Analysis",
      company: "DataPro",
      image: "https://placehold.co/600x360/png?text=Python+Data",
      rating: 4.4,
      ratingCount: 1500,
      enrollments: 300,
      impressions: 1050,
      featured: false,
      categoryId: "data",
      subcategory: "Python",
      price: 0,
    },
    {
      id: "c4",
      title: "Figma to Design Systems",
      company: "DesignLab",
      image: "https://placehold.co/600x360/png?text=Figma+Design+Systems",
      rating: 4.7,
      ratingCount: 640,
      enrollments: 180,
      impressions: 420,
      featured: true,
      categoryId: "design",
      subcategory: "Design Systems",
      price: 0,
    },
    {
      id: "c5",
      title: "Flutter from Zero to Hero",
      company: "MobileWorks",
      image: "https://placehold.co/600x360/png?text=Flutter",
      rating: 4.5,
      ratingCount: 1110,
      enrollments: 260,
      impressions: 770,
      featured: false,
      categoryId: "mobile",
      subcategory: "Flutter",
      price: 0,
    },
  ],

  // TEMPORARY DATA - Replace with backend data in production
  FOOTER_CATEGORIES: [
    {
      id: "1",
      title: "Explore",
      links: [
        { name: "All Courses", href: "/courses" },
        { name: "Categories", href: "/categories" },
        { name: "Instructors", href: "/instructors" },
        { name: "FAQs", href: "/faqs" },
        { name: "Testimonials", href: "/testimonials" },
      ],
    },
    {
      id: "1",
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Blog", href: "/blog" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms & Conditions", href: "/terms" },
      ],
    },
    {
      id: "2",
      title: "Programming",
      links: [
        { name: "Web Development", href: "/category/web-development" },
        { name: "JavaScript", href: "/category/javascript" },
        { name: "Python", href: "/category/python" },
        { name: "Mobile Apps", href: "/category/mobile-apps" },
        { name: "Game Development", href: "/category/game-development" },
      ],
    },
    {
      id: "3",
      title: "Design",
      links: [
        { name: "UI/UX Design", href: "/category/ui-ux-design" },
        { name: "Graphic Design", href: "/category/graphic-design" },
        { name: "Web Design", href: "/category/web-design" },
        { name: "3D & Animation", href: "/category/3d-animation" },
        { name: "Video Editing", href: "/category/video-editing" },
      ],
    },
   
    {
      id: "5",
      title: "Data & Analytics",
      links: [
        { name: "Data Science", href: "/category/data-science" },
        { name: "Machine Learning", href: "/category/machine-learning" },
        { name: "Data Analysis", href: "/category/data-analysis" },
        { name: "SQL", href: "/category/sql" },
        { name: "Business Intelligence", href: "/category/business-intelligence" },
      ],
    },
    {
      id: "6",
      title: "Marketing",
      links: [
        { name: "Digital Marketing", href: "/category/digital-marketing" },
        { name: "SEO", href: "/category/seo" },
        { name: "Social Media", href: "/category/social-media" },
        { name: "Content Marketing", href: "/category/content-marketing" },
        { name: "Email Marketing", href: "/category/email-marketing" },
      ],
    },
    {
      id: "7",
      title: "IT & Software",
      links: [
        { name: "Cloud Computing", href: "/category/cloud-computing" },
        { name: "Cybersecurity", href: "/category/cybersecurity" },
        { name: "DevOps", href: "/category/devops" },
        { name: "Networking", href: "/category/networking" },
        { name: "IT Certifications", href: "/category/it-certifications" },
      ],
    },
    {
      id: "8",
      title: "Personal Development",
      links: [
        { name: "Leadership", href: "/category/leadership" },
        { name: "Productivity", href: "/category/productivity" },
        { name: "Career Development", href: "/category/career-development" },
        { name: "Communication", href: "/category/communication" },
        { name: "Public Speaking", href: "/category/public-speaking" },
      ],
    },
    {
      id: "9",
      title: "Photography & Video",
      links: [
        { name: "Photography", href: "/category/photography" },
        { name: "Video Production", href: "/category/video-production" },
        { name: "Photo Editing", href: "/category/photo-editing" },
        { name: "Videography", href: "/category/videography" },
        { name: "Commercial Photography", href: "/category/commercial-photography" },
      ],
    },
    {
      id: "10",
      title: "Health & Fitness",
      links: [
        { name: "Fitness", href: "/category/fitness" },
        { name: "Nutrition", href: "/category/nutrition" },
        { name: "Yoga", href: "/category/yoga" },
        { name: "Mental Health", href: "/category/mental-health" },
        { name: "Meditation", href: "/category/meditation" },
      ],
    },
    {
      id: "11",
      title: "Music",
      links: [
        { name: "Music Production", href: "/category/music-production" },
        { name: "Guitar", href: "/category/guitar" },
        { name: "Piano", href: "/category/piano" },
        { name: "Vocals", href: "/category/vocals" },
        { name: "Music Theory", href: "/category/music-theory" },
      ],
    },
    {
      id: "12",
      title: "Lifestyle",
      links: [
        { name: "Arts & Crafts", href: "/category/arts-crafts" },
        { name: "Cooking", href: "/category/cooking" },
        { name: "Travel", href: "/category/travel" },
        { name: "Gaming", href: "/category/gaming" },
        { name: "Home Improvement", href: "/category/home-improvement" },
      ],
    },
  ],

  // TEMPORARY DATA - Contact information
  CONTACT_INFO: {
    email: "support@eduta.org",
    phone: "+1 (555) 123-4567",
  },

  // TEMPORARY DATA - Social media links
  SOCIAL_LINKS: {
    facebook: "https://facebook.com/eduta",
    instagram: "https://instagram.com/eduta",
    twitter: "https://twitter.com/eduta",
    linkedin: "https://linkedin.com/company/eduta",
    youtube: "https://youtube.com/@eduta",
  },
  STUDENT_PROFILES: [
    { id: 1, image: "https://i.pravatar.cc/150?img=1", name: "Student 1" },
    { id: 2, image: "https://i.pravatar.cc/150?img=2", name: "Student 2" },
    { id: 3, image: "https://i.pravatar.cc/150?img=3", name: "Student 3" },
  ],

  // Instructor data
  INSTRUCTOR: {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@eduta.org",
    avatar: "https://i.pravatar.cc/150?img=11",
  },

  // Instructor dashboard data
  INSTRUCTOR_DRAFT_COURSES: [
    {
      id: "d1",
      title: "Advanced React Patterns",
      subtitle: "Master complex React patterns and architecture",
      progress: 65,
      status: "draft",
    },
    {
      id: "d2",
      title: "Modern JavaScript Essentials",
      subtitle: "Learn ES6+ features and modern JS practices",
      progress: 30,
      status: "draft",
    },
    {
      id: "d3",
      title: "Full-Stack Development with Next.js",
      subtitle: "Build complete web applications",
      progress: 80,
      status: "draft",
    },
  ],

  INSTRUCTOR_PUBLISHED_COURSES: [
    {
      id: "p1",
      title: "Complete Python Bootcamp",
      subtitle: "From Zero to Hero in Python",
      image: "https://placehold.co/600x360/png?text=Python+Course",
      rating: 4.8,
      ratingCount: 1250,
      enrollments: 850,
      impressions: 2100,
      featured: true,
      status: "published",
      price: 0,
    },
    {
      id: "p2",
      title: "JavaScript Fundamentals",
      subtitle: "Learn JavaScript from scratch",
      image: "https://placehold.co/600x360/png?text=JavaScript+Course",
      rating: 4.6,
      ratingCount: 980,
      enrollments: 650,
      impressions: 1800,
      featured: false,
      status: "published",
      price: 0,
    },
    {
      id: "p3",
      title: "UI/UX Design Masterclass",
      subtitle: "Design beautiful user interfaces",
      image: "https://placehold.co/600x360/png?text=Design+Course",
      rating: 4.9,
      ratingCount: 540,
      enrollments: 420,
      impressions: 1200,
      featured: true,
      status: "published",
      price: 0,
    },
    {
      id: "p4",
      title: "Data Science with Python",
      subtitle: "Analyze data like a professional",
      image: "https://placehold.co/600x360/png?text=Data+Science+Course",
      rating: 4.7,
      ratingCount: 780,
      enrollments: 580,
      impressions: 1500,
      featured: false,
      status: "completed",
      price: 0,
    },
  ],

  // Announcements data
  ANNOUNCEMENTS: [
    {
      id: "a1",
      courseId: "p1",
      courseTitle: "Complete Python Bootcamp",
      heading: "New Lecture Added",
      description: "We've added a new lecture on Advanced Data Structures. Please complete it by the end of the week.",
      date: "2024-01-15",
    },
    {
      id: "a2",
      courseId: "p2",
      courseTitle: "JavaScript Fundamentals",
      heading: "Assignment Deadline Extended",
      description: "The deadline for Assignment 3 has been extended by 3 days to give everyone more time.",
      date: "2024-01-14",
    },
    {
      id: "a3",
      courseId: "p3",
      courseTitle: "UI/UX Design Masterclass",
      heading: "Guest Speaker Session",
      description: "Join us this Friday for a special session with Senior Designer Jane Doe.",
      date: "2024-01-13",
    },
  ],

  // Analytics data
  ANALYTICS_DATA: {
    impressions: [
      { month: "Jan", value: 1200 },
      { month: "Feb", value: 1500 },
      { month: "Mar", value: 1800 },
      { month: "Apr", value: 2100 },
      { month: "May", value: 1900 },
      { month: "Jun", value: 2400 },
    ],
    enrollments: [
      { month: "Jan", value: 85 },
      { month: "Feb", value: 120 },
      { month: "Mar", value: 150 },
      { month: "Apr", value: 180 },
      { month: "May", value: 210 },
      { month: "Jun", value: 250 },
    ],
    ratings: [
      { month: "Jan", value: 4.2 },
      { month: "Feb", value: 4.5 },
      { month: "Mar", value: 4.6 },
      { month: "Apr", value: 4.7 },
      { month: "May", value: 4.8 },
      { month: "Jun", value: 4.9 },
    ],
  },

  // Payment data
  PAYMENTS: [
    {
      id: "pay1",
      courseId: "p1",
      courseTitle: "Complete Python Bootcamp",
      earnings: 1250.00,
      status: "release-ready",
      releaseDate: "2024-01-20",
      students: 85,
    },
    {
      id: "pay2",
      courseId: "p2",
      courseTitle: "JavaScript Fundamentals",
      earnings: 890.50,
      status: "pending",
      releaseDate: "2024-01-28",
      students: 65,
    },
    {
      id: "pay3",
      courseId: "p3",
      courseTitle: "UI/UX Design Masterclass",
      earnings: 420.00,
      status: "released",
      releaseDate: "2024-01-10",
      students: 42,
    },
    {
      id: "pay4",
      courseId: "p4",
      courseTitle: "Data Science with Python",
      earnings: 580.00,
      status: "withdrawn",
      releaseDate: "2024-01-05",
      students: 58,
    },
  ],
  PAYMENT_REVENUE: [
    { month: "Jan", revenue: 2800 },
    { month: "Feb", revenue: 3200 },
    { month: "Mar", revenue: 3800 },
    { month: "Apr", revenue: 4200 },
    { month: "May", revenue: 4500 },
    { month: "Jun", revenue: 5200 },
  ],

  // Testimonials data
  TESTIMONIALS: [
    {
      id: 1,
      reviewHeading: "Transformed My Career Completely",
      reviewDescription: "The React course was absolutely amazing! I went from knowing nothing about web development to landing my dream job as a frontend developer. The instructors are world-class and the projects are real-world applicable.",
      videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailLink: "https://placehold.co/400x300/2977A9/FFFFFF/png?text=Video+Thumbnail+1",
      userName: "Sarah Johnson",
      ratingCount: 4.8,
    },
    {
      id: 2,
      reviewHeading: "Best Investment I Ever Made",
      reviewDescription: "Eduta's data science program changed everything for me. The hands-on approach and practical projects helped me understand complex concepts easily. Now I'm working as a data scientist at a top tech company.",
      videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailLink: "https://placehold.co/400x300/10B981/FFFFFF/png?text=Video+Thumbnail+2",
      userName: "Michael Chen",
      ratingCount: 4.9,
    },
    {
      id: 3,
      reviewHeading: "Exceeded All My Expectations",
      reviewDescription: "The mobile development course was incredible! I learned Flutter from scratch and built my first app within 3 months. The community support and instructor feedback were outstanding throughout the journey.",
      videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailLink: "https://placehold.co/400x300/F59E0B/FFFFFF/png?text=Video+Thumbnail+3",
      userName: "Emily Rodriguez",
      ratingCount: 4.7,
    },
    {
      id: 4,
      reviewHeading: "From Zero to Hero in 6 Months",
      reviewDescription: "I had no programming background, but Eduta's structured learning path made everything click. The step-by-step approach and real-world projects gave me the confidence to start my own tech startup.",
      videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailLink: "https://placehold.co/400x300/EF4444/FFFFFF/png?text=Video+Thumbnail+4",
      userName: "David Kim",
      ratingCount: 4.6,
    },
    {
      id: 5,
      reviewHeading: "Life-Changing Learning Experience",
      reviewDescription: "The design course opened up a whole new world for me. I learned not just the tools, but the thinking process behind great design. Now I'm a UX designer at a Fortune 500 company, all thanks to Eduta!",
      videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailLink: "https://placehold.co/400x300/8B5CF6/FFFFFF/png?text=Video+Thumbnail+5",
      userName: "Lisa Thompson",
      ratingCount: 4.9,
    },
  ],

  // FAQ data
  FAQS: [
    {
      id: 1,
      question: "How do I get started with Eduta courses?",
      answer: "Getting started is easy! Simply browse our course catalog, select a course that interests you, and click 'Start for free'. You'll have immediate access to all course materials and can learn at your own pace. No credit card required for free courses.",
    },
    {
      id: 2,
      question: "Are the courses really free?",
      answer: "Yes! All our courses are completely free. We believe in making quality education accessible to everyone. You can access all course materials, videos, and resources without any cost or hidden fees.",
    },
    {
      id: 3,
      question: "Do I get a certificate after completing a course?",
      answer: "Yes, upon successful completion of any course, you'll receive a digital certificate that you can share on LinkedIn and add to your resume. Our certificates are recognized by employers worldwide.",
    },
    {
      id: 4,
      question: "How long do I have access to the course materials?",
      answer: "You have lifetime access to all course materials once you enroll. You can revisit the content anytime, anywhere, and continue learning at your own pace without any time restrictions.",
    },
    {
      id: 5,
      question: "What if I need help during the course?",
      answer: "We provide multiple support channels including community forums, instructor Q&A sessions, and peer-to-peer learning groups. Our instructors and community are always ready to help you succeed.",
    },
    {
      id: 6,
      question: "Can I learn on mobile devices?",
      answer: "Absolutely! Our platform is fully responsive and works seamlessly on desktop, tablet, and mobile devices. You can learn anywhere, anytime with our mobile-optimized interface.",
    },
  ],
};