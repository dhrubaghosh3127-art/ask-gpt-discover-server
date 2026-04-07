export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return Response.json({
        ok: true,
        service: "ask-gpt-discover-server",
        message: "Discover worker is running",
      });
    }

    if (url.pathname === "/discover") {
      return Response.json({
        ok: true,
        message: "Discover endpoint placeholder",
        items: [],
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
