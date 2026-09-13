import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { mongoDb } from "@/lib/server/mongo";
import { geminiAgent, geminiConfigured } from "@/lib/server/gemini";
import type { EduFlowState } from "@/types/domain";

export const runtime = "nodejs";

function stateSummary(state: EduFlowState | undefined) {
  if (!state) return "No synced EduFlow state exists yet.";
  const subjects = state.subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    topics: subject.topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      completed: topic.completed,
      bookmarked: topic.bookmarked,
    })),
  }));
  const recentTests = state.testAttempts
    .slice(-10)
    .map((test) => ({
      subject: test.subjectName,
      topic: test.topicName,
      score: test.score,
      date: test.date,
    }));
  const exams = state.exams.map((exam) => ({
    name: exam.name,
    date: exam.date,
    subjectIds: exam.subjectIds,
  }));
  return JSON.stringify({
    profile: state.profile,
    subjects,
    recentTests,
    goals: state.goals,
    exams,
    planner: state.planner,
    recentNotes: state.notes
      .slice(-8)
      .map((note) => ({
        title: note.title,
        body: note.body.slice(0, 500),
        subjectId: note.subjectId,
        topicId: note.topicId,
      })),
  });
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    if (!geminiConfigured())
      return NextResponse.json(
        { error: "Gemini is not configured.", fallback: "local" },
        { status: 503 },
      );
    const body = await request.json();
    const message = String(body?.message || "").trim();
    if (!message)
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    let syncedState: EduFlowState | undefined;

    try {
      const db = await mongoDb();
      const doc = await db.collection("user_states").findOne({ uid: user.uid });
      syncedState = doc?.state as EduFlowState | undefined;
    } catch (error) {
      console.error("MongoDB context unavailable for AI:", error);
    }

    const result = await geminiAgent({
      message,
      stateSummary: stateSummary(syncedState),
      context:
        typeof body?.context === "string"
          ? body.context.slice(0, 1000)
          : undefined,
    });
    return NextResponse.json(result);
  } catch (cause) {
    return NextResponse.json(
      { error: cause instanceof Error ? cause.message : "AI request failed." },
      { status: 500 },
    );
  }
}
