"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Loading() {
  const [isVisible] = useState(true);
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    // Create breathing pulse effect
    let pulseValue = 1;
    let increasing = true;
    const pulseInterval = setInterval(() => {
      if (increasing) {
        pulseValue += 0.01;
        if (pulseValue >= 1.08) increasing = false;
      } else {
        pulseValue -= 0.01;
        if (pulseValue <= 1) increasing = true;
      }
      setPulseScale(pulseValue);
    }, 30);

    return () => clearInterval(pulseInterval);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50",
        "transition-all duration-700 ease-in-out",
        !isVisible && "opacity-0 scale-95"
      )}
    >
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-12 px-4">
        {/* Logo Container with Sophisticated Animation */}
        <div className="relative animate-in fade-in-0 zoom-in-95 duration-700">
          {/* Outer Glow Ring */}
          <div
            className="absolute inset-0 rounded-3xl opacity-40 blur-2xl"
            style={{
              background:
                "radial-gradient(circle, var(--color-primary-400) 0%, transparent 70%)",
              transform: `scale(${pulseScale})`,
              transition: "transform 0.3s ease-out",
            }}
          />

          {/* Logo Card */}
          <div className="relative bg-white/90 backdrop-blur-xl px-12 py-10 rounded-3xl shadow-2xl border border-primary-100/50">
            <Image
              src="/logo-main.webp"
              alt="Eduta"
              width={160}
              height={52}
              priority
              className="relative z-10"
            />

            {/* Inner Glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-100/50 via-transparent to-secondary-100/50 opacity-50" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
          <h2 className="text-3xl font-bold text-primary-900 tracking-tight">
            Welcome to Eduta
          </h2>
          <p className="text-base text-muted-foreground max-w-md mx-auto px-4">
            Preparing your personalized learning experience
          </p>
        </div>

        {/* Animated Loading Indicator */}
        <div className="flex flex-col items-center gap-6 animate-in fade-in-0 duration-700 delay-400">
          {/* Dot Wave Animation */}
          <div className="flex items-center gap-3">
            <div
              className="size-3 bg-primary-600 rounded-full animate-bounce"
              style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
            />
            <div
              className="size-3 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: "160ms", animationDuration: "1.4s" }}
            />
            <div
              className="size-3 bg-primary-400 rounded-full animate-bounce"
              style={{ animationDelay: "320ms", animationDuration: "1.4s" }}
            />
            <div
              className="size-3 bg-secondary-500 rounded-full animate-bounce"
              style={{ animationDelay: "480ms", animationDuration: "1.4s" }}
            />
            <div
              className="size-3 bg-secondary-400 rounded-full animate-bounce"
              style={{ animationDelay: "640ms", animationDuration: "1.4s" }}
            />
          </div>
        </div>

        {/* Bottom Status Text */}
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
          { left: 90, top: 25, delay: 2.5, duration: 17 },
          { left: 35, top: 70, delay: 4, duration: 23 },
          { left: 55, top: 5, delay: 3.5, duration: 16 },
          { left: 70, top: 55, delay: 4.5, duration: 25 },
          { left: 5, top: 45, delay: 1.2, duration: 19 },
          { left: 95, top: 85, delay: 2.8, duration: 20 },
        ].map((particle, i) => (
          <div
            key={i}
            className="absolute size-1 bg-primary-400/30 rounded-full animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute bottom-12 left-0 right-0 text-center animate-in fade-in-0 duration-1000 delay-700">
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="relative flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-success-500" />
            </span>
            <span>Powered by Eduta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
