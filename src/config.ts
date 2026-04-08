import type { DiscoverCategory } from "./types";

export const DISCOVER_CACHE_MINUTES = 15;
export const DISCOVER_CACHE_MS = DISCOVER_CACHE_MINUTES * 60 * 1000;

export const DISCOVER_MAX_CACHE_HOURS = 24;
export const DISCOVER_MAX_CACHE_MS = DISCOVER_MAX_CACHE_HOURS * 60 * 60 * 1000;

export const DISCOVER_FETCH_TARGET = 40;

/**
 * SERVER:
 * 24h window-এর সব item cache-এ থাকবে
 * তাই এখানে artificial 400 cap দিচ্ছি না
 */
export const DISCOVER_SERVER_MAX_ITEMS = 5000;

/**
 * UI:
 * app side-এ পরে max visible/revealed item cap হবে
 * এটা main repo-তে use হবে, এই server repo-তে না
 */
export const DISCOVER_UI_MAX_ITEMS = 580;

export const DISCOVER_CATEGORIES: DiscoverCategory[] = [
  "for-you",
  "top",
  "tech-science",
  "business",
  "sports",
  "entertainment",
  "bangladesh",
];

export const CATEGORY_LABELS: Record<DiscoverCategory, string> = {
  "for-you": "For You",
  "top": "Top Stories",
  "tech-science": "Tech & Science",
  "business": "Business",
  "sports": "Sports",
  "entertainment": "Entertainment",
  "bangladesh": "Bangladesh",
};

export const ENGLISH_CATEGORIES: DiscoverCategory[] = [
  "top",
  "tech-science",
  "business",
  "sports",
  "entertainment",
];

export const BANGLADESH_CATEGORY: DiscoverCategory = "bangladesh";
