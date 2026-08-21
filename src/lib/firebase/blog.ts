/**
 * Firestore CRUD for the `blog_posts` collection
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './config';
import type { BlogPost, BlogPostCard } from '@/types/blog';

const COLLECTION = 'blog_posts';

function toPost(id: string, data: DocumentData): BlogPost {
  return { id, ...data } as BlogPost;
}

/** Get a post by slug (published only — for public pages) */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const q = query(
    collection(db, COLLECTION),
    where('slug', '==', slug),
    where('status', '==', 'published')
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return toPost(snap.docs[0].id, snap.docs[0].data());
}

/** Get all published posts — for blog listing and sitemap */
export async function getAllPublishedPosts(): Promise<BlogPostCard[]> {
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', 'published')
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        featuredImage: data.featuredImage,
        category: data.category,
        author: data.author,
        publishedAt: data.publishedAt,
        status: data.status,
      } as BlogPostCard;
    })
    .sort((a, b) => {
      const aTime = typeof a.publishedAt?.toDate === 'function' ? a.publishedAt.toDate().getTime() : 0;
      const bTime = typeof b.publishedAt?.toDate === 'function' ? b.publishedAt.toDate().getTime() : 0;
      return bTime - aTime;
    });
}

/** Get all posts (all statuses) — for admin */
export async function getAllPosts(): Promise<BlogPost[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toPost(d.id, d.data()));
}

/** Get a post by Firestore ID — for admin edit page */
export async function getPostById(id: string): Promise<BlogPost | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return toPost(snap.id, snap.data());
}

/** Create a new post — returns generated ID */
export async function createPost(
  data: Omit<BlogPost, 'id' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update post fields */
export async function updatePost(
  id: string,
  data: Partial<Omit<BlogPost, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

/** Publish a post */
export async function publishPost(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: 'published',
    publishedAt: serverTimestamp(),
  });
}

/** Permanently delete a post */
export async function deletePost(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
