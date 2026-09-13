import { z } from "zod";
import type { AgentResponse, DocumentAnalysis } from "@/types/cloud";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";

export function geminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

async function generate(contents: unknown[], responseSchema?: object) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured.");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const response = await fetch(`${GEMINI_ENDPOINT}/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents,
      generationConfig: responseSchema ? { responseMimeType: "application/json", responseSchema } : undefined,
    }),
  });
  if (!response.ok) throw new Error(`Gemini request failed (${response.status}).`);
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("")?.trim();
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}

const agentSchema = z.object({
  message: z.string().min(1),
  actions: z.array(z.discriminatedUnion("type", [
    z.object({ type: z.literal("navigate"), href: z.string(), label: z.string().optional() }),
    z.object({ type: z.literal("set_study_minutes"), minutes: z.number().int().min(10).max(720) }),
    z.object({ type: z.literal("add_goal"), goalType: z.enum(["study_minutes", "topics", "tests", "score"]), period: z.enum(["daily", "weekly"]), target: z.number().positive() }),
    z.object({ type: z.literal("add_exam"), name: z.string(), date: z.string(), subjectIds: z.array(z.string()) }),
    z.object({ type: z.literal("create_note"), title: z.string(), body: z.string(), subjectId: z.string().optional(), topicId: z.string().optional() }),
    z.object({ type: z.literal("complete_topic"), subjectId: z.string(), topicId: z.string() }),
    z.object({ type: z.literal("bookmark_topic"), subjectId: z.string(), topicId: z.string() }),
    z.object({ type: z.literal("start_focus"), subjectId: z.string(), topicId: z.string(), minutes: z.number().int().min(1).max(720).optional() }),
    z.object({ type: z.literal("research"), query: z.string() }),
  ])).max(5),
});

const actionJsonSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
    actions: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["navigate","set_study_minutes","add_goal","add_exam","create_note","complete_topic","bookmark_topic","start_focus","research"] },
          href: { type: "string" }, label: { type: "string" }, minutes: { type: "integer" }, goalType: { type: "string" }, period: { type: "string" }, target: { type: "number" }, name: { type: "string" }, date: { type: "string" }, subjectIds: { type: "array", items: { type: "string" } }, title: { type: "string" }, body: { type: "string" }, subjectId: { type: "string" }, topicId: { type: "string" }, query: { type: "string" },
        },
        required: ["type"],
      },
    },
  },
  required: ["message", "actions"],
};

export async function geminiAgent(input: { message: string; stateSummary: string; context?: string }): Promise<AgentResponse> {
  const prompt = `You are EduFlow AI, an action-capable study copilot. Be concise, practical and honest.\n\nStudent/app context:\n${input.stateSummary}\n${input.context ? `Current screen context: ${input.context}\n` : ""}\nUser request: ${input.message}\n\nYou may propose actions only when the request clearly asks for them. Never invent subject IDs/topic IDs; use only IDs present in context. For destructive or state-changing actions, explain what will happen. If the user is asking for external/current knowledge, return a research action. If no action is needed, return an empty actions array.`;
  const text = await generate([{ role: "user", parts: [{ text: prompt }] }], actionJsonSchema);
  const parsed = agentSchema.parse(JSON.parse(text));
  return { ...parsed, source: "gemini" };
}

const analysisSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()).default([]),
  suggestedKind: z.enum(["notes","syllabus","marksheet","question-paper","other"]),
  marks: z.array(z.object({ subject: z.string(), score: z.number().optional(), maximum: z.number().optional(), grade: z.string().optional() })).optional(),
  syllabus: z.array(z.object({ name: z.string(), topics: z.array(z.string()) })).optional(),
  noteTitle: z.string().optional(),
  noteBody: z.string().optional(),
});

const analysisJsonSchema = {
  type: "object",
  properties: {
    summary: { type: "string" }, keyPoints: { type: "array", items: { type: "string" } },
    suggestedKind: { type: "string", enum: ["notes","syllabus","marksheet","question-paper","other"] },
    marks: { type: "array", items: { type: "object", properties: { subject: { type: "string" }, score: { type: "number" }, maximum: { type: "number" }, grade: { type: "string" } }, required: ["subject"] } },
    syllabus: { type: "array", items: { type: "object", properties: { name: { type: "string" }, topics: { type: "array", items: { type: "string" } } }, required: ["name","topics"] } },
    noteTitle: { type: "string" }, noteBody: { type: "string" },
  },
  required: ["summary","keyPoints","suggestedKind"],
};

export async function geminiAnalyzeDocument(input: { name: string; mimeType: string; text?: string; buffer?: Buffer }): Promise<DocumentAnalysis> {
  const parts: unknown[] = [{ text: `Analyze this student document named "${input.name}". Detect whether it is notes, syllabus, marksheet, question paper or other. Extract only information actually present. For a syllabus, group subjects and topics. For a marksheet, extract subject scores/maximum/grades. For notes, create a useful clean note body. Do not invent missing values.` }];
  if (input.text?.trim()) parts.push({ text: input.text.slice(0, 120_000) });
  else if (input.buffer) parts.push({ inlineData: { mimeType: input.mimeType, data: input.buffer.toString("base64") } });
  const text = await generate([{ role: "user", parts }], analysisJsonSchema);
  return analysisSchema.parse(JSON.parse(text));
}
