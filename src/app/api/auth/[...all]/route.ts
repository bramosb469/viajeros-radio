import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ error: "Auth handled by server" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ error: "Auth handled by server" }, { status: 501 });
}
