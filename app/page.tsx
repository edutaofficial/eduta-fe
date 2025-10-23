import {
  ExploreCourses,
  Hero,
  Categories,
  FeaturedCourses,
  Testimonials,
  FAQ as FAQComponent,
} from "@/components/Home";

export default function Page() {
  return (
    <>
      <Hero />
      <Categories />
      <ExploreCourses />
      <FeaturedCourses />
      <Testimonials />
      <FAQComponent />
    </>
  );
}
