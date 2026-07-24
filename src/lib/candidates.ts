import { prisma } from "@/lib/db";
import { computeCompatibility, passesHardFilters, type MatchProfile } from "@/lib/matching";
import type { Profile } from "@/generated/prisma/client";

function toMatchProfile(userId: string, p: Profile): MatchProfile {
  return {
    userId,
    name: p.name,
    age: p.age,
    gender: p.gender,
    seeking: p.seeking,
    minAgePref: p.minAgePref,
    maxAgePref: p.maxAgePref,
    relationshipGoal: p.relationshipGoal,
    wantsChildren: p.wantsChildren,
    religion: p.religion,
    religionImportance: p.religionImportance,
    politics: p.politics,
    politicsImportance: p.politicsImportance,
    smoking: p.smoking,
    drinking: p.drinking,
    exercise: p.exercise,
    openness: p.openness,
    conscientiousness: p.conscientiousness,
    extraversion: p.extraversion,
    agreeableness: p.agreeableness,
    neuroticism: p.neuroticism,
    attachmentAnxiety: p.attachmentAnxiety,
    attachmentAvoidance: p.attachmentAvoidance,
    attachmentStyle: p.attachmentStyle,
    valuesJson: p.valuesJson,
    loveLanguagesJson: p.loveLanguagesJson,
  };
}

export type Candidate = {
  userId: string;
  name: string;
  age: number;
  bio: string;
  location: string;
  score: ReturnType<typeof computeCompatibility>;
};

/** Ranked list of compatible candidates for `userId` who haven't been liked or passed yet. */
export async function getCandidatesForUser(userId: string): Promise<Candidate[]> {
  const me = await prisma.profile.findUnique({ where: { userId } });
  if (!me || !me.questionnaireComplete) return [];

  const [decidedLikes, decidedPasses] = await Promise.all([
    prisma.like.findMany({ where: { fromUserId: userId }, select: { toUserId: true } }),
    prisma.pass.findMany({ where: { fromUserId: userId }, select: { toUserId: true } }),
  ]);
  const excluded = new Set<string>([userId, ...decidedLikes.map((l) => l.toUserId), ...decidedPasses.map((p) => p.toUserId)]);

  const others = await prisma.profile.findMany({
    where: { questionnaireComplete: true, userId: { notIn: Array.from(excluded) } },
  });

  const meProfile = toMatchProfile(userId, me);

  const scored: Candidate[] = [];
  for (const other of others) {
    const otherProfile = toMatchProfile(other.userId, other);
    const filter = passesHardFilters(meProfile, otherProfile);
    if (!filter.ok) continue;
    const score = computeCompatibility(meProfile, otherProfile);
    scored.push({
      userId: other.userId,
      name: other.name,
      age: other.age,
      bio: other.bio,
      location: other.location,
      score,
    });
  }

  scored.sort((a, b) => b.score.total - a.score.total);
  return scored;
}
