import { GridFSBucket, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { mongoDb } from "@/lib/server/mongo";
import { parseStudentDocument } from "@/lib/server/document-parser";
import { firebaseBucket } from "@/lib/server/firebase-admin";
import type { DocumentKind } from "@/types/cloud";

export const runtime = "nodejs";
const MAX_FILE = 10 * 1024 * 1024;
const ALLOWED = new Set(["application/pdf","text/plain","text/csv","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-excel","image/png","image/jpeg","image/webp"]);

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const db = await mongoDb();
    const docs = await db.collection("documents").find({ ownerUid: user.uid }).sort({ createdAt: -1 }).limit(100).toArray();
    return NextResponse.json({ documents: docs.map(({ _id, ...doc }) => ({ ...doc, id: String(_id) })) });
  } catch (cause) { return NextResponse.json({ error: cause instanceof Error ? cause.message : "Documents unavailable." }, { status: 401 }); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const form = await request.formData();
    const file = form.get("file");
    const requestedKind = String(form.get("kind") || "other") as DocumentKind;
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
    if (file.size <= 0 || file.size > MAX_FILE) return NextResponse.json({ error: "File must be between 1 byte and 10 MB." }, { status: 400 });
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Unsupported file type. Use PDF, DOCX, XLSX, CSV, TXT, PNG, JPG or WebP." }, { status: 415 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseStudentDocument({ buffer, mimeType: file.type, name: file.name, requestedKind });
    const db = await mongoDb();
    const now = new Date().toISOString();
    let storage: "gridfs" | "firebase" = "gridfs";
    let storageId = "";

    const bucket = firebaseBucket();
    if (bucket) {
      try {
        const path = `users/${user.uid}/documents/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const blob = bucket.file(path);
        await blob.save(buffer, { contentType: file.type, resumable: false, metadata: { metadata: { ownerUid: user.uid } } });
        storage = "firebase"; storageId = path;
      } catch { /* fallback to GridFS */ }
    }
    if (!storageId) {
      const grid = new GridFSBucket(db, { bucketName: "student_uploads" });
      const id = new ObjectId();
      await new Promise<void>((resolve, reject) => {
        const stream = grid.openUploadStreamWithId(id, file.name, { contentType: file.type, metadata: { ownerUid: user.uid } });
        stream.on("error", reject); stream.on("finish", () => resolve()); stream.end(buffer);
      });
      storageId = id.toHexString();
    }

    const record = { ownerUid: user.uid, name: file.name, mimeType: file.type, size: file.size, kind: parsed.analysis.suggestedKind || requestedKind, extractedText: parsed.text, analysis: parsed.analysis, storage, storageId, createdAt: now };
    const inserted = await db.collection("documents").insertOne(record);
    return NextResponse.json({ document: { ...record, id: inserted.insertedId.toHexString() } }, { status: 201 });
  } catch (cause) { return NextResponse.json({ error: cause instanceof Error ? cause.message : "Upload failed." }, { status: 500 }); }
}
