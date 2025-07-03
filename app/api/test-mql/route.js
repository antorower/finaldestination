export async function POST(req) {
  try {
    // const { symbol } = await req.json();
    // const { messages } = await req.json();
    // console.log(req);
    // console.log("Web Request!!!");
    // console.log("Symbol ", symbol);
    // console.log("Lots ", lots);

    const data = await req.json();
    console.log("Web Request!!!", data);

    return Response.json({ success: "dfs" });
  } catch (error) {
    console.error("Assistant error:", error);
    return Response.json({ success: false }, { status: 500 });
  }
}
