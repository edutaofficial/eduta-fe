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
};