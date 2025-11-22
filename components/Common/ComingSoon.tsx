import Image from "next/image";

export interface ComingSoonProps {
  title?: string;
  description?: string;
}

export default function ComingSoon({
  title = "Coming Soon",
  description = "We're working hard to bring you this feature. Stay tuned!",
}: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="flex flex-col items-center gap-8 text-center max-w-md px-6">
        {/* Eduta Logo */}
        <div className="relative w-48 h-16">
          <Image
            src="/logo-main.webp"
            alt="Eduta Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-default-900">{title}</h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
