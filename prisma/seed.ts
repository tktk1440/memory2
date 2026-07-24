import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { ALL_LIKERT_QUESTIONS } from "../src/lib/questions";
import { computeBigFive, computeAttachment, computeValues, computeLoveLanguages, type AnswerMap } from "../src/lib/scoring";
import { computeCompatibility } from "../src/lib/matching";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });
const PASSWORD = "password123";

type Targets = Record<string, number>; // dimension -> 1..5 trait level

function buildAnswers(targets: Targets): AnswerMap {
  const out: AnswerMap = {};
  for (const q of ALL_LIKERT_QUESTIONS) {
    const t = targets[q.dimension] ?? 3;
    const v = q.reverse ? 6 - t : t;
    out[q.id] = Math.max(1, Math.min(5, Math.round(v)));
  }
  return out;
}

type SeedUser = {
  email: string;
  name: string;
  age: number;
  gender: string;
  seeking: string[];
  bio: string;
  location: string;
  minAgePref: number;
  maxAgePref: number;
  relationshipGoal: string;
  wantsChildren: string;
  religion: string;
  religionImportance: number;
  politics: string;
  politicsImportance: number;
  smoking: string;
  drinking: string;
  exercise: string;
  targets: Targets;
};

const USERS: SeedUser[] = [
  {
    email: "demo@kindred.app",
    name: "Jamie",
    age: 29,
    gender: "woman",
    seeking: ["man"],
    bio: "Product designer who loves hiking, board games, and a good bookstore.",
    location: "Portland, OR",
    minAgePref: 26,
    maxAgePref: 40,
    relationshipGoal: "long_term",
    wantsChildren: "yes",
    religion: "none",
    religionImportance: 1,
    politics: "moderate",
    politicsImportance: 2,
    smoking: "never",
    drinking: "socially",
    exercise: "often",
    targets: {
      openness: 4, conscientiousness: 4, extraversion: 3, agreeableness: 5, neuroticism: 2,
      anxiety: 2, avoidance: 2,
      family: 5, ambition: 3, adventure: 3, security: 4, tradition: 2, altruism: 4, independence: 3, wellness: 4,
      words_of_affirmation: 4, quality_time: 5, acts_of_service: 3, physical_touch: 3, receiving_gifts: 2,
    },
  },
  {
    email: "ben@kindred.app",
    name: "Ben",
    age: 31,
    gender: "man",
    seeking: ["woman"],
    bio: "Civil engineer, weekend chef, training for a half marathon.",
    location: "Portland, OR",
    minAgePref: 24,
    maxAgePref: 36,
    relationshipGoal: "long_term",
    wantsChildren: "yes",
    religion: "none",
    religionImportance: 1,
    politics: "moderate",
    politicsImportance: 2,
    smoking: "never",
    drinking: "socially",
    exercise: "often",
    targets: {
      openness: 4, conscientiousness: 5, extraversion: 3, agreeableness: 5, neuroticism: 2,
      anxiety: 2, avoidance: 2,
      family: 5, ambition: 3, adventure: 3, security: 4, tradition: 2, altruism: 4, independence: 3, wellness: 5,
      words_of_affirmation: 3, quality_time: 5, acts_of_service: 4, physical_touch: 3, receiving_gifts: 2,
    },
  },
  {
    email: "frank@kindred.app",
    name: "Frank",
    age: 28,
    gender: "man",
    seeking: ["woman"],
    bio: "Freelance photographer. Always planning the next trip.",
    location: "Seattle, WA",
    minAgePref: 24,
    maxAgePref: 34,
    relationshipGoal: "long_term",
    wantsChildren: "unsure",
    religion: "none",
    religionImportance: 1,
    politics: "progressive",
    politicsImportance: 2,
    smoking: "sometimes",
    drinking: "socially",
    exercise: "sometimes",
    targets: {
      openness: 5, conscientiousness: 3, extraversion: 4, agreeableness: 4, neuroticism: 3,
      anxiety: 3, avoidance: 2,
      family: 3, ambition: 3, adventure: 5, security: 2, tradition: 1, altruism: 3, independence: 4, wellness: 3,
      words_of_affirmation: 4, quality_time: 4, acts_of_service: 2, physical_touch: 4, receiving_gifts: 3,
    },
  },
  {
    email: "henry@kindred.app",
    name: "Henry",
    age: 33,
    gender: "man",
    seeking: ["woman"],
    bio: "Between jobs, figuring things out, love live music.",
    location: "Portland, OR",
    minAgePref: 23,
    maxAgePref: 38,
    relationshipGoal: "short_term",
    wantsChildren: "unsure",
    religion: "none",
    religionImportance: 1,
    politics: "moderate",
    politicsImportance: 1,
    smoking: "regularly",
    drinking: "regularly",
    exercise: "never",
    targets: {
      openness: 3, conscientiousness: 2, extraversion: 3, agreeableness: 2, neuroticism: 5,
      anxiety: 5, avoidance: 4,
      family: 2, ambition: 2, adventure: 3, security: 2, tradition: 1, altruism: 2, independence: 3, wellness: 1,
      words_of_affirmation: 3, quality_time: 3, acts_of_service: 2, physical_touch: 4, receiving_gifts: 2,
    },
  },
  {
    email: "marcus@kindred.app",
    name: "Marcus",
    age: 46,
    gender: "man",
    seeking: ["woman"],
    bio: "Empty nester, love sailing and good wine.",
    location: "Portland, OR",
    minAgePref: 35,
    maxAgePref: 55,
    relationshipGoal: "long_term",
    wantsChildren: "have_dont_want_more",
    religion: "christian",
    religionImportance: 3,
    politics: "conservative",
    politicsImportance: 3,
    smoking: "never",
    drinking: "socially",
    exercise: "sometimes",
    targets: {
      openness: 3, conscientiousness: 4, extraversion: 3, agreeableness: 4, neuroticism: 2,
      anxiety: 2, avoidance: 3,
      family: 4, ambition: 4, adventure: 2, security: 5, tradition: 4, altruism: 3, independence: 3, wellness: 3,
      words_of_affirmation: 3, quality_time: 4, acts_of_service: 4, physical_touch: 2, receiving_gifts: 3,
    },
  },
  {
    email: "david@kindred.app",
    name: "David",
    age: 34,
    gender: "man",
    seeking: ["woman"],
    bio: "Software engineer. Keep it casual, not looking to settle down.",
    location: "Portland, OR",
    minAgePref: 25,
    maxAgePref: 40,
    relationshipGoal: "casual",
    wantsChildren: "no",
    religion: "none",
    religionImportance: 1,
    politics: "libertarian",
    politicsImportance: 2,
    smoking: "never",
    drinking: "socially",
    exercise: "sometimes",
    targets: {
      openness: 4, conscientiousness: 3, extraversion: 2, agreeableness: 2, neuroticism: 3,
      anxiety: 2, avoidance: 5,
      family: 1, ambition: 5, adventure: 3, security: 3, tradition: 1, altruism: 2, independence: 5, wellness: 3,
      words_of_affirmation: 2, quality_time: 2, acts_of_service: 2, physical_touch: 3, receiving_gifts: 2,
    },
  },
  {
    email: "carla@kindred.app",
    name: "Carla",
    age: 27,
    gender: "woman",
    seeking: ["man"],
    bio: "Nurse, dog mom, love true crime podcasts.",
    location: "Denver, CO",
    minAgePref: 25,
    maxAgePref: 38,
    relationshipGoal: "casual",
    wantsChildren: "no",
    religion: "none",
    religionImportance: 1,
    politics: "progressive",
    politicsImportance: 2,
    smoking: "never",
    drinking: "socially",
    exercise: "sometimes",
    targets: {
      openness: 3, conscientiousness: 3, extraversion: 3, agreeableness: 3, neuroticism: 4,
      anxiety: 4, avoidance: 2,
      family: 2, ambition: 3, adventure: 2, security: 3, tradition: 2, altruism: 3, independence: 3, wellness: 3,
      words_of_affirmation: 4, quality_time: 4, acts_of_service: 3, physical_touch: 3, receiving_gifts: 3,
    },
  },
  {
    email: "elena@kindred.app",
    name: "Elena",
    age: 30,
    gender: "woman",
    seeking: ["man"],
    bio: "Marketing lead, amateur rock climber, always up for a road trip.",
    location: "Seattle, WA",
    minAgePref: 27,
    maxAgePref: 38,
    relationshipGoal: "long_term",
    wantsChildren: "unsure",
    religion: "none",
    religionImportance: 1,
    politics: "progressive",
    politicsImportance: 2,
    smoking: "never",
    drinking: "socially",
    exercise: "often",
    targets: {
      openness: 5, conscientiousness: 4, extraversion: 4, agreeableness: 4, neuroticism: 2,
      anxiety: 2, avoidance: 2,
      family: 3, ambition: 4, adventure: 5, security: 2, tradition: 1, altruism: 3, independence: 4, wellness: 4,
      words_of_affirmation: 3, quality_time: 4, acts_of_service: 3, physical_touch: 3, receiving_gifts: 2,
    },
  },
  {
    email: "grace@kindred.app",
    name: "Grace",
    age: 29,
    gender: "nonbinary",
    seeking: ["man", "woman", "nonbinary"],
    bio: "Community organizer and part-time potter.",
    location: "Portland, OR",
    minAgePref: 25,
    maxAgePref: 40,
    relationshipGoal: "marriage",
    wantsChildren: "yes",
    religion: "buddhist",
    religionImportance: 3,
    politics: "progressive",
    politicsImportance: 3,
    smoking: "never",
    drinking: "never",
    exercise: "sometimes",
    targets: {
      openness: 4, conscientiousness: 4, extraversion: 3, agreeableness: 5, neuroticism: 2,
      anxiety: 2, avoidance: 2,
      family: 4, ambition: 2, adventure: 3, security: 3, tradition: 2, altruism: 5, independence: 3, wellness: 4,
      words_of_affirmation: 4, quality_time: 4, acts_of_service: 4, physical_touch: 3, receiving_gifts: 2,
    },
  },
];

