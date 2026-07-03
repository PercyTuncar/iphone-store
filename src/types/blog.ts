import { Timestamp } from 'firebase/firestore';

export type BlogPostStatus = 'draft' | 'published';

export interface BlogPostSeo {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  canonicalUrl: string;
}

export interface BlogPost {
  id: string; // Firestore document ID
  title: string;
  slug: string;
  content: string;  // HTML from TipTap editor
  excerpt: string;  // Short summary for listing cards
  featuredImage: string;
  category: string;
  relatedProductSlug: string | null; // slug of iPhone promoted in the post
  status: BlogPostStatus;
  author: string;   // admin's name
  seo: BlogPostSeo;
  createdAt: Timestamp;
  publishedAt: Timestamp | null;
}

/** Lightweight type for listing cards */
export type BlogPostCard = Pick<
  BlogPost,
  | 'id'
  | 'slug'
  | 'title'
  | 'excerpt'
  | 'featuredImage'
  | 'category'
  | 'author'
  | 'publishedAt'
  | 'status'
>;
