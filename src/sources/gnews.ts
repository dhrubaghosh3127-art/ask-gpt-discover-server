import { normalizeBatch } from "../normalize";
import type { DiscoverItem } from "../types";

type GNewsArticle = {
  title?: string;
  description?: string;
  image?: string;
  publishedAt?: string;
  url?: string;
  source?: {
    name?: string;
  };
};

type GNewsResponse = {
  articles?: GNewsArticle[];
};

const GNEWS_ENDPOINT = "https://gnews.io/api/v4/top-headlines";

type GNewsEnv = {
  GNEWS_API_KEY?: string;
};

export async function fetchGNewsItems(env: GNewsEnv): Promise<DiscoverItem[]> {
  if (!env.GNEWS_API_KEY) {
    return [];
  }

  try {
    const url = new URL(GNEWS_ENDPOINT);
    url.searchParams.set("token", env.GNEWS_API_KEY);
    url.searchParams.set("lang", "en");
    url.searchParams.set("max", "10");
    url.searchParams.set("topic", "world");

    const response = await fetch(url.toString(), {
      headers: {
        "user-agent": "ASK-GPT-Discover/1.0",
        accept: "application/json",
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as GNewsResponse;
    const articles = Array.isArray(data.articles) ? data.articles : [];

    return normalizeBatch(
      articles.map((article) => ({
        title: article.title ?? "",
        description: article.description ?? "",
        imageUrl: article.image ?? "",
        sourceName: article.source?.name ?? "GNews",
        publishedAt: article.publishedAt ?? "",
        articleUrl: article.url ?? "",
        language: "en" as const,
        region: "global" as const,
        forcedCategory: "top" as const,
      })),
    );
  } catch {
    return [];
  }
      }
