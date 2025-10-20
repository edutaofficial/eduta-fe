"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CodeIcon,
  RocketIcon,
  WrenchIcon,
  HomeIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from "lucide-react";

export default function UnderDevelopment() {
  const [progress] = React.useState(65);

  const features = [
    {
      icon: CodeIcon,
      title: "Clean Code",
      description: "Building with best practices",
    },
    {
      icon: SparklesIcon,
      title: "Amazing UI",
      description: "Crafting beautiful interfaces",
    },
    {
      icon: RocketIcon,
      title: "Fast Performance",
      description: "Optimizing for speed",
    },
  ];

  return (
    <div className="min-h-screen mt-20 flex items-center justify-center p-4 bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 size-96 bg-primary-200 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 left-20 size-[32rem] bg-secondary-200 rounded-full blur-3xl opacity-20 animate-pulse delay-700" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[40rem] bg-primary-100 rounded-full blur-3xl opacity-10 animate-ping"
          style={{ animationDuration: "3s" }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { left: 10, top: 20, delay: 0, duration: 18 },
          { left: 25, top: 60, delay: 1, duration: 22 },
          { left: 45, top: 15, delay: 2, duration: 20 },
          { left: 65, top: 80, delay: 0.5, duration: 19 },
          { left: 80, top: 40, delay: 3, duration: 24 },
          { left: 15, top: 90, delay: 1.5, duration: 21 },
        ].map((particle, i) => (
          <div
            key={i}
            className="absolute size-1.5 bg-primary-400/30 rounded-full animate-pulse"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl animate-in fade-in-0 zoom-in-95 duration-700">
        <Card className="border-primary-200 bg-white/90 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-4">
            {/* Logo */}
            <div className="flex justify-center mb-6 animate-in zoom-in-95 fade-in-0 duration-500">
              <Link
                href="/"
                className="inline-block transition-transform hover:scale-105"
              >
                <Image
                  src="/logo-main.webp"
                  alt="Eduta Logo"
                  width={140}
                  height={45}
                  priority
                />
              </Link>
            </div>

            {/* Construction Icon with Animation */}
            <div className="flex justify-center mb-6 animate-in zoom-in-50 fade-in-0 duration-500 delay-100">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-200 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600 size-24 rounded-full flex items-center justify-center shadow-lg">
                  <WrenchIcon className="size-12 animate-bounce" />
                </div>
              </div>
            </div>

            <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-4 animate-in slide-in-from-top-5 fade-in-0 duration-500 delay-200">
              Under Development
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto animate-in slide-in-from-bottom-5 fade-in-0 duration-500 delay-300">
              We&apos;re working hard to bring you something amazing. This page
              is currently being crafted with care and attention to detail.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Progress Section */}
            <div className="animate-in fade-in-0 duration-500 delay-400">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">
                  Development Progress
                </span>
                <span className="text-sm font-bold text-primary-600">
                  {progress}%
                </span>
              </div>
              <div className="relative h-3 bg-primary-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 animate-in fade-in-0 duration-500 delay-500">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center p-6 rounded-lg bg-gradient-to-br from-primary-50 to-secondary-50 hover:shadow-md transition-all hover:scale-105"
                  >
                    <div className="size-12 rounded-full bg-primary-600 text-white flex items-center justify-center mb-4">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-in fade-in-0 duration-500 delay-600">
              <Button
                asChild
                size="lg"
                className="gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Link href="/">
                  <HomeIcon className="size-4" />
                  Back to Home
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 border-primary-300 hover:bg-primary-50 transition-all"
              >
                <Link href="/contact">
                  <ArrowLeftIcon className="size-4 rotate-180" />
                  Contact Us
                </Link>
              </Button>
            </div>

            {/* Info Box */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center animate-in fade-in-0 duration-500 delay-700">
              <p className="text-sm text-muted-foreground mb-2">
                <span className="font-semibold text-foreground">
                  Stay Updated!
                </span>{" "}
                This page will be live soon with amazing features.
              </p>
              <p className="text-xs text-muted-foreground">
                Follow us on social media for the latest updates.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Decorative Element */}
        <div className="mt-8 text-center animate-in fade-in-0 duration-1000 delay-1000">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary-600" />
            </span>
            Actively being developed by the Eduta team
          </p>
        </div>
      </div>
    </div>
  );
}
