export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({
        success: true,
        service: "LegalEase-AI Backend",
        status: "healthy"
      });
    }

    return Response.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }
};
