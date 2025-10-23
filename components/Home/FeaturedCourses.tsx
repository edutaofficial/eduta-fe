import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { CourseCard } from "@/components/Common/CourseCard";

import { CONSTANTS } from "@/lib/constants";

export default function FeaturedCourses() {
  return (
    <section className="w-full mx-auto  py-16 space-y-14">
      {/* Top Badge + Headings */}
      <div className="space-y-4 text-center md:text-left max-w-container mx-auto md:px-6 px-4 ">
        <div className="flex flex-col items-center md:items-start gap-6">
          <Badge variant="secondary">Student Favorite</Badge>
          <h2 className="text-2xl md:text-4xl font-semibold text-default-900">
            Featured Courses
          </h2>
          <p className="text-default-700 md:text-2xl text-lg max-w-3xl ">
            Top-rated and trending courses handpicked just for you. Learn from
            the best and level up your skills today.
          </p>
        </div>

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
            enabled: true,
            clickable: true,
            className: "hero-pagination",
          }}
        >
          {CONSTANTS.COURSES.map((course) => (
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
      </div>
    </section>
  );
}
