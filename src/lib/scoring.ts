import {
  BIG_FIVE_QUESTIONS,
  ATTACHMENT_QUESTIONS,
  VALUES_QUESTIONS,
  LOVE_LANGUAGE_QUESTIONS,
} from "@/lib/questions";

export type AnswerMap = Record<string, number>; // questionId -> 1..5

function scoreItem(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw;
}

/** Average a group of 1-5 item scores and rescale to 0-100. */
function groupToScore100(items: number[]): number {
  if (items.length === 0) return 50;
  const avg = items.reduce((s, v) => s + v, 0) / items.length; // 1..5
  return Math.round(((avg - 1) / 4) * 1000) / 10; // 0..100, 1 decimal
}

export type BigFiveScores = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

export function computeBigFive(answers: AnswerMap): BigFiveScores {
  const byDim: Record<string, number[]> = {};
  for (const q of BIG_FIVE_QUESTIONS) {
    const raw = answers[q.id];
    if (raw == null) continue;
    const scored = scoreItem(raw, q.reverse);
    (byDim[q.dimension] ??= []).push(scored);
  }
  return {
    openness: groupToScore100(byDim.openness ?? []),
    conscientiousness: groupToScore100(byDim.conscientiousness ?? []),
    extraversion: groupToScore100(byDim.extraversion ?? []),
    agreeableness: groupToScore100(byDim.agreeableness ?? []),
    neuroticism: groupToScore100(byDim.neuroticism ?? []),
  };
}

export type AttachmentScores = {
  attachmentAnxiety: number;
  attachmentAvoidance: number;
  attachmentStyle: "secure" | "anxious" | "avoidant" | "fearful";
};

export function computeAttachment(answers: AnswerMap): AttachmentScores {
  const byDim: Record<string, number[]> = {};
  for (const q of ATTACHMENT_QUESTIONS) {
    const raw = answers[q.id];
    if (raw == null) continue;
    const scored = scoreItem(raw, q.reverse);
    (byDim[q.dimension] ??= []).push(scored);
  }
  const anxiety = groupToScore100(byDim.anxiety ?? []);
  const avoidance = groupToScore100(byDim.avoidance ?? []);

  // Classification follows the four-category model (Bartholomew & Horowitz,
  // 1991): low anxiety + low avoidance = secure; high anxiety + low
  // avoidance = anxious-preoccupied; low anxiety + high avoidance =
  // dismissive-avoidant; high on both = fearful-avoidant.
  const highAnx = anxiety >= 50;
  const highAvd = avoidance >= 50;
  let attachmentStyle: AttachmentScores["attachmentStyle"] = "secure";
  if (highAnx && highAvd) attachmentStyle = "fearful";
  else if (highAnx) attachmentStyle = "anxious";
  else if (highAvd) attachmentStyle = "avoidant";

  return { attachmentAnxiety: anxiety, attachmentAvoidance: avoidance, attachmentStyle };
}

export function computeValues(answers: AnswerMap): Record<string, number> {
  const out: Record<string, number> = {};
  for (const q of VALUES_QUESTIONS) {
    const raw = answers[q.id];
    if (raw == null) continue;
    out[q.dimension] = groupToScore100([scoreItem(raw, q.reverse)]);
  }
  return out;
}

export function computeLoveLanguages(answers: AnswerMap): Record<string, number> {
  const out: Record<string, number> = {};
  for (const q of LOVE_LANGUAGE_QUESTIONS) {
    const raw = answers[q.id];
    if (raw == null) continue;
    out[q.dimension] = groupToScore100([scoreItem(raw, q.reverse)]);
  }
  return out;
}
