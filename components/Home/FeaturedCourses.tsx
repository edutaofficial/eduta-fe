"use client";

import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { CourseCard } from "@/components/Common/CourseCard";
import { CourseCardSkeleton } from "@/components/skeleton/CourseCardSkeleton";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedCourses } from "@/app/api/course/getFeaturedCourses";

export default function FeaturedCourses() {
  const { data, isLoading: loading } = useQuery({
    queryKey: ["featuredCourses"],
    queryFn: () => getFeaturedCourses({ limit: 10 }),
    staleTime: 1000 * 60 * 10, // 10 minutes - featured courses don't change often
  });

  const courses = data?.data || [];

  // Don't render the section if there are no featured courses
  if (!loading && courses.length === 0) {
    return null;
  }

  return (
    <section className="w-full mx-auto  py-16 space-y-14">
      {/* Top Badge + Headings */}
      <div className="space-y-4 text-center md:text-left max-w-container mx-auto md:px-6 px-4 ">
        <div className="flex flex-col items-center md:items-start gap-6">
          <Badge>Student Favorite</Badge>
          <h2 className="text-2xl md:text-4xl font-semibold text-default-900">
            Featured Courses
          </h2>
          <p className="text-default-700 md:text-2xl text-lg max-w-3xl ">
            Top-rated and trending courses handpicked just for you. Learn from
            the best and level up your skills today.
          </p>
        </div>

        {loading ? (
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
            slideClassName="pb-4"
            pagination={{
              enabled: false,
            }}
          >
            {[...Array(4)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </Slider>
        ) : (
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
            slideClassName="pb-4"
            pagination={{
              enabled: false,
            }}
          >
            {courses.map((course) => {
              const instructorName = course.instructor
                ? `${course.instructor.firstName ?? ""} ${course.instructor.lastName ?? ""}`.trim() ||
                  "Expert Instructor"
                : "Expert Instructor";
              const courseStats = course.stats || {
                avgRating: "0",
                totalReviews: 0,
                totalStudents: 0,
              };

              return (
                <CourseCard
                  key={course.courseId}
                  slug={course.slug}
                  image={course.courseBannerUrl || "/placeholder-course.png"}
                  title={course.title}
                  company={instructorName}
                  rating={parseFloat(courseStats.avgRating) || 0}
                  ratingCount={courseStats.totalReviews}
                  enrollments={courseStats.totalStudents}
                  impressions={0}
                  featured={true}
                  price={course.pricing ? parseFloat(course.pricing.amount) : 0}
                />
              );
            })}
          </Slider>
        )}
      </div>
    </section>
  );
}
