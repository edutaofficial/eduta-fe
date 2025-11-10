"use client";

import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { CourseCard } from "@/components/Common/CourseCard";
import { CourseCardSkeleton } from "@/components/skeleton/CourseCardSkeleton";
import { useState, useEffect } from "react";
import { getFeaturedCourses } from "@/app/api/course/getFeaturedCourses";
import type { PublicCourse } from "@/app/api/course/searchCourses";

export default function FeaturedCourses() {
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedCourses = async () => {
      try {
        const response = await getFeaturedCourses({ limit: 10 });
        setCourses(response.data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching featured courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedCourses();
  }, []);

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
            {courses.map((course) => (
              <CourseCard
                key={course.courseId}
                id={course.courseId}
                image={course.courseBannerUrl || "/placeholder-course.png"}
                title={course.title}
                company={`${course.instructor.firstName} ${course.instructor.lastName}`}
                rating={parseFloat(course.stats.avgRating) || 0}
                ratingCount={course.stats.totalReviews}
                enrollments={course.stats.totalStudents}
                impressions={0}
                featured={true}
                price={course.pricing ? parseFloat(course.pricing.amount) : 0}
              />
            ))}
          </Slider>
        )}
      </div>
    </section>
  );
}
