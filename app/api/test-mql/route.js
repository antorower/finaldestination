export async function POST(req) {
  try {
    const { symbol } = await req.json();

    console.log(req);
    console.log("Web Request!!!");
    console.log("Symbol ", symbol);
    console.log("Lots ", lots);

    return Response.json({ symbol: symbol });
  } catch (error) {
    console.error("Assistant error:", error);
    return Response.json({ success: false }, { status: 500 });
  }
}
