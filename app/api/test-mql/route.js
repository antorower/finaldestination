export async function GET(req) {
  try {
    console.error("Web Request!!!");
    const { symbol, lots } = req.query;
    console.log("Symbol ", symbol);
    console.log("Lots ", lots);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Assistant error:", error);
    return Response.json({ success: false }, { status: 500 });
  }
}
