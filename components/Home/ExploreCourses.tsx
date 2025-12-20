"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { CourseCard } from "@/components/Common/CourseCard";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCategoryStore } from "@/store/useCategoryStore";
import { searchCourses } from "@/app/api/course/searchCourses";
import { CourseCardSkeleton } from "@/components/skeleton/CourseCardSkeleton";

export default function ExploreCourses() {
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
  } = useCategoryStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    null
  );

  // Fetch categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  // Derive the active category: use selected category, or default to first category
  const activeCategory = useMemo(() => {
    if (selectedCategory) return selectedCategory;
    return categories.length > 0 ? categories[0].categoryId : "";
  }, [selectedCategory, categories]);

  // Get category slugs for API call
  const activeCategorySlug = useMemo(() => {
    const category = categories.find((c) => c.categoryId === activeCategory);
    return category?.slug || "";
  }, [activeCategory, categories]);

  const activeSubcategorySlug = useMemo(() => {
    if (!activeSubcategory) return null;
    
    for (const category of categories) {
      const subcategory = category.subcategories.find(
        (sub) => sub.categoryId === activeSubcategory
      );
      if (subcategory) return subcategory.slug;
    }
    return null;
  }, [activeSubcategory, categories]);

  // Use TanStack Query for courses
  const { data: coursesData, isLoading: loadingCourses } = useQuery({
    queryKey: ["exploreCourses", activeSubcategorySlug || activeCategorySlug],
    queryFn: () =>
      searchCourses({
        categorySlug: activeSubcategorySlug || activeCategorySlug,
        pageSize: 12,
        sortBy: "created_at",
        order: "desc",
      }),
    enabled: !!activeCategorySlug,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const courses = coursesData?.data.courses || [];

  const activeCategoryData = categories.find(
    (c) => c.categoryId === activeCategory
  );

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveSubcategory(null);
  };
  return (
    <section className="w-full mx-auto  py-16 space-y-14">
      {/* Top Badge + Headings */}
      <div className="space-y-4 text-center md:text-left max-w-container mx-auto md:px-6 px-4">
        <div className="flex flex-col items-center md:items-start gap-6">
          <Badge variant="secondary">Your growth space</Badge>
          <h2 className="text-2xl md:text-4xl font-semibold text-default-900">
            Your journey to mastery starts here.
          </h2>
          <p className="text-default-700 md:text-2xl text-lg max-w-3xl ">
            Explore Eduta’s courses — designed to help you build, improve, and
            excel at what matters most.
          </p>
        </div>
      </div>

      {/* Main Categories Tabs (underline style) */}
      <div className="flex flex-col ">
        <div className="max-w-container w-full mx-auto md:px-6 px-4">
          {categoriesLoading ? (
            <div className="flex gap-6 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-32 bg-default-200 animate-pulse rounded"
                />
              ))}
            </div>
          ) : (
            <Slider
              slidesPerView="auto"
              spaceBetween={24}
              customStyle={{
                padding: "10px",
              }}
              className="subcategories-slider"
              slideClassName="!w-auto"
              navigation={{
                enabled: true,
                showArrows: true,
                spacing: "px-12",
              }}
              pagination={{
                enabled: false,
                clickable: false,
              }}
            >
              {categories.map((category) => (
                <div key={category.categoryId}>
                  <button
                    className={`text-sm md:text-base pb-5 transition-colors whitespace-nowrap cursor-pointer ${
                      activeCategory === category.categoryId
                        ? "border-default-700 text-default-900 border-b-2"
                        : " text-default-500 hover:text-default-700 "
                    }`}
                    onClick={() => handleCategoryClick(category.categoryId)}
                    type="button"
                  >
                    {category.name}
                  </button>
                </div>
              ))}
            </Slider>
          )}
        </div>
        <div className="flex flex-col bg-default-100 py-8 gap-8">
          {/* Subcategories Slider (button style) */}
          <div className="bg-default-100 rounded-xl p-4 max-w-container mx-auto md:px-6 px-4 w-full">
            {categoriesLoading ? (
              <div className="flex gap-3 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-9 w-24 bg-default-200 animate-pulse rounded-md"
                  />
                ))}
              </div>
            ) : (
              <Slider
                slidesPerView="auto"
                spaceBetween={12}
                className="subcategories-slider"
                slideClassName="!w-auto"
                navigation={{
                  enabled: true,
                  position: "center",
                  showArrows: true,
                  spacing: "px-12",
                }}
                pagination={{
                  enabled: false,
                  clickable: false,
                }}
              >
                {/* making a all filter to see all the subcategories and set the active subcategory to null */}
                <div key="all">
                  <button
                    className={cn(
                      "text-sm px-4 py-2 rounded-md bg-default-200 text-default-900 hover:bg-default-300 transition-colors whitespace-nowrap",
                      activeSubcategory === null && "bg-default-900 text-white"
                    )}
                    type="button"
                    onClick={() => setActiveSubcategory(null)}
                  >
                    All
                  </button>
                </div>
                {activeCategoryData?.subcategories?.map((subcategory) => (
                  <div key={subcategory.categoryId}>
                    <button
                      className={cn(
                        "text-sm px-4 py-2 rounded-md bg-default-200 text-default-900 hover:bg-default-300 transition-colors whitespace-nowrap",
                        activeSubcategory === subcategory.categoryId &&
                          "bg-default-900 text-white"
                      )}
                      type="button"
                      onClick={() =>
                        setActiveSubcategory(subcategory.categoryId)
                      }
                    >
                      {subcategory.name}
                    </button>
                  </div>
                ))}
              </Slider>
            )}
          </div>

          {/* Courses Slider or Empty State */}
          <div className="space-y-6 max-w-container mx-auto md:px-6 px-4 w-full ">
            <div className="min-h-[26.25rem]">
              {loadingCourses ? (
                <Slider
                  slidesPerView={1}
                  spaceBetween={16}
                  breakpoints={{
                    640: { slidesPerView: 2, spaceBetween: 16 },
                    1024: { slidesPerView: 3, spaceBetween: 20 },
                    1280: { slidesPerView: 4, spaceBetween: 24 },
                  }}
                  navigation={{
                    enabled: false,
                    position: "center",
                    showArrows: false,
                    spacing: "",
                  }}
                  pagination={{
                    enabled: false,
                    clickable: false,
                  }}
                >
                  {[...Array(4)].map((_, i) => (
                    <CourseCardSkeleton key={i} />
                  ))}
                </Slider>
              ) : courses.length > 0 ? (
                <Slider
                  slidesPerView={1}
                  spaceBetween={16}
                  breakpoints={{
                    640: { slidesPerView: 2, spaceBetween: 16 },
                    1024: { slidesPerView: 3, spaceBetween: 20 },
                    1280: { slidesPerView: 4, spaceBetween: 24 },
                  }}
                  navigation={{
                    enabled: true,
                    position: "center",
                    showArrows: true,
                    spacing: "",
                  }}
                  pagination={{
                    enabled: true,
                    clickable: true,
                    className: "hero-pagination",
                  }}
                 
                >
                  {courses.map((course) => (
                    <CourseCard
                      key={course.courseId}
                      slug={course.slug}
                      image={
                        course.courseBannerUrl || "/placeholder-course.png"
                      }
                      title={course.title}
                      company={`${course.instructor.firstName} ${course.instructor.lastName}`}
                      rating={parseFloat(course.stats.avgRating) || 0}
                      ratingCount={course.stats.totalReviews}
                      enrollments={course.stats.totalStudents}
                      impressions={course.stats.viewsCount}
                      featured={false}
                      price={
                        course.pricing ? parseFloat(course.pricing.amount) : 0
                      }
                    />
                  ))}
                </Slider>
              ) : (
                <Empty className="border-none bg-transparent">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchIcon className="size-8 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle className="text-xl">
                      No courses found
                    </EmptyTitle>
                    <EmptyDescription className="text-base">
                      {activeSubcategory
                        ? `We couldn't find any courses in this subcategory. Try selecting a different subcategory or browse all ${activeCategoryData?.name} courses.`
                        : `We couldn't find any courses in ${activeCategoryData?.name}. Try selecting a different category.`}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
            {/* Show All Button */}
            {!loadingCourses && courses.length > 0 && (
              <div className="md:text-start text-center w-full ">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="px-8 bg-transparent"
                >
                  <Link href={`/topics/${activeCategorySlug}/${activeCategorySlug}`}>
                    Show all {activeCategoryData?.name} Courses
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
