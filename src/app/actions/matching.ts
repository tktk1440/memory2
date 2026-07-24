"use server";

import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { computeCompatibility } from "@/lib/matching";
import { revalidatePath } from "next/cache";

function pairKey(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function likeUserAction(
  targetUserId: string
): Promise<{ matched: boolean; matchId?: string; error?: string }> {
  const userId = await getSessionUserId();
  if (!userId) return { matched: false, error: "Not signed in." };
  if (userId === targetUserId) return { matched: false, error: "Invalid target." };

  await prisma.like.upsert({
    where: { fromUserId_toUserId: { fromUserId: userId, toUserId: targetUserId } },
    create: { fromUserId: userId, toUserId: targetUserId },
    update: {},
  });

  const reciprocal = await prisma.like.findUnique({
    where: { fromUserId_toUserId: { fromUserId: targetUserId, toUserId: userId } },
  });

  let matched = false;
  let matchId: string | undefined;
  if (reciprocal) {
    const [userAId, userBId] = pairKey(userId, targetUserId);
    const [profileA, profileB] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: userAId } }),
      prisma.profile.findUnique({ where: { userId: userBId } }),
    ]);
    if (profileA && profileB) {
      const score = computeCompatibility(
        { ...profileA, userId: userAId },
        { ...profileB, userId: userBId }
      );
      const match = await prisma.match.upsert({
        where: { userAId_userBId: { userAId, userBId } },
        create: {
          userAId,
          userBId,
          compatibilityScore: score.total,
          scoreBreakdownJson: JSON.stringify(score),
        },
        update: {},
      });
      matched = true;
      matchId = match.id;
    }
  }

  revalidatePath("/discover");
  revalidatePath("/matches");
  return { matched, matchId };
}

export async function passUserAction(targetUserId: string): Promise<{ error?: string }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Not signed in." };

  await prisma.pass.upsert({
    where: { fromUserId_toUserId: { fromUserId: userId, toUserId: targetUserId } },
    create: { fromUserId: userId, toUserId: targetUserId },
    update: {},
  });

  revalidatePath("/discover");
  return {};
}

export async function sendMessageAction(matchId: string, body: string): Promise<{ error?: string }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Not signed in." };
  const trimmed = body.trim();
  if (!trimmed) return { error: "Message can't be empty." };
  if (trimmed.length > 2000) return { error: "Message is too long." };

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || (match.userAId !== userId && match.userBId !== userId)) {
    return { error: "Match not found." };
  }

  await prisma.message.create({ data: { matchId, senderId: userId, body: trimmed } });
  revalidatePath(`/matches/${matchId}`);
  return {};
}
