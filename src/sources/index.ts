import {
  DISCOVER_BANGLADESH_TRIGGER_TARGET,
  DISCOVER_GLOBAL_TRIGGER_TARGET,
  DISCOVER_TRIGGER_TOTAL,
} from "../config";
import { sortNewestFirst, dedupeById } from "../time";
import type { DiscoverItem } from "../types";
import { fetchBangladeshItems } from "./bangladesh";
import { fetchGNewsItems } from "./gnews";

type SourceEnv = {
  GNEWS_API_KEY?: string;
};

export async function fetchDiscoverItems(env: SourceEnv): Promise<DiscoverItem[]> {
  const [globalItems, bangladeshItems] = await Promise.all([
    fetchGNewsItems(env),
    fetchBangladeshItems(),
  ]);

  const pickedGlobal = sortNewestFirst(globalItems).slice(
    0,
    DISCOVER_GLOBAL_TRIGGER_TARGET,
  );

  const pickedBangladesh = sortNewestFirst(bangladeshItems).slice(
    0,
    DISCOVER_BANGLADESH_TRIGGER_TARGET,
  );

  const mixed = dedupeById([
    ...pickedGlobal,
    ...pickedBangladesh,
  ]);

  return sortNewestFirst(mixed).slice(0, DISCOVER_TRIGGER_TOTAL);
}
