"use client";

import * as React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectFade,
  EffectCoverflow,
  EffectFlip,
  EffectCube,
  EffectCards,
} from "swiper/modules";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-flip";
import "swiper/css/effect-cube";
import "swiper/css/effect-cards";

type SwiperEffect = "slide" | "fade" | "coverflow" | "flip" | "cube" | "cards";

interface NavigationConfig {
  enabled: boolean;
  prevClassName?: string;
  nextClassName?: string;
  position?: "inside" | "outside" | "center";
  showArrows?: boolean;
  customPrevButton?: React.ReactNode;
  customNextButton?: React.ReactNode;
  spacing?: string;
}

interface PaginationConfig {
  enabled: boolean;
  clickable?: boolean;
  dynamicBullets?: boolean;
  type?: "bullets" | "fraction" | "progressbar";
  className?: string;
}

interface AutoplayConfig {
  enabled: boolean;
  delay?: number;
  disableOnInteraction?: boolean;
  pauseOnMouseEnter?: boolean;
}

export interface SliderProps {
  children: React.ReactNode;
  className?: string;
  slideClassName?: string;
  spaceBetween?: number;
  slidesPerView?: number | "auto";
  loop?: boolean;
  speed?: number;
  effect?: SwiperEffect;
  navigation?: NavigationConfig;
  pagination?: PaginationConfig;
  autoplay?: AutoplayConfig;
  breakpoints?: {
    [key: number]: {
      slidesPerView?: number;
      spaceBetween?: number;
    };
  };
  onSlideChange?: (swiper: SwiperType) => void;
  onSwiper?: (swiper: SwiperType) => void;
}

const defaultNavigationConfig: NavigationConfig = {
  enabled: true,
  position: "center",
  showArrows: true,
};

const defaultPaginationConfig: PaginationConfig = {
  enabled: true,
  clickable: true,
  type: "bullets",
};

const defaultAutoplayConfig: AutoplayConfig = {
  enabled: false,
  delay: 3000,
  disableOnInteraction: false,
  pauseOnMouseEnter: true,
};

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      children,
      className,
      slideClassName,
      spaceBetween = 0,
      slidesPerView = 1,
      loop = false,
      speed = 300,
      effect = "slide",
      navigation: navigationProp,
      pagination: paginationProp,
      autoplay: autoplayProp,
      breakpoints,
      onSlideChange,
      onSwiper,
    },
    ref
  ) => {
    const [swiperInstance, setSwiperInstance] =
      React.useState<SwiperType | null>(null);
    const [paginationEl, setPaginationEl] =
      React.useState<HTMLDivElement | null>(null);

    // Merge configs with defaults
    const navigation = navigationProp
      ? { ...defaultNavigationConfig, ...navigationProp }
      : defaultNavigationConfig;
    const pagination = paginationProp
      ? { ...defaultPaginationConfig, ...paginationProp }
      : defaultPaginationConfig;
    const autoplay = autoplayProp
      ? { ...defaultAutoplayConfig, ...autoplayProp }
      : defaultAutoplayConfig;

    // Determine modules to use
    const modules = [Navigation, Pagination];
    if (autoplay.enabled) modules.push(Autoplay);
    if (effect === "fade") modules.push(EffectFade);
    if (effect === "coverflow") modules.push(EffectCoverflow);
    if (effect === "flip") modules.push(EffectFlip);
    if (effect === "cube") modules.push(EffectCube);
    if (effect === "cards") modules.push(EffectCards);

    // Handle swiper instance
    const handleSwiper = (swiper: SwiperType) => {
      setSwiperInstance(swiper);
      onSwiper?.(swiper);
    };

    // Convert children to array of slides
    const slides = React.Children.toArray(children);

    // Navigation button classes
    const getNavigationButtonClasses = (isNext = false) => {
      const baseClasses =
        "absolute z-10 size-10 rounded-full bg-white shadow-lg hover:bg-default-600 transition-all bg-default-700 flex items-center justify-center text-default-50 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed";

      if (navigation.position === "outside") {
        return cn(
          baseClasses,
          isNext ? "-right-16" : "-left-16",
          "top-1/2 -translate-y-1/2"
        );
      }

      if (navigation.position === "center") {
        return cn(
          baseClasses,
          isNext ? "right-0" : "left-0",
          "top-1/2 -translate-y-1/2"
        );
      }

      // inside
      return cn(
        baseClasses,
        isNext ? "right-4" : "left-4",
        "top-1/2 -translate-y-1/2"
      );
    };

    return (
      <div ref={ref} className={cn("relative", navigation.spacing, className)}>
        <Swiper
          modules={modules}
          spaceBetween={spaceBetween}
          slidesPerView={slidesPerView}
          loop={loop}
          speed={speed}
          effect={effect}
          autoplay={
            autoplay.enabled
              ? {
                  delay: autoplay.delay,
                  disableOnInteraction: autoplay.disableOnInteraction,
                  pauseOnMouseEnter: autoplay.pauseOnMouseEnter,
                }
              : false
          }
          pagination={
            pagination.enabled && paginationEl
              ? {
                  clickable: pagination.clickable,
                  dynamicBullets: pagination.dynamicBullets,
                  type: pagination.type,
                  el: paginationEl,
                }
              : false
          }
          breakpoints={breakpoints}
          onSwiper={handleSwiper}
          onSlideChange={onSlideChange}
          className="w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className={slideClassName}>
              {slide}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        {navigation.enabled && navigation.showArrows && (
          <>
            {navigation.customPrevButton ? (
              <button
                type="button"
                onClick={() => swiperInstance?.slidePrev()}
                className="absolute z-10"
                aria-label="Previous slide"
              >
                {navigation.customPrevButton}
              </button>
            ) : (
              <button
                onClick={() => swiperInstance?.slidePrev()}
                className={cn(
                  getNavigationButtonClasses(false),
                  navigation.prevClassName
                )}
                aria-label="Previous slide"
                disabled={!swiperInstance}
              >
                <ChevronLeftIcon className="size-4" />
              </button>
            )}

            {navigation.customNextButton ? (
              <button
                type="button"
                onClick={() => swiperInstance?.slideNext()}
                className="absolute z-10"
                aria-label="Next slide"
              >
                {navigation.customNextButton}
              </button>
            ) : (
              <button
                onClick={() => swiperInstance?.slideNext()}
                className={cn(
                  getNavigationButtonClasses(true),
                  navigation.nextClassName
                )}
                aria-label="Next slide"
                disabled={!swiperInstance}
              >
                <ChevronRightIcon className="size-4" />
              </button>
            )}
          </>
        )}

        {/* Pagination Container */}
        {pagination.enabled && (
          <div
            ref={setPaginationEl}
            className={cn(
              "flex justify-center gap-2 mt-8",
              pagination.className
            )}
          />
        )}
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
