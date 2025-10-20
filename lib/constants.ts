export const CONSTANTS = {
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
  ],

  // TEMPORARY DATA - Replace with backend data in production
  USER_DATA: {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://github.com/shadcn.png",
    fallback: "JD",
  },

 

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
};