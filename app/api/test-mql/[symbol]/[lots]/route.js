export async function GET(request, { params }) {
  try {
    const { symbol, lots } = await params;

    console.log("Symbol", symbol);
    console.log("Lots", lots);

    return Response.json({ success: "dfs" });
  } catch (error) {
    console.error("Assistant error:", error);
    return Response.json({ success: false }, { status: 500 });
  }
}