async function main() {
  console.log("Seeding demo data...");
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const ids: Record<string, string> = {};

  for (const u of USERS) {
    const answers = buildAnswers(u.targets);
    const bigFive = computeBigFive(answers);
    const attachment = computeAttachment(answers);
    const values = computeValues(answers);
    const loveLanguages = computeLoveLanguages(answers);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      create: { email: u.email, passwordHash },
      update: { passwordHash },
    });
    ids[u.email] = user.id;

    await prisma.questionResponse.deleteMany({ where: { userId: user.id } });
    await prisma.$transaction(
      Object.entries(answers).map(([questionId, value]) =>
        prisma.questionResponse.create({ data: { userId: user.id, questionId, value } })
      )
    );

    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        name: u.name,
        age: u.age,
        gender: u.gender,
        seeking: u.seeking.join(","),
        bio: u.bio,
        location: u.location,
        minAgePref: u.minAgePref,
        maxAgePref: u.maxAgePref,
        relationshipGoal: u.relationshipGoal,
        wantsChildren: u.wantsChildren,
        religion: u.religion,
        religionImportance: u.religionImportance,
        politics: u.politics,
        politicsImportance: u.politicsImportance,
        smoking: u.smoking,
        drinking: u.drinking,
        exercise: u.exercise,
        onboardingComplete: true,
        questionnaireComplete: true,
        ...bigFive,
        ...attachment,
        valuesJson: JSON.stringify(values),
        loveLanguagesJson: JSON.stringify(loveLanguages),
      },
      update: {
        name: u.name,
        age: u.age,
        gender: u.gender,
        seeking: u.seeking.join(","),
        bio: u.bio,
        location: u.location,
        minAgePref: u.minAgePref,
        maxAgePref: u.maxAgePref,
        relationshipGoal: u.relationshipGoal,
        wantsChildren: u.wantsChildren,
        religion: u.religion,
        religionImportance: u.religionImportance,
        politics: u.politics,
        politicsImportance: u.politicsImportance,
        smoking: u.smoking,
        drinking: u.drinking,
        exercise: u.exercise,
        onboardingComplete: true,
        questionnaireComplete: true,
        ...bigFive,
        ...attachment,
        valuesJson: JSON.stringify(values),
        loveLanguagesJson: JSON.stringify(loveLanguages),
      },
    });
  }

  // Pre-seed a mutual match between demo (Jamie) and Ben with a couple of messages.
  const jamieId = ids["demo@kindred.app"];
  const benId = ids["ben@kindred.app"];

  await prisma.like.upsert({
    where: { fromUserId_toUserId: { fromUserId: jamieId, toUserId: benId } },
    create: { fromUserId: jamieId, toUserId: benId },
    update: {},
  });
  await prisma.like.upsert({
    where: { fromUserId_toUserId: { fromUserId: benId, toUserId: jamieId } },
    create: { fromUserId: benId, toUserId: jamieId },
    update: {},
  });

  const [userAId, userBId] = jamieId < benId ? [jamieId, benId] : [benId, jamieId];
  const [profileA, profileB] = await Promise.all([
    prisma.profile.findUniqueOrThrow({ where: { userId: userAId } }),
    prisma.profile.findUniqueOrThrow({ where: { userId: userBId } }),
  ]);
  const score = computeCompatibility({ ...profileA, userId: userAId }, { ...profileB, userId: userBId });

  const match = await prisma.match.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    create: {
      userAId,
      userBId,
      compatibilityScore: score.total,
      scoreBreakdownJson: JSON.stringify(score),
    },
    update: { compatibilityScore: score.total, scoreBreakdownJson: JSON.stringify(score) },
  });

  const existingMessages = await prisma.message.count({ where: { matchId: match.id } });
  if (existingMessages === 0) {
    await prisma.message.createMany({
      data: [
        { matchId: match.id, senderId: benId, body: "Hey Jamie! Loved your bio — half marathon training going well?" },
        { matchId: match.id, senderId: jamieId, body: "It's going okay, my knees disagree sometimes 😅 How's the cooking going?" },
      ],
    });
  }

  console.log(`Seeded ${USERS.length} users. Log in as demo@kindred.app / ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
