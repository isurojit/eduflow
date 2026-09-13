"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { ArrowRight, Chrome, LockKeyhole, Sparkles } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { firebaseConfigured, getFirebaseAuth } from "@/lib/firebase/client";
import { useAuth } from "@/components/auth/auth-provider";

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const next = params.get("next") || "/dashboard";

  const finish = () => router.replace(next);
  useEffect(() => { if (!loading && user) finish(); }, [loading, user]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const auth = getFirebaseAuth();
    if (!auth) return setError("Firebase is not configured yet. Add the Firebase values to .env.local.");
    setBusy(true); setError("");
    try {
      if (mode === "signup") {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      finish();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message.replace("Firebase: ", "") : "Authentication failed.");
    } finally { setBusy(false); }
  };

  const google = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return setError("Firebase is not configured yet.");
    setBusy(true); setError("");
    try { await signInWithPopup(auth, new GoogleAuthProvider()); finish(); }
    catch (cause) { setError(cause instanceof Error ? cause.message.replace("Firebase: ", "") : "Google sign-in failed."); }
    finally { setBusy(false); }
  };

  return (
    <main className="min-h-screen bg-[#090708] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-[1200px]">
        <header className="flex items-center justify-between border-b border-white/[0.07] pb-5"><Logo /><span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-[#807478]"><Sparkles className="size-3.5 text-[#A81736]" /> AI Enriched</span></header>
        <section className="grid min-h-[calc(100vh-110px)] items-center gap-12 py-12 lg:grid-cols-[1.05fr_.75fr]">
          <div className="max-w-xl"><p className="text-[10px] uppercase tracking-[.2em] text-[#A81736]">Your learning identity</p><h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl font-semibold tracking-[-.055em] sm:text-6xl">One account. Your entire study history.</h1><p className="mt-5 text-base leading-7 text-[#9f9195]">Firebase secures your sign-in. MongoDB keeps your profile, planner, tests, notes, uploaded documents and AI-enriched learning data available across devices.</p><div className="mt-8 grid gap-3 text-sm text-[#B8AAAE] sm:grid-cols-2"><div className="border-t border-white/[0.08] pt-4">Cloud-synced learning state</div><div className="border-t border-white/[0.08] pt-4">Document-aware AI assistant</div></div></div>
          <div className="border border-white/[0.09] bg-[#0d090a] p-5 sm:p-7">
            {!firebaseConfigured ? <div className="mb-5 border-l-2 border-[#C52845] bg-[#180C10] p-4 text-xs leading-5 text-[#B8AAAE]">Firebase configuration is missing. Copy <code>.env.example</code> to <code>.env.local</code> and add your Firebase web values.</div> : null}
            <div className="flex gap-1 border-b border-white/[0.08]"><button onClick={() => setMode("login")} className={`min-h-11 flex-1 text-sm ${mode === "login" ? "border-b-2 border-[#A81736] text-white" : "text-[#807478]"}`}>Login</button><button onClick={() => setMode("signup")} className={`min-h-11 flex-1 text-sm ${mode === "signup" ? "border-b-2 border-[#A81736] text-white" : "text-[#807478]"}`}>Create account</button></div>
            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "signup" ? <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" className="focus-ring min-h-12 w-full border border-white/[0.1] bg-[#11090B] px-4 text-sm" /> : null}
              <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="Email address" className="focus-ring min-h-12 w-full border border-white/[0.1] bg-[#11090B] px-4 text-sm" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} type="password" placeholder="Password" className="focus-ring min-h-12 w-full border border-white/[0.1] bg-[#11090B] px-4 text-sm" />
              {error ? <p className="text-xs leading-5 text-[#e58b9c]">{error}</p> : null}
              <button disabled={busy || !firebaseConfigured} className="focus-ring flex min-h-12 w-full items-center justify-center gap-2 bg-[#A81736] text-sm font-semibold text-white disabled:opacity-40">{busy ? "Please wait…" : mode === "login" ? "Login to EduFlow" : "Create EduFlow account"}<ArrowRight className="size-4" /></button>
            </form>
            <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[.16em] text-[#62585b]"><span className="h-px flex-1 bg-white/[0.07]" />or<span className="h-px flex-1 bg-white/[0.07]" /></div>
            <button onClick={google} disabled={busy || !firebaseConfigured} className="focus-ring flex min-h-12 w-full items-center justify-center gap-2 border border-white/[0.1] text-sm text-[#D8CDD0] disabled:opacity-40"><Chrome className="size-4" />Continue with Google</button>
            <p className="mt-5 flex items-center gap-2 text-[10px] text-[#62585b]"><LockKeyhole className="size-3.5" />Authentication is handled by Firebase. Passwords are never stored in MongoDB.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function AuthPage() { return <Suspense><AuthForm /></Suspense>; }
