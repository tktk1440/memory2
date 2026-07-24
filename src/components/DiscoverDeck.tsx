"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { likeUserAction, passUserAction } from "@/app/actions/matching";
import { ScoreBar } from "@/components/ScoreBar";
import type { Candidate } from "@/lib/candidates";

export function DiscoverDeck({ candidates }: { candidates: Candidate[] }) {
  const [queue, setQueue] = useState(candidates);
  const [pending, startTransition] = useTransition();
  const [matchInfo, setMatchInfo] = useState<{ name: string; matchId: string } | null>(null);

  const current = queue[0];

  function advance() {
    setQueue((q) => q.slice(1));
  }

  function handlePass() {
    if (!current) return;
    startTransition(async () => {
      await passUserAction(current.userId);
      advance();
    });
  }

  function handleLike() {
    if (!current) return;
    startTransition(async () => {
      const res = await likeUserAction(current.userId);
      if (res.matched && res.matchId) {
        setMatchInfo({ name: current.name, matchId: res.matchId });
      }
      advance();
    });
  }

  if (!current) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-white p-10 text-center">
        <p className="text-lg font-semibold">You&apos;re all caught up</p>
        <p className="mt-1 text-sm text-neutral-600">
          No more compatible profiles right now — check back later, or review your{" "}
          <Link href="/matches" className="text-rose-600 underline">matches</Link>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              {current.name}, {current.age}
            </h2>
            {current.location && <p className="text-sm text-neutral-500">{current.location}</p>}
          </div>
          <div className="rounded-full bg-rose-600 px-3 py-1 text-sm font-bold text-white">
            {current.score.total}% match
          </div>
        </div>

        {current.bio && <p className="mt-3 text-sm text-neutral-700">{current.bio}</p>}

        <div className="mt-5 space-y-3">
          <ScoreBar label="Attachment security" value={current.score.attachment} />
          <ScoreBar label="Personality fit" value={current.score.bigFive} />
          <ScoreBar label="Shared values" value={current.score.values} />
          <ScoreBar label="Lifestyle & goals" value={current.score.lifestyle} />
          <ScoreBar label="Love language" value={current.score.loveLanguage} />
        </div>

        <ul className="mt-4 space-y-1 text-xs text-neutral-500">
          {current.score.reasons.map((r, i) => (
            <li key={i}>• {r}</li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex justify-center gap-4">
        <button
          onClick={handlePass}
          disabled={pending}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-300 text-2xl hover:bg-neutral-100 disabled:opacity-50"
          aria-label="Pass"
        >
          ✕
        </button>
        <button
          onClick={handleLike}
          disabled={pending}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-2xl text-white hover:bg-rose-700 disabled:opacity-50"
          aria-label="Like"
        >
          ♥
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-neutral-400">{queue.length - 1} more after this</p>

      {matchInfo && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
            <p className="text-3xl">💞</p>
            <h3 className="mt-2 text-xl font-bold">It&apos;s a match!</h3>
            <p className="mt-1 text-sm text-neutral-600">
              You and {matchInfo.name} liked each other.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href={`/matches/${matchInfo.matchId}`}
                className="rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Send a message
              </Link>
              <button
                onClick={() => setMatchInfo(null)}
                className="rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700"
              >
                Keep browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
