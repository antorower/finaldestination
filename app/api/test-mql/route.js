export async function POST(req) {
  try {
    return Response.json({ success: true });
  } catch (error) {
    console.error("Assistant error:", error);
    return Response.json({ success: false }, { status: 500 });
  }
}
