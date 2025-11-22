import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { CONSTANTS } from "@/lib/constants";
import { StarIcon, PlayIcon } from "lucide-react";
import Image from "next/image";

function Testimonials() {
  return (
    <section className="w-full mx-auto py-16 space-y-14">
      {/* Top Badge + Headings */}
      <div className="space-y-4 text-center md:text-left max-w-container mx-auto md:px-6 px-4">
        <div className="flex flex-col items-center md:items-start gap-6">
          <Badge variant="destructive">Student Reviews</Badge>
          <h2 className="text-2xl md:text-4xl font-semibold text-default-900">
            What Our Students Say
          </h2>
          <p className="text-default-700 md:text-2xl text-lg max-w-3xl">
            Hear from real students who transformed their careers with our
            courses. Watch their success stories and join thousands of satisfied
            learners.
          </p>
        </div>

        <Slider
          slidesPerView={1}
          spaceBetween={16}
          navigation={{
            enabled: true,
            position: "center",
            showArrows: true,
            spacing: "",
          }}
          slideClassName="py-4"
          pagination={{
            enabled: false,
          }}
        >
          {CONSTANTS.TESTIMONIALS.map((testimonial) => (
            <TestimonialsCards
              key={testimonial.id}
              reviewHeading={testimonial.reviewHeading}
              reviewDescription={testimonial.reviewDescription}
              videoLink={testimonial.videoLink}
              thumbnailLink={testimonial.thumbnailLink}
              userName={testimonial.userName}
              ratingCount={testimonial.ratingCount}
            />
          ))}
        </Slider>
      </div>
    </section>
  );
}

export default Testimonials;

interface TestimonialsCardsProps {
  reviewHeading: string;
  reviewDescription: string;
  videoLink: string;
  thumbnailLink: string;
  userName: string;
  ratingCount: number;
}

function TestimonialsCards({
  reviewHeading,
  reviewDescription,
  videoLink,
  thumbnailLink,
  userName,
  ratingCount,
}: TestimonialsCardsProps) {
  return (
    <div className="bg-default-50 rounded-2xl shadow-lg p-8 md:p-12 flex flex-col-reverse lg:flex-row gap-8 items-center min-h-96">
      {/* Left side - Review content */}
      <div className="flex-1 space-y-6 w-full lg:w-1/2">
        <h3 className="text-2xl md:text-3xl font-bold text-default-900">
          {reviewHeading}
        </h3>
        <p className="text-lg text-default-700 leading-relaxed">
          {reviewDescription}
        </p>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-default-900">{userName}</span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => {
              const isFullStar = i < Math.floor(ratingCount);
              const isHalfStar =
                i === Math.floor(ratingCount) && ratingCount % 1 !== 0;
              const isEmpty = i >= Math.ceil(ratingCount);

              return (
                <div key={i} className="relative size-5">
                  {isFullStar && (
                    <StarIcon className="size-5 fill-warning-400 text-warning-400" />
                  )}
                  {isHalfStar && (
                    <>
                      {/* Empty star base */}
                      <StarIcon className="size-5 text-default-300" />
                      {/* Half-filled star overlay */}
                      <div className="absolute inset-0 overflow-hidden w-1/2">
                        <StarIcon className="size-5 fill-warning-400 text-warning-400" />
                      </div>
                    </>
                  )}
                  {isEmpty && <StarIcon className="size-5 text-default-300" />}
                </div>
              );
            })}
            <span className="ml-2 text-sm text-default-600">
              {ratingCount}/5
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Video thumbnail */}
      <div className="hidden relative min-h-64 w-full lg:w-1/2 h-full lg:min-h-96 rounded-xl overflow-hidden group cursor-pointer">
        <Image
          src={thumbnailLink}
          alt="Video thumbnail"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
            <PlayIcon className="size-8 text-primary-600" />
          </div>
        </div>
        <a
          href={videoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0"
          aria-label="Watch video testimonial"
        />
      </div>
    </div>
  );
}
