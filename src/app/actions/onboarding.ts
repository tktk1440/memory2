"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { ALL_LIKERT_QUESTIONS } from "@/lib/questions";
import { computeBigFive, computeAttachment, computeValues, computeLoveLanguages, type AnswerMap } from "@/lib/scoring";

export type ActionState = { error?: string } | undefined;

const basicsSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(60),
  age: z.coerce.number().int().min(18, "You must be 18 or older.").max(100),
  gender: z.enum(["man", "woman", "nonbinary"]),
  seeking: z.array(z.enum(["man", "woman", "nonbinary"])).min(1, "Pick at least one preference."),
  bio: z.string().trim().max(500).optional().default(""),
  location: z.string().trim().max(120).optional().default(""),
  minAgePref: z.coerce.number().int().min(18).max(100),
  maxAgePref: z.coerce.number().int().min(18).max(100),
  relationshipGoal: z.enum(["long_term", "marriage", "short_term", "casual", "unsure"]),
  wantsChildren: z.enum(["yes", "no", "unsure", "have_want_more", "have_dont_want_more"]),
  religion: z.string().trim().max(60).optional().default(""),
  religionImportance: z.coerce.number().int().min(1).max(5),
  politics: z.string().trim().max(60).optional().default(""),
  politicsImportance: z.coerce.number().int().min(1).max(5),
  smoking: z.enum(["never", "sometimes", "regularly"]),
  drinking: z.enum(["never", "socially", "regularly"]),
  exercise: z.enum(["never", "sometimes", "often"]),
});

export async function saveBasicsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const raw = Object.fromEntries(formData.entries());
  const parsed = basicsSchema.safeParse({
    ...raw,
    seeking: formData.getAll("seeking"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your answers." };
  }
  const data = parsed.data;
  if (data.minAgePref > data.maxAgePref) {
    return { error: "Minimum age preference must be less than or equal to maximum." };
  }

  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      name: data.name,
      age: data.age,
      gender: data.gender,
      seeking: data.seeking.join(","),
      bio: data.bio,
      location: data.location,
      minAgePref: data.minAgePref,
      maxAgePref: data.maxAgePref,
      relationshipGoal: data.relationshipGoal,
      wantsChildren: data.wantsChildren,
      religion: data.religion,
      religionImportance: data.religionImportance,
      politics: data.politics,
      politicsImportance: data.politicsImportance,
      smoking: data.smoking,
      drinking: data.drinking,
      exercise: data.exercise,
      onboardingComplete: true,
    },
    update: {
      name: data.name,
      age: data.age,
      gender: data.gender,
      seeking: data.seeking.join(","),
      bio: data.bio,
      location: data.location,
      minAgePref: data.minAgePref,
      maxAgePref: data.maxAgePref,
      relationshipGoal: data.relationshipGoal,
      wantsChildren: data.wantsChildren,
      religion: data.religion,
      religionImportance: data.religionImportance,
      politics: data.politics,
      politicsImportance: data.politicsImportance,
      smoking: data.smoking,
      drinking: data.drinking,
      exercise: data.exercise,
      onboardingComplete: true,
    },
  });

  redirect("/onboarding/questions");
}

export async function submitQuestionnaireAction(
  answers: AnswerMap
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await getSessionUserId();
  if (!userId) return { ok: false, error: "Not signed in." };

  const validIds = new Set(ALL_LIKERT_QUESTIONS.map((q) => q.id));
  const entries = Object.entries(answers).filter(
    ([id, val]) => validIds.has(id) && Number.isInteger(val) && val >= 1 && val <= 5
  );
  if (entries.length < ALL_LIKERT_QUESTIONS.length) {
    return { ok: false, error: "Please answer every question before finishing." };
  }

  await prisma.$transaction(
    entries.map(([questionId, value]) =>
      prisma.questionResponse.upsert({
        where: { userId_questionId: { userId, questionId } },
        create: { userId, questionId, value },
        update: { value },
      })
    )
  );

  const answerMap: AnswerMap = Object.fromEntries(entries);
  const bigFive = computeBigFive(answerMap);
  const attachment = computeAttachment(answerMap);
  const values = computeValues(answerMap);
  const loveLanguages = computeLoveLanguages(answerMap);

  await prisma.profile.update({
    where: { userId },
    data: {
      ...bigFive,
      ...attachment,
      valuesJson: JSON.stringify(values),
      loveLanguagesJson: JSON.stringify(loveLanguages),
      questionnaireComplete: true,
    },
  });

  return { ok: true };
}
