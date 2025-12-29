export interface BlogCategory {
  categoryId: string;
  name: string;
  slug: string;
}

export interface BlogTag {
  tagId: string;
  tagName: string;
}

export interface BlogPost {
  blogId: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImageId: number;
  featuredImageUrl: string;
  category: BlogCategory;
  isFeatured: boolean;
  viewsCount: number;
  tags: BlogTag[];
  publishedAt: string;
  createdAt: string;
}

export interface BlogPostDetail extends BlogPost {
  content: string;
  metaTitle: string;
  metaDescription: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  totalPosts?: number; // Backend expects this field
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface BlogListResponse {
  status?: string;
  success?: boolean;
  message?: string;
  data: {
    posts: BlogPost[];
  };
  meta?: Pagination;
  pagination?: Pagination;
}

export interface BlogDetailResponse {
  success: boolean;
  message: string;
  data: BlogPostDetail;
}

export interface BlogFilters {
  categoryId?: string;
  tag?: string;
  search?: string;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
}

