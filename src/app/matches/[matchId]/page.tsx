import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/db";
import { ChatThread } from "@/components/ChatThread";
import { ScoreBar } from "@/components/ScoreBar";

export default async function MatchChatPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      userA: { include: { profile: true } },
      userB: { include: { profile: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!match || (match.userAId !== user.id && match.userBId !== user.id)) notFound();

  const other = match.userAId === user.id ? match.userB : match.userA;
  const breakdown = JSON.parse(match.scoreBreakdownJson || "{}");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/matches" className="text-sm text-rose-600 hover:underline">
        ← All matches
      </Link>
      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">
          {other.profile?.name ?? "Match"}, {other.profile?.age}
        </h1>
        <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-600">
          {Math.round(match.compatibilityScore)}% match
        </span>
      </div>

      {breakdown.attachment != null && (
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-rose-100 bg-white p-4 sm:grid-cols-1">
          <ScoreBar label="Attachment security" value={breakdown.attachment} />
          <ScoreBar label="Personality fit" value={breakdown.bigFive} />
          <ScoreBar label="Shared values" value={breakdown.values} />
          <ScoreBar label="Lifestyle & goals" value={breakdown.lifestyle} />
        </div>
      )}

      <div className="mt-4">
        <ChatThread
          matchId={match.id}
          currentUserId={user.id}
          otherName={other.profile?.name ?? "your match"}
          initialMessages={match.messages.map((m) => ({
            id: m.id,
            body: m.body,
            senderId: m.senderId,
            createdAt: m.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
