"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCategoryStore } from "@/store/useCategoryStore";

function Categories() {
  const { categories, loading, fetchCategories } = useCategoryStore();

  React.useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  if (loading) {
    return (
      <section className="py-12 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-container mx-auto">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-md bg-default-200 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  // Flatten categories to include both parent categories and subcategories
  const allCategories = categories.flatMap((category) => [
    { id: category.categoryId, name: category.name, isParent: true },
    ...category.subcategories.map((sub) => ({
      id: sub.categoryId,
      name: sub.name,
      isParent: false,
    })),
  ]);

  return (
    <section className="py-12 px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-container mx-auto">
        {allCategories.slice(0, 8).map((category) => (
          <CategoryLinkCard
            key={category.id}
            name={category.name}
            categoryId={category.id}
            isParent={category.isParent}
          />
        ))}
      </div>
    </section>
  );
}

export default Categories;

function CategoryLinkCard({
  name,
  categoryId,
}: {
  name: string;
  categoryId: string;
  isParent: boolean;
}) {
  // All categories (parent and sub) link using categoryId format
  const link = `/all-courses?categories=${categoryId}`;

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
