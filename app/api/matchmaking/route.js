import { NextResponse } from "next/server";

export async function GET() {
  console.log("good");
  return NextResponse.json({ ok: true });
}
