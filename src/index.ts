import { buildDiscoverResponse, readDiscoverCache, shouldRefreshCache, writeDiscoverCache } from "./cache";
import { fetchDiscoverItems } from "./sources";

type Env = {
  DISCOVER_CACHE: KVNamespace;
  GNEWS_API_KEY?: string;
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "cache-control": "no-store",
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET, OPTIONS",
          "access-control-allow-headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url);

    if (url.pathname === "/") {
      return jsonResponse({
        ok: true,
        service: "ask-gpt-discover-server",
        message: "Discover worker is running",
      });
    }

    if (url.pathname === "/discover") {
      try {
        const cached = await readDiscoverCache(env);

        if (cached && !shouldRefreshCache(cached)) {
          return jsonResponse(buildDiscoverResponse(cached, "cache"));
        }

        const freshItems = await fetchDiscoverItems({
          GNEWS_API_KEY: env.GNEWS_API_KEY,
        });

        if (freshItems.length > 0) {
          const nextPayload = await writeDiscoverCache(env, freshItems, cached);
          return jsonResponse(buildDiscoverResponse(nextPayload, "fresh"));
        }

        if (cached) {
          return jsonResponse(buildDiscoverResponse(cached, "cache"));
        }

        return jsonResponse(
          {
            ok: false,
            error: "No discover data available yet",
          },
          503,
        );
      } catch (error) {
        return jsonResponse(
          {
            ok: false,
            error: error instanceof Error ? error.message : "Unknown server error",
          },
          500,
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};
