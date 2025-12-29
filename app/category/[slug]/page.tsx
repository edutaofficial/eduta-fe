import type { Metadata } from "next";
import { getCategoryBySlug } from "@/app/api/category/getCategoryBySlug";
import { searchCourses } from "@/app/api/course/searchCourses";
import { getAllCategories } from "@/app/api/category/getAllCategories";
import { CategoryPageClient } from "@/components/Category/CategoryPageClient";
import { SITE_BASE_URL } from "@/lib/constants";

// Enable ISR - revalidate every 15 minutes
export const revalidate = 900;

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const COURSES_PER_PAGE = 9;

// Generate static params for all categories at build time
export async function generateStaticParams() {
  try {
    const categoriesData = await getAllCategories();
    const categories = categoriesData?.data || [];

    // Get all parent categories and subcategories
    const allCategories: { slug: string }[] = [];
    
    categories.forEach((category) => {
      // Add parent category
      allCategories.push({ slug: category.slug });
      
      // Add all subcategories
      if (category.subcategories && category.subcategories.length > 0) {
        category.subcategories.forEach((sub) => {
          allCategories.push({ slug: sub.slug });
        });
      }
    });

    return allCategories;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error generating static params for categories:", error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
      return {
        title: "Category Not Found",
        description: "The category you're looking for doesn't exist.",
      };
    }

    const url = `${SITE_BASE_URL}/category/${slug}`;
    const imageUrl = category.iconUrl || `${SITE_BASE_URL}/og-image.jpg`;

    return {
      title: `${category.name} Courses - Eduta`,
      description: category.description || `Explore ${category.name} courses on Eduta. Learn from expert instructors and advance your career.`,
      keywords: [
        category.name,
        "online courses",
        "e-learning",
        "skill development",
        "professional development",
        ...(category.subcategories?.map((sub) => sub.name) || []),
      ],
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: `${category.name} Courses - Eduta`,
        description: category.description || `Explore ${category.name} courses on Eduta.`,
        url,
        siteName: "Eduta",
        locale: "en_US",
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: category.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${category.name} Courses - Eduta`,
        description: category.description || `Explore ${category.name} courses on Eduta.`,
        creator: "@eduta",
        images: [imageUrl],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error generating metadata for category ${params}:`, error);
    return {
      title: "Category",
      description: "Explore courses on Eduta.",
    };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  // Fetch data server-side for SEO
  let initialCategory = undefined;
  let initialCourses = undefined;
  
  try {
    // Fetch category and first page of courses in parallel
    [initialCategory, initialCourses] = await Promise.all([
      getCategoryBySlug(slug),
      searchCourses({
        categorySlug: slug,
        page: 1,
        pageSize: COURSES_PER_PAGE,
      }),
    ]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching category page data for slug ${slug}:`, error);
  }
  
  return (
    <CategoryPageClient 
      slug={slug} 
      initialCategory={initialCategory} 
      initialCourses={initialCourses}
    />
  );
}
