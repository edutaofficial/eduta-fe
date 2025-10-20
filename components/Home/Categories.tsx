import { CONSTANTS } from "@/lib/constants";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

function Categories() {
  return (
    <section className="py-12 px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-4 max-w-container mx-auto">
        {CONSTANTS.CATEGORIES.map((category) => (
          <CategoryLinkCard
            key={category.id}
            name={category.name}
            link={category.href}
          />
        ))}
      </div>
    </section>
  );
}

export default Categories;

function CategoryLinkCard({ name, link }: { name: string; link: string }) {
  return (
    <Link
      href={link}
      className="flex py-8 px-4 shadow-md hover:shadow-lg rounded-md justify-between bg-default-50 transition-colors cursor-pointer"
    >
      <h3 className="text-xl font-normal text-default-800">{name}</h3>

      <ChevronRight className="size-6 text-default-800" />
    </Link>
  );
}
