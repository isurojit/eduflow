import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { mongoDb } from "@/lib/server/mongo";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const db = await mongoDb();
    const doc = await db.collection("user_states").findOne({ uid: user.uid });
    if (!doc?.state) return NextResponse.json({ error: "No cloud state yet." }, { status: 404 });
    return NextResponse.json({ state: doc.state, updatedAt: doc.updatedAt });
  } catch (cause) {
    return NextResponse.json({ error: cause instanceof Error ? cause.message : "Cloud state unavailable." }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const state = body?.state;
    if (!state || state.version !== 9 || typeof state.updatedAt !== "string") return NextResponse.json({ error: "Invalid EduFlow state payload." }, { status: 400 });
    const db = await mongoDb();
    const now = new Date().toISOString();
    await Promise.all([
      db.collection("user_states").updateOne({ uid: user.uid }, { $set: { uid: user.uid, state, updatedAt: now } }, { upsert: true }),
      db.collection("users").updateOne({ uid: user.uid }, { $set: { uid: user.uid, email: user.email ?? null, displayName: user.name ?? state.profile?.name ?? null, profile: state.profile ?? null, lastSeenAt: now }, $setOnInsert: { createdAt: now } }, { upsert: true }),
    ]);
    return NextResponse.json({ ok: true, updatedAt: now });
  } catch (cause) {
    return NextResponse.json({ error: cause instanceof Error ? cause.message : "Cloud state could not be saved." }, { status: 401 });
  }
}
