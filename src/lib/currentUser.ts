import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  return user;
}
