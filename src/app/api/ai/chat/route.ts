import { NextResponse } from "next/server";

export async function POST() {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (!provider || provider === "local") {
    return NextResponse.json(
      { error: "Local Study Assistant runs against the student's browser-held EduFlow state. Configure a remote AI provider server-side before using this endpoint." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      error: `AI provider “${provider}” is not configured in this zero-cost prototype. Add its server-side adapter here and keep provider credentials in environment variables only.`,
    },
    { status: 501 },
  );
}
