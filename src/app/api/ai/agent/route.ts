import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { geminiAgent, geminiConfigured } from "@/lib/server/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);

    if (!user?.uid) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    if (!geminiConfigured()) {
      return NextResponse.json(
        {
          error: "Gemini is not configured.",
          fallback: "local",
        },
        { status: 503 },
      );
    }

    const body = await request.json();

    const message = String(body?.message ?? "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    const context =
      typeof body?.context === "string"
        ? body.context.slice(0, 4000)
        : undefined;

    const result = await geminiAgent({
      message,
      stateSummary: "No cloud study state supplied.",
      context,
    });

    return NextResponse.json(result);
  } catch (cause) {
    console.error("AI agent route failed:", cause);

    return NextResponse.json(
      {
        error: cause instanceof Error ? cause.message : "AI request failed.",
        fallback: "local",
      },
      { status: 500 },
    );
  }
}
