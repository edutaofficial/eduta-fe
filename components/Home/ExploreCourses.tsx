"use client";

import * as React from "react";
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
import { CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";

export default function ExploreCourses() {
  const [activeCategory, setActiveCategory] = React.useState(
    CONSTANTS.COURSE_CATEGORIES[0]?.id
  );

  const [activeSubcategory, setActiveSubcategory] = React.useState<
    string | null
  >(null);

  const filteredCourses = activeSubcategory
    ? CONSTANTS.COURSES.filter(
        (c) =>
          c.categoryId === activeCategory && c.subcategory === activeSubcategory
      )
    : CONSTANTS.COURSES.filter((c) => c.categoryId === activeCategory);

  const activeCategoryData = CONSTANTS.COURSE_CATEGORIES.find(
    (c) => c.id === activeCategory
  );

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
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
          <Slider
            slidesPerView="auto"
            spaceBetween={24}
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
            {CONSTANTS.COURSE_CATEGORIES.map((category) => (
              <div key={category.id}>
                <button
                  className={`text-sm md:text-base pb-5 transition-colors whitespace-nowrap cursor-pointer ${
                    activeCategory === category.id
                      ? "border-default-700 text-default-900 border-b-2"
                      : " text-default-500 hover:text-default-700 "
                  }`}
                  onClick={() => handleCategoryClick(category.id)}
                  type="button"
                >
                  {category.name}
                </button>
              </div>
            ))}
          </Slider>
        </div>
        <div className="flex flex-col bg-default-100 py-8 gap-8">
          {/* Subcategories Slider (button style) */}
          <div className="bg-default-100 rounded-xl p-4 max-w-container mx-auto md:px-6 px-4 w-full">
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
                <div key={subcategory}>
                  <button
                    className={cn(
                      "text-sm px-4 py-2 rounded-md bg-default-200 text-default-900 hover:bg-default-300 transition-colors whitespace-nowrap",
                      activeSubcategory === subcategory &&
                        "bg-default-900 text-white"
                    )}
                    type="button"
                    onClick={() => setActiveSubcategory(subcategory)}
                  >
                    {subcategory}
                  </button>
                </div>
              ))}
            </Slider>
          </div>

          {/* Courses Slider or Empty State */}
          <div className="space-y-6 max-w-container mx-auto md:px-6 px-4 w-full ">
            <div className="min-h-[26.25rem]">
              {filteredCourses.length > 0 ? (
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
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      image={course.image}
                      title={course.title}
                      company={course.company}
                      rating={course.rating}
                      ratingCount={course.ratingCount}
                      enrollments={course.enrollments}
                      impressions={course.impressions}
                      featured={course.featured}
                      price={course.price}
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
                        ? `We couldn't find any ${activeSubcategory} courses in ${activeCategoryData?.name}. Try selecting a different subcategory or browse all ${activeCategoryData?.name} courses.`
                        : `We couldn't find any courses in ${activeCategoryData?.name}. Try selecting a different category.`}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
            {/* Show All Button */}
            <div className="md:text-start text-center w-full ">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="px-8 bg-transparent"
              >
                <Link href={`/all-courses?category=${activeCategory}`}>
                  Show all {activeCategoryData?.name} Courses
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
