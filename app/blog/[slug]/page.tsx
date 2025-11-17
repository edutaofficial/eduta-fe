"use client";

import { useParams } from "next/navigation";
import { BlogDetailPage } from "@/components/Blog";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  return <BlogDetailPage slug={slug} />;
}
