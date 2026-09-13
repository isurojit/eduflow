import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { searchResearch } from "@/lib/server/research";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const query = new URL(request.url).searchParams.get("q")?.trim() || "";
    if (query.length < 2) return NextResponse.json({ results: [] });
    return NextResponse.json({ results: await searchResearch(query) });
  } catch (cause) { return NextResponse.json({ error: cause instanceof Error ? cause.message : "Research search failed." }, { status: 500 }); }
}
