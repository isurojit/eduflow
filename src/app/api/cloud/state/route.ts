import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { mongoDb } from "@/lib/server/mongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);

    const db = await mongoDb();

    const doc = await db.collection("user_states").findOne({ uid: user.uid });

    if (!doc?.state) {
      return NextResponse.json(
        { error: "No cloud state yet." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      state: doc.state,
      updatedAt: doc.updatedAt,
    });
  } catch (cause) {
    console.error("Cloud state GET failed:", cause);

    return NextResponse.json(
      {
        error:
          cause instanceof Error ? cause.message : "Cloud state unavailable.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser(request);

    const body = await request.json();

    const state = body?.state;
    const expectedUpdatedAt =
      typeof body?.expectedUpdatedAt === "string"
        ? body.expectedUpdatedAt
        : null;

    if (!state || state.version !== 9 || typeof state.updatedAt !== "string") {
      return NextResponse.json(
        { error: "Invalid EduFlow state payload." },
        { status: 400 },
      );
    }

    const db = await mongoDb();
    const collection = db.collection("user_states");

    const existing = await collection.findOne({
      uid: user.uid,
    });

    if (existing?.state) {
      if (expectedUpdatedAt && existing.updatedAt !== expectedUpdatedAt) {
        return NextResponse.json(
          {
            error: "Cloud state conflict.",
            conflict: true,
            state: existing.state,
            updatedAt: existing.updatedAt,
          },
          { status: 409 },
        );
      }
    }

    const now = new Date().toISOString();

    await Promise.all([
      collection.updateOne(
        { uid: user.uid },
        {
          $set: {
            uid: user.uid,
            state,
            updatedAt: now,
          },
        },
        { upsert: true },
      ),

      db.collection("users").updateOne(
        { uid: user.uid },
        {
          $set: {
            uid: user.uid,
            email: user.email ?? null,
            displayName: user.name ?? state.profile?.name ?? null,
            profile: state.profile ?? null,
            lastSeenAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true },
      ),
    ]);

    return NextResponse.json({
      ok: true,
      updatedAt: now,
    });
  } catch (cause) {
    console.error("Cloud state PUT failed:", cause);

    return NextResponse.json(
      {
        error:
          cause instanceof Error
            ? cause.message
            : "Cloud state could not be saved.",
      },
      { status: 500 },
    );
  }
}
