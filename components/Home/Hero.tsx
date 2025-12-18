"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Student {
  id: number;
  name: string;
  image: string;
}

interface StudentStats {
  students: Student[];
  learnerCount: string;
}

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  highlights: string[];
  image: string;
  buttonText: string;
  studentStats: StudentStats;
}

interface HeroProps {
  slides: HeroSlide[];
}

export default function Hero({ slides }: HeroProps) {
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
          {slides.map((slide) => (
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

                {/* Highlights */}
                <ul className="space-y-3">
                  {slide.highlights.map((highlight, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-lg text-primary-800"
                    >
                      <span className="text-primary-600 mt-1">✓</span>
                      <span className="font-medium">{highlight}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button - Only show for first slide */}
                {slide.id === 1 && (
                  <div>
                    <Button
                      size="lg"
                      className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                      asChild
                    >
                      <Link href="/topics">{slide.buttonText}</Link>
                    </Button>
                  </div>
                )}

                {/* Students Enrolled Section */}
                <div className="flex items-center gap-4 pt-4">
                  {/* Stacked Profile Images */}
                  <div className="flex -space-x-3">
                    {slide.studentStats.students.map((student, index) => (
                      <Avatar
                        key={student.id}
                        className="size-12 border-2 border-white shadow-md"
                        style={{
                          zIndex: slide.studentStats.students.length - index,
                        }}
                      >
                        <AvatarImage src={student.image} alt={student.name} />
                        <AvatarFallback>{student.name[0]}</AvatarFallback>
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
                      {slide.studentStats.learnerCount} learners enrolled
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
                className="md:w-[40%] w-full h-[40.625rem] object-cover"
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
