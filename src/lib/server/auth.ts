import { verifyFirebaseBearer } from "@/lib/server/firebase-admin";

export async function requireUser(request: Request) {
  const decoded = await verifyFirebaseBearer(request);
  return { uid: decoded.uid, email: decoded.email, name: decoded.name };
}
