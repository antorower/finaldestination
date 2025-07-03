export async function GET(request, { params }) {
  try {
    const { profit } = await params;

    console.log("Profit", profit);

    return Response.json({ success: "dfs" });
  } catch (error) {
    console.error("Assistant error:", error);
    return Response.json({ success: false }, { status: 500 });
  }
}
