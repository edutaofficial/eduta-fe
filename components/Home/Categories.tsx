"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation } from "swiper/modules";
import { Button } from "@/components/ui/button";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

function Categories() {
  const { categories, loading, fetchCategories } = useCategoryStore();
  const [swiperInstance, setSwiperInstance] = React.useState<SwiperType | null>(null);

  React.useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  // Flatten categories to include both parent categories and subcategories
  const allCategories = React.useMemo(() => {
    return categories.flatMap((category) => [
      { 
        id: category.categoryId, 
        name: category.name, 
        isParent: true,
        slug: category.slug,
        parentSlug: undefined,
      },
      ...category.subcategories.map((sub) => ({
        id: sub.categoryId,
        name: sub.name,
        isParent: false,
        slug: sub.slug,
        parentSlug: category.slug,
      })),
    ]);
  }, [categories]);

  // Group categories into slides of 8 items (2 rows x 4 columns)
  const itemsPerSlide = 8;
  const categorySlides = React.useMemo(() => {
    const slides: typeof allCategories[] = [];
    for (let i = 0; i < allCategories.length; i += itemsPerSlide) {
      slides.push(allCategories.slice(i, i + itemsPerSlide));
    }
    return slides;
  }, [allCategories]);

  if (loading) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-container mx-auto">
          <div className="h-8 bg-default-200 rounded w-48 mb-6 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-md bg-default-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (allCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-6">
      <div className="max-w-container mx-auto">
        <h2 className="text-3xl font-bold text-default-900 mb-8">
          Explore Categories
        </h2>
        
        <div className="relative p-2">
          {/* Categories Swiper */}
          <Swiper
            modules={[Navigation]}
            spaceBetween={0}
            slidesPerView={1}
            speed={500}
            onSwiper={setSwiperInstance}
            className="w-full"
          >
            {categorySlides.map((slideCategories, slideIndex) => (
              <SwiperSlide key={slideIndex}>
                <div className="p-3 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {slideCategories.map((category) => (
                <CategoryLinkCard
                  key={category.id}
                  name={category.name}
                  categoryId={category.id}
                  slug={category.slug}
                />
              ))}
            </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons - Bottom Right */}
          {categorySlides.length > 1 && (
            <div className="flex items-center justify-end gap-2 mt-6">
              <Button
                onClick={() => swiperInstance?.slidePrev()}
                disabled={!swiperInstance}
                variant="outline"
                size="icon"
                className="size-10"
              >
                <ChevronRight className="size-5 rotate-180" />
              </Button>
              <Button
                onClick={() => swiperInstance?.slideNext()}
                disabled={!swiperInstance}
                variant="outline"
                size="icon"
                className="size-10"
              >
                <ChevronRight className="size-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Categories;

function CategoryLinkCard({
  name,
  categoryId: _categoryId,
  slug,
}: {
  name: string;
  categoryId: string;
  slug: string;
}) {
  // Link to category detail page
  const link = `/category/${slug}`;

  return (
    <Link
      href={link}
      className="flex py-8 px-4 shadow-md hover:shadow-lg rounded-md justify-between bg-default-50 hover:bg-primary-50 transition-all cursor-pointer group"
    >
      <h3 className="text-xl font-normal text-default-800 group-hover:text-primary-700 transition-colors">
        {name}
      </h3>
      <ChevronRight className="size-6 text-default-800 group-hover:text-primary-700 transition-colors" />
    </Link>
  );
}
