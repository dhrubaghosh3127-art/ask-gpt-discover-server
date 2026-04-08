export type DiscoverCategory =
  | "for-you"
  | "top"
  | "tech-science"
  | "business"
  | "sports"
  | "entertainment"
  | "bangladesh";

export type DiscoverLanguage = "en" | "bn";

export interface DiscoverItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sourceName: string;
  publishedAt: string;
  articleUrl: string;
  category: DiscoverCategory;
  language: DiscoverLanguage;
  region: "global" | "bd";
}

export interface DiscoverResponse {
  ok: true;
  source: "cache" | "fresh";
  fetchedAt: string;
  total: number;
  items: DiscoverItem[];
}

export interface DiscoverErrorResponse {
  ok: false;
  error: string;
}

export interface CachePayload {
  fetchedAt: string;
  items: DiscoverItem[];
}
