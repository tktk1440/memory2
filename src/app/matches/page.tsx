import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/db";

export default async function MatchesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.profile?.questionnaireComplete) redirect("/onboarding");

  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: user.id }, { userBId: user.id }] },
    include: {
      userA: { include: { profile: true } },
      userB: { include: { profile: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Your matches</h1>
      {matches.length === 0 ? (
        <p className="text-sm text-neutral-600">
          No matches yet. Head to <Link href="/discover" className="text-rose-600 underline">Discover</Link> to find your compatibility matches.
        </p>
      ) : (
        <ul className="space-y-3">
          {matches.map((m) => {
            const other = m.userAId === user.id ? m.userB : m.userA;
            const lastMessage = m.messages[0];
            return (
              <li key={m.id}>
                <Link
                  href={`/matches/${m.id}`}
                  className="flex items-center justify-between rounded-xl border border-rose-100 bg-white p-4 hover:border-rose-300"
                >
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {other.profile?.name ?? "Someone"}
                    </p>
                    <p className="mt-0.5 text-sm text-neutral-500 line-clamp-1">
                      {lastMessage ? lastMessage.body : "Say hello 👋"}
                    </p>
                  </div>
                  <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
                    {Math.round(m.compatibilityScore)}% match
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
