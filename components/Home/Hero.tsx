"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CONSTANTS } from "@/lib/constants";

export default function Hero() {
  return (
    <section className="relative flex flex-col gap-14 bg-white pb-12 md:pb-20 overflow-hidden lg:mt-16 mt-20 md:px-6">
      {/* Container */}
      <div className="relative w-full max-w-container mx-auto">
        {/* Slider Component */}
        <Slider
          loop={true}
          autoplay={{
            enabled: false,
            delay: 5000,
            disableOnInteraction: false,
          }}
          navigation={{
            enabled: true,
            position: "center",
            showArrows: true,
            spacing: "md:pl-14 px-0 md:pr-5 ",
          }}
          pagination={{
            enabled: true,
            clickable: true,
            type: "bullets",
            className: "hero-pagination",
          }}
        >
          {CONSTANTS.HERO_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="flex md:flex-row flex-col-reverse gap-12 items-center bg-white w-full"
            >
              {/* Left Side - Content */}
              <div className="space-y-8 animate-in fade-in-0 slide-in-from-left-5 duration-700 md:w-[60%] w-full px-10">
                {/* Main Heading */}
                <h1 className="sm:text-4xl text-3xl md:text-6xl font-semibold text-primary-900 leading-tight">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="text-2xl text-muted-foreground">
                  {slide.subtitle}
                </p>

                {/* Description */}
                <p className="text-2xl font-semibold text-primary-800">
                  {slide.description}
                </p>

                {/* CTA Button */}
                <div>
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    {slide.buttonText}
                  </Button>
                </div>

                {/* Students Enrolled Section */}
                <div className="flex items-center gap-4 pt-4">
                  {/* Stacked Profile Images */}
                  <div className="flex -space-x-3">
                    {CONSTANTS.STUDENT_PROFILES.map((student, index) => (
                      <Avatar
                        key={student.id}
                        className="size-12 border-2 border-white shadow-md"
                        style={{
                          zIndex: CONSTANTS.STUDENT_PROFILES.length - index,
                        }}
                      >
                        <AvatarImage src={student.image} alt={student.name} />
                        <AvatarFallback>S{student.id}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>

                  {/* Rating and Enrollment Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className="size-4 fill-warning-300 text-warning-300"
                        />
                      ))}
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      100+ students enrolled
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side - Image */}

              <Image
                src={slide.image}
                alt={slide.title}
                width={650}
                height={650}
                className="md:w-[40%] w-full md:min-h-[40.625rem] h-full object-cover"
                priority
              />
            </div>
          ))}
        </Slider>
      </div>
      <div className="max-w-container mx-auto px-6">
        <Image
          src="/imgs/logos.png"
          alt="companies"
          width={887}
          height={32}
          className="object-cover w-full h-auto md:w-[55.4375rem] md:h-[2rem] "
          priority
        />
      </div>
    </section>
  );
}
