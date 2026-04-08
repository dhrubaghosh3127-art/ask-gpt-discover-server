import {
  DISCOVER_CACHE_MS,
  DISCOVER_MAX_CACHE_MS,
  DISCOVER_SERVER_MAX_ITEMS,
} from "./config";
import type { CachePayload, DiscoverItem, DiscoverResponse } from "./types";
import { dedupeById, keepWithinAge, nowMs, sortNewestFirst, toMs } from "./time";

type CacheEnv = {
  DISCOVER_CACHE: KVNamespace;
};

const CACHE_KEY = "discover:feed:v1";

function sanitizeItems(items: DiscoverItem[]): DiscoverItem[] {
  return sortNewestFirst(
    dedupeById(
      keepWithinAge(items, DISCOVER_MAX_CACHE_MS),
    ),
  ).slice(0, DISCOVER_SERVER_MAX_ITEMS);
}

function sanitizePayload(payload: CachePayload | null): CachePayload | null {
  if (!payload) return null;

  const items = sanitizeItems(Array.isArray(payload.items) ? payload.items : []);

  return {
    fetchedAt: payload.fetchedAt,
    items,
  };
}

export async function readDiscoverCache(env: CacheEnv): Promise<CachePayload | null> {
  const payload = await env.DISCOVER_CACHE.get<CachePayload>(CACHE_KEY, {
    type: "json",
  });

  return sanitizePayload(payload);
}

export function shouldRefreshCache(payload: CachePayload | null): boolean {
  if (!payload) return true;

  const fetchedAtMs = toMs(payload.fetchedAt);
  if (!fetchedAtMs) return true;

  return nowMs() - fetchedAtMs >= DISCOVER_CACHE_MS;
}

export async function writeDiscoverCache(
  env: CacheEnv,
  freshItems: DiscoverItem[],
  previousPayload: CachePayload | null,
): Promise<CachePayload> {
  const previousItems = previousPayload?.items ?? [];

  const mergedItems = sanitizeItems([
    ...freshItems,
    ...previousItems,
  ]);

  const nextPayload: CachePayload = {
    fetchedAt: new Date().toISOString(),
    items: mergedItems,
  };

  await env.DISCOVER_CACHE.put(CACHE_KEY, JSON.stringify(nextPayload));

  return nextPayload;
}

export function buildDiscoverResponse(
  payload: CachePayload,
  source: "cache" | "fresh",
): DiscoverResponse {
  return {
    ok: true,
    source,
    fetchedAt: payload.fetchedAt,
    total: payload.items.length,
    items: payload.items,
  };
}
