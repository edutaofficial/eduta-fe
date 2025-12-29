import { getCategoryBySlug } from "@/app/api/category/getCategoryBySlug";
import { searchCourses } from "@/app/api/course/searchCourses";
import { CategoryPageClient } from "@/components/Category/CategoryPageClient";

// Enable ISR - revalidate every 15 minutes
export const revalidate = 900;

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const COURSES_PER_PAGE = 9;

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
