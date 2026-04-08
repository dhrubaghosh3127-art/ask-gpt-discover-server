import type { DiscoverCategory, DiscoverItem, DiscoverLanguage } from "./types";

type SpecificCategory = Exclude<DiscoverCategory, "for-you">;

interface CreateDiscoverItemInput {
  title: string;
  description?: string;
  imageUrl?: string;
  sourceName?: string;
  publishedAt?: string;
  articleUrl?: string;
  language: DiscoverLanguage;
  region: "global" | "bd";
  forcedCategory?: SpecificCategory;
}

function cleanText(value: string | undefined | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeUrl(value: string | undefined | null): string {
  const url = cleanText(value);
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return "";
}

function buildStableId(articleUrl: string, title: string, publishedAt: string): string {
  const base = `${articleUrl}|${title}|${publishedAt}`;
  let hash = 0;

  for (let i = 0; i < base.length; i += 1) {
    hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
  }

  return `discover_${hash.toString(36)}`;
}

function normalizePublishedAt(value: string | undefined | null): string {
  const raw = cleanText(value);
  if (!raw) return new Date().toISOString();

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return date.toISOString();
}

function normalizeSourceName(value: string | undefined | null): string {
  const source = cleanText(value);
  return source || "Unknown Source";
}

function inferGlobalCategory(title: string, description: string): SpecificCategory {
  const text = `${title} ${description}`.toLowerCase();

  if (
    /\b(ai|artificial intelligence|openai|anthropic|google|microsoft|apple|meta|startup|software|chip|robot|science|research|space|nasa|quantum|cyber|tech|technology)\b/.test(
      text,
    )
  ) {
    return "tech-science";
  }

  if (
    /\b(stock|market|business|economy|economic|finance|bank|bitcoin|crypto|trade|company|companies|investment|earnings|revenue)\b/.test(
      text,
    )
  ) {
    return "business";
  }

  if (
    /\b(match|cricket|football|soccer|fifa|uefa|ipl|bpl|nba|nfl|sports|tournament|goal|runs|wicket|olympic|tennis)\b/.test(
      text,
    )
  ) {
    return "sports";
  }

  if (
    /\b(movie|film|music|celebrity|show|series|netflix|hollywood|bollywood|entertainment|actor|actress|concert)\b/.test(
      text,
    )
  ) {
    return "entertainment";
  }

  return "top";
}

export function createDiscoverItem(input: CreateDiscoverItemInput): DiscoverItem | null {
  const title = cleanText(input.title);
  const description = cleanText(input.description);
  const articleUrl = normalizeUrl(input.articleUrl);
  const imageUrl = normalizeUrl(input.imageUrl);
  const sourceName = normalizeSourceName(input.sourceName);
  const publishedAt = normalizePublishedAt(input.publishedAt);

  if (!title || !articleUrl) {
    return null;
  }

  const category: SpecificCategory =
    input.forcedCategory ??
    (input.region === "bd" ? "bangladesh" : inferGlobalCategory(title, description));

  return {
    id: buildStableId(articleUrl, title, publishedAt),
    title,
    description,
    imageUrl,
    sourceName,
    publishedAt,
    articleUrl,
    category,
    language: input.language,
    region: input.region,
  };
}

export function normalizeBatch(items: Array<CreateDiscoverItemInput>): DiscoverItem[] {
  const output: DiscoverItem[] = [];

  for (const item of items) {
    const normalized = createDiscoverItem(item);
    if (normalized) output.push(normalized);
  }

  return output;
}
