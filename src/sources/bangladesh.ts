import { fetchRssItems } from "./rss";
import type { DiscoverItem } from "../types";

const BANGLADESH_RSS_SOURCES = [
  "https://www.prothomalo.com/feed/",
  "https://www.thedailystar.net/frontpage/rss.xml",
  "https://bangla.bdnews24.com/?widgetName=rssfeed&widgetId=1151&getXmlFeed=true",
  "https://www.jugantor.com/rss",
];

export async function fetchBangladeshItems(): Promise<DiscoverItem[]> {
  return fetchRssItems(
    BANGLADESH_RSS_SOURCES.map((url) => ({
      url,
      region: "bd" as const,
      language: "bn" as const,
    })),
    "bangladesh",
  );
}
