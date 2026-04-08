import { normalizeBatch } from "../normalize";
import type { DiscoverItem } from "../types";

interface RssSource {
  url: string;
  region: "global" | "bd";
  language: "en" | "bn";
}

function stripCdata(value: string): string {
  return value.replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1").trim();
}

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getTagValue(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeXml(stripCdata(match[1])) : "";
}

function getMediaContent(block: string): string {
  const mediaContentMatch = block.match(/<media:content[^>]+url="([^"]+)"/i);
  if (mediaContentMatch?.[1]) return mediaContentMatch[1];

  const enclosureMatch = block.match(/<enclosure[^>]+url="([^"]+)"/i);
  if (enclosureMatch?.[1]) return enclosureMatch[1];

  const mediaThumbnailMatch = block.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
  if (mediaThumbnailMatch?.[1]) return mediaThumbnailMatch[1];

  return "";
}

function parseItems(xml: string): string[] {
  const matches = xml.match(/<item\b[\s\S]*?<\/item>/gi);
  return matches ?? [];
}

export async function fetchRssItems(
  sources: RssSource[],
  forcedCategory?: Exclude<DiscoverItem["category"], "for-you">,
): Promise<DiscoverItem[]> {
  const allNormalized: DiscoverItem[] = [];

  for (const source of sources) {
    try {
      const response = await fetch(source.url, {
        headers: {
          "user-agent": "ASK-GPT-Discover/1.0",
          accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        },
      });

      if (!response.ok) continue;

      const xml = await response.text();
      const itemBlocks = parseItems(xml);

      const normalized = normalizeBatch(
        itemBlocks.map((block) => ({
          title: getTagValue(block, "title"),
          description:
            getTagValue(block, "description") ||
            getTagValue(block, "content:encoded"),
          imageUrl: getMediaContent(block),
          sourceName: getTagValue(block, "source") || new URL(source.url).hostname,
          publishedAt: getTagValue(block, "pubDate"),
          articleUrl: getTagValue(block, "link"),
          language: source.language,
          region: source.region,
          forcedCategory,
        })),
      );

      allNormalized.push(...normalized);
    } catch {
      // ignore source failure
    }
  }

  return allNormalized;
}
