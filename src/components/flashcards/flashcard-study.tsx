"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers3,
  RotateCcw,
  Shuffle,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { buildFlashcards } from "@/lib/flashcards/cards";
import { useEduFlowStore } from "@/store/use-eduflow-store";
import type { Subject, Topic } from "@/types/domain";

export function FlashcardStudy({ subject, topic }: { subject: Subject; topic: Topic }) {
  const store = useEduFlowStore();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const base = useMemo(
    () => buildFlashcards(subject.id, topic.id, subject.name, topic.name),
    [subject.id, subject.name, topic.id, topic.name],
  );

  const progress = store.flashcardProgress[topic.id];
  const initial = Math.max(0, base.findIndex((card) => card.id === progress?.lastCardId));
  const [cards, setCards] = useState(base);
  const [index, setIndex] = useState(initial);
  const [flipped, setFlipped] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [sessionRatedIds, setSessionRatedIds] = useState<string[]>([]);

  const availableDecks = useMemo(
    () =>
      store.subjects.flatMap((candidateSubject) =>
        candidateSubject.topics
          .map((candidateTopic) => ({
            subject: candidateSubject,
            topic: candidateTopic,
            cards: buildFlashcards(
              candidateSubject.id,
              candidateTopic.id,
              candidateSubject.name,
              candidateTopic.name,
            ),
          }))
          .filter((deck) => deck.cards.length > 0),
      ),
    [store.subjects],
  );

  const currentDeckIndex = availableDecks.findIndex(
    (deck) => deck.subject.id === subject.id && deck.topic.id === topic.id,
  );
  const nextDeck = currentDeckIndex >= 0 ? availableDecks[currentDeckIndex + 1] : undefined;

  const card = cards[index];

  if (!card) {
    return (
      <main className="min-h-screen">
        <AppHeader name={store.profile?.name} context="Flashcards" />
        <div className="mx-auto max-w-[900px] px-4 py-12">
          <Link href={`/subjects/${subject.id}/topics/${topic.id}`} className="text-xs text-[#807478]">
            ← Back to topic
          </Link>
          <h1 className="mt-8 text-3xl font-semibold">Flashcards unavailable.</h1>
          <p className="mt-3 text-sm text-[#9f9195]">
            EduFlow does not invent cards for unsupported custom topics.
          </p>
        </div>
      </main>
    );
  }

  const status = progress?.knownCardIds.includes(card.id)
    ? "Known"
    : progress?.reviewCardIds.includes(card.id)
      ? "Review again"
      : "Unrated";

  const move = (next: number) => {
    if (next < 0 || next >= cards.length) return;
    setIndex(next);
    setFlipped(false);
    store.setFlashcardLastSeen(topic.id, cards[next].id);
  };

  const rate = (rating: "known" | "review") => {
    store.setFlashcardRating(topic.id, card.id, rating);

    const ratedIds = new Set([...sessionRatedIds, card.id]);
    setSessionRatedIds([...ratedIds]);

    const deckComplete = cards.every((candidate) => ratedIds.has(candidate.id));

    if (deckComplete) {
      setFlipped(false);
      setShowCompletion(true);
      return;
    }

    // Move to the next unrated card rather than ever wrapping back to card 1.
    const nextUnratedIndex = cards.findIndex(
      (candidate, candidateIndex) => candidateIndex > index && !ratedIds.has(candidate.id),
    );
    const firstUnratedIndex = cards.findIndex((candidate) => !ratedIds.has(candidate.id));
    const target = nextUnratedIndex >= 0 ? nextUnratedIndex : firstUnratedIndex;

    if (target >= 0) move(target);
  };

  const shuffle = () => {
    const next = [...cards].sort(() => Math.random() - 0.5);
    setCards(next);
    setIndex(0);
    setFlipped(false);
    setShowCompletion(false);
    setSessionRatedIds([]);
    store.setFlashcardLastSeen(topic.id, next[0].id);
  };

  const reviewDeck = () => {
    setShowCompletion(false);
    setSessionRatedIds([]);
    setIndex(0);
    setFlipped(false);
    store.setFlashcardLastSeen(topic.id, cards[0].id);
  };

  const goToNextTopic = () => {
    if (!nextDeck) {
      router.push("/flashcards");
      return;
    }
    router.push(`/flashcards/${nextDeck.subject.id}/${nextDeck.topic.id}`);
  };

  const knownCount = progress?.knownCardIds.length ?? 0;
  const reviewCount = progress?.reviewCardIds.length ?? 0;

  return (
    <main className="min-h-screen">
      <AppHeader name={store.profile?.name} context="Flashcards" />
      <div className="mx-auto max-w-[980px] px-4 py-8 sm:px-7 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/subjects/${subject.id}/topics/${topic.id}`}
            className="focus-ring inline-flex min-h-10 items-center gap-2 text-xs text-[#807478]"
          >
            <ArrowLeft className="size-3.5" /> {topic.name}
          </Link>
          <div className="flex gap-2">
            <button
              onClick={shuffle}
              className="focus-ring inline-flex min-h-10 items-center gap-2 border border-white/[0.1] px-3 text-xs"
            >
              <Shuffle className="size-3.5" /> Shuffle
            </button>
            <button
              onClick={() => {
                store.resetFlashcardProgress(topic.id);
                setIndex(0);
                setFlipped(false);
                setShowCompletion(false);
                setSessionRatedIds([]);
              }}
              className="focus-ring inline-flex min-h-10 items-center gap-2 border border-white/[0.1] px-3 text-xs"
            >
              <RotateCcw className="size-3.5" /> Reset progress
            </button>
          </div>
        </div>

        <section className="mt-7 text-center">
          <p className="text-[10px] uppercase tracking-[.18em] text-[#807478]">
            {subject.name} · Card {index + 1} of {cards.length}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em]">{topic.name}</h1>
          <p className="mt-2 text-xs text-[#807478]">
            {knownCount} known · {reviewCount} review again
          </p>
        </section>

        <div className="mx-auto mt-8 max-w-2xl">
          <button
            onClick={() => setFlipped((value) => !value)}
            className="focus-ring block w-full text-left"
            aria-label="Flip flashcard"
          >
            <motion.div
              key={`${card.id}-${flipped}`}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid min-h-[290px] place-items-center border border-white/[0.1] bg-[#11090B] p-8 shadow-2xl sm:min-h-[330px]"
            >
              <div className="text-center">
                <p className="text-[9px] uppercase tracking-[.18em] text-[#78152A]">
                  {flipped ? "Answer" : "Concept"} · {status}
                </p>
                {flipped ? (
                  <p className="mt-7 whitespace-pre-line text-base leading-7 text-[#D8CDD0]">{card.back}</p>
                ) : (
                  <p className="mt-7 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-.045em] sm:text-4xl">
                    {card.front}
                  </p>
                )}
                <p className="mt-8 text-[11px] text-[#807478]">
                  Tap the card to {flipped ? "see the concept" : "reveal the answer"}
                </p>
              </div>
            </motion.div>
          </button>

          <div className="mt-4 grid grid-cols-[auto_1fr_auto] gap-2">
            <button
              onClick={() => move(index - 1)}
              disabled={index === 0}
              className="focus-ring min-h-11 border border-white/[0.1] px-4 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous card"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => rate("review")}
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 border border-[#78152A] px-3 text-xs text-[#E1BBC4]"
              >
                <ThumbsDown className="size-4" />
                <span className="sm:hidden">Review</span>
                <span className="hidden sm:inline">Review again</span>
              </button>
              <button
                onClick={() => rate("known")}
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 bg-[#A81736] px-3 text-xs font-semibold"
              >
                <ThumbsUp className="size-4" />
                <span className="sm:hidden">Know</span>
                <span className="hidden sm:inline">Know it</span>
              </button>
            </div>
            <button
              onClick={() => move(index + 1)}
              disabled={index === cards.length - 1}
              className="focus-ring min-h-11 border border-white/[0.1] px-4 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next card"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCompletion ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/65 px-3 backdrop-blur-[5px] sm:items-center sm:px-6"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCompletion(false)}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="flashcard-complete-title"
              initial={reduceMotion ? false : { y: "100%", opacity: 0.7 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 310, damping: 30 }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-xl overflow-hidden rounded-t-[28px] border border-white/[0.1] bg-[#11090B] px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-5 shadow-[0_-24px_80px_rgba(0,0,0,.55)] sm:rounded-[28px] sm:p-7"
            >
              <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-white/15 sm:hidden" />

              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C52845]/70 to-transparent" />
              <div className="flex items-start gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-full border border-[#A81736]/30 bg-[#4A0D1A]/50">
                  <CheckCircle2 className="size-6 text-[#D65770]" />
                </div>
                <div>
                  <p className="flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-[#A96A78]">
                    <Sparkles className="size-3" /> Deck complete
                  </p>
                  <h2 id="flashcard-complete-title" className="mt-2 text-2xl font-semibold tracking-[-.04em] sm:text-3xl">
                    Nice work on {topic.name}.
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#9f9195]">
                    You reviewed all {cards.length} cards. Choose the next topic to keep your momentum going.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 border-y border-white/[0.08] py-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[.16em] text-[#807478]">Know it</p>
                  <p className="mt-1 text-xl font-semibold">{knownCount}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[.16em] text-[#807478]">Review again</p>
                  <p className="mt-1 text-xl font-semibold">{reviewCount}</p>
                </div>
              </div>

              {nextDeck ? (
                <div className="mt-6 rounded-2xl border border-[#78152A]/35 bg-[#180C10] p-4 sm:p-5">
                  <p className="text-[10px] uppercase tracking-[.18em] text-[#A96A78]">Up next</p>
                  <div className="mt-3 flex items-start gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#4A0D1A]">
                      <Layers3 className="size-4 text-[#D9A1AE]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">{nextDeck.topic.name}</p>
                      <p className="mt-1 text-xs text-[#807478]">
                        {nextDeck.subject.name} · {nextDeck.cards.length} cards
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={goToNextTopic}
                    className="focus-ring mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#A81736] px-5 text-sm font-semibold transition hover:bg-[#C52845]"
                  >
                    Continue to next topic <ArrowRight className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-[#78152A]/35 bg-[#180C10] p-5 text-center">
                  <Sparkles className="mx-auto size-5 text-[#C52845]" />
                  <p className="mt-3 font-semibold">You’ve reached the end of your available decks.</p>
                  <p className="mt-1 text-xs leading-5 text-[#807478]">Return to Flashcards to revisit any topic whenever you want.</p>
                  <button
                    onClick={goToNextTopic}
                    className="focus-ring mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#A81736] px-5 text-sm font-semibold"
                  >
                    View all flashcards <ArrowRight className="size-4" />
                  </button>
                </div>
              )}

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  onClick={reviewDeck}
                  className="focus-ring min-h-11 rounded-xl border border-white/[0.1] px-4 text-xs font-medium text-[#D8CDD0]"
                >
                  Review this deck
                </button>
                <button
                  onClick={() => router.push(`/subjects/${subject.id}/topics/${topic.id}`)}
                  className="focus-ring min-h-11 rounded-xl border border-white/[0.1] px-4 text-xs font-medium text-[#D8CDD0]"
                >
                  Back to topic
                </button>
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
