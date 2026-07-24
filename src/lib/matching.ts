/**
 * Compatibility matching engine.
 *
 * Combines several evidence-based signals from relationship-science
 * research into a single 0-100 compatibility score. Weights reflect the
 * relative predictive strength reported in the literature (see
 * README.md "The Psychology" for citations); they are intentionally
 * explicit and tunable rather than hidden inside a black box.
 */

export type MatchProfile = {
  userId: string;
  name: string;
  age: number;
  gender: string;
  seeking: string; // comma-separated
  minAgePref: number;
  maxAgePref: number;
  relationshipGoal: string | null;
  wantsChildren: string | null;
  religion: string;
  religionImportance: number;
  politics: string;
  politicsImportance: number;
  smoking: string;
  drinking: string;
  exercise: string;
  openness: number | null;
  conscientiousness: number | null;
  extraversion: number | null;
  agreeableness: number | null;
  neuroticism: number | null;
  attachmentAnxiety: number | null;
  attachmentAvoidance: number | null;
  attachmentStyle: string | null;
  valuesJson: string | null;
  loveLanguagesJson: string | null;
};

export const MATCH_WEIGHTS = {
  attachment: 0.3,
  bigFive: 0.25,
  values: 0.25,
  lifestyle: 0.15,
  loveLanguage: 0.05,
} as const;

export type ScoreBreakdown = {
  total: number;
  attachment: number;
  bigFive: number;
  values: number;
  lifestyle: number;
  loveLanguage: number;
  reasons: string[];
};

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

function parseVector(json: string | null): Record<string, number> {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

/** Mean of (100 - |diff|) across shared keys — a simple profile-similarity
 * score in the spirit of the couple profile-correlation approach used by
 * Luo & Klohnen (2005) to study assortative mating on personality/values. */
function profileSimilarity(a: Record<string, number>, b: Record<string, number>): number {
  const keys = Object.keys(a).filter((k) => k in b);
  if (keys.length === 0) return 50;
  const total = keys.reduce((sum, k) => sum + (100 - Math.abs(a[k] - b[k])), 0);
  return total / keys.length;
}

/**
 * Hard filters. These are not "scored" — a pair that fails any of these is
 * excluded from candidate matching entirely, mirroring how real
 * relationship dealbreakers (mutual interest, age range, wanting children)
 * function as gates rather than dials (Jonason, Garcia, Webster, Li, &
 * Fisher, 2015 — "dealbreakers" typically act as veto criteria).
 */
export function passesHardFilters(a: MatchProfile, b: MatchProfile): { ok: boolean; reason?: string } {
  const aSeeking = a.seeking.split(",").map((s) => s.trim()).filter(Boolean);
  const bSeeking = b.seeking.split(",").map((s) => s.trim()).filter(Boolean);
  if (aSeeking.length && !aSeeking.includes(b.gender)) return { ok: false, reason: "gender preference" };
  if (bSeeking.length && !bSeeking.includes(a.gender)) return { ok: false, reason: "gender preference" };

  if (b.age < a.minAgePref || b.age > a.maxAgePref) return { ok: false, reason: "age preference" };
  if (a.age < b.minAgePref || a.age > b.maxAgePref) return { ok: false, reason: "age preference" };

  const wants = new Set(["yes", "have_want_more"]);
  const doesNotWant = new Set(["no", "have_dont_want_more"]);
  if (a.wantsChildren && b.wantsChildren) {
    const aw = wants.has(a.wantsChildren);
    const bw = wants.has(b.wantsChildren);
    const an = doesNotWant.has(a.wantsChildren);
    const bn = doesNotWant.has(b.wantsChildren);
    if ((aw && bn) || (an && bw)) return { ok: false, reason: "children dealbreaker" };
  }

  return { ok: true };
}

/**
 * Attachment compatibility (30%): rewards two secure or trending-secure
 * partners (Hazan & Shaver, 1987; Simpson, 1990; Feeney, 1994 meta-analytic
 * evidence that attachment security predicts relationship satisfaction and
 * stability) and penalizes the classic anxious-avoidant "demand-withdraw"
 * pairing shown to erode satisfaction (Pistole, 1994; Mikulincer & Shaver,
 * 2007).
 */
function scoreAttachment(a: MatchProfile, b: MatchProfile): { score: number; note: string } {
  const aAnx = a.attachmentAnxiety ?? 50;
  const aAvd = a.attachmentAvoidance ?? 50;
  const bAnx = b.attachmentAnxiety ?? 50;
  const bAvd = b.attachmentAvoidance ?? 50;

  const avgInsecurity = (aAnx + aAvd + bAnx + bAvd) / 4;
  let score = 100 - avgInsecurity;

  const anxiousAvoidantClash = Math.min(Math.max(aAnx - 50, 0), Math.max(bAvd - 50, 0)) +
    Math.min(Math.max(bAnx - 50, 0), Math.max(aAvd - 50, 0));
  score -= anxiousAvoidantClash * 0.5;

  score = clamp(score);
  const note =
    a.attachmentStyle === "secure" && b.attachmentStyle === "secure"
      ? "You both show a secure attachment style, the strongest predictor of relationship stability."
      : anxiousAvoidantClash > 10
        ? "Your attachment styles may create a pursue-withdraw dynamic worth being mindful of."
        : "Your attachment styles are reasonably compatible.";
  return { score, note };
}

/**
 * Big Five compatibility (25%): draws on two complementary literatures —
 * (1) partners with high agreeableness, high conscientiousness, and low
 * neuroticism report higher relationship satisfaction regardless of the
 * other partner's trait level (Dyrenforth, Kashy, Donnellan & Lucas, 2010,
 * actor-partner analysis across 3 national samples), and (2) similarity on
 * conscientiousness/agreeableness/emotional stability specifically (versus
 * openness/extraversion) is what people actually assortatively mate on
 * (Botwin, Buss & Shackelford, 1997). We reward both the couple's average
 * "good trait" levels and their similarity on the stability-relevant traits.
 */
function scoreBigFive(a: MatchProfile, b: MatchProfile): { score: number; note: string } {
  const traits = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"] as const;
  const av: Record<string, number> = {};
  const bv: Record<string, number> = {};
  for (const t of traits) {
    av[t] = a[t] ?? 50;
    bv[t] = b[t] ?? 50;
  }

  const consSim = 100 - Math.abs(av.conscientiousness - bv.conscientiousness);
  const agreSim = 100 - Math.abs(av.agreeableness - bv.agreeableness);
  const stability = 100 - (av.neuroticism + bv.neuroticism) / 2;
  const extraSim = 100 - Math.abs(av.extraversion - bv.extraversion);
  const openSim = 100 - Math.abs(av.openness - bv.openness);
  const warmth = (av.agreeableness + bv.agreeableness) / 2;

  const score = clamp(
    consSim * 0.28 + agreSim * 0.22 + stability * 0.25 + extraSim * 0.13 + openSim * 0.07 + warmth * 0.05
  );
  const note =
    score >= 70
      ? "Your personalities line up well, especially on conscientiousness and emotional stability."
      : "Your personalities differ in ways that could take extra communication.";
  return { score, note };
}

/**
 * Core values alignment (25%): shared values are one of the more robust
 * predictors of relationship quality and reduced conflict (Gonzaga, Campos
 * & Bradbury, 2007; Lutz-Zois, Bradley, Mihalik & Moorman-Eavers, 2006).
 */
function scoreValues(a: MatchProfile, b: MatchProfile): { score: number; note: string } {
  const av = parseVector(a.valuesJson);
  const bv = parseVector(b.valuesJson);
  const score = clamp(profileSimilarity(av, bv));
  const note =
    score >= 70
      ? "You share similar core values, which tends to reduce conflict long-term."
      : "You prioritize somewhat different things in life, worth discussing early.";
  return { score, note };
}

/**
 * Lifestyle & goals alignment (15%): concrete practical compatibility —
 * relationship intent, religion/politics importance, and daily habits.
 * Shared attitudes/habits predict relational stability (Surra & Longstreth,
 * 1990).
 */
const GOAL_GROUPS: Record<string, string> = {
  long_term: "serious",
  marriage: "serious",
  short_term: "casual",
  casual: "casual",
  unsure: "unsure",
};

const HABIT_ORDER: Record<string, number> = { never: 0, sometimes: 1, socially: 1, regularly: 2, often: 2 };

function scoreLifestyle(a: MatchProfile, b: MatchProfile): { score: number; note: string } {
  let points = 0;
  let total = 0;

  total += 1;
  if (a.relationshipGoal && b.relationshipGoal) {
    if (a.relationshipGoal === b.relationshipGoal) points += 1;
    else if (GOAL_GROUPS[a.relationshipGoal] === GOAL_GROUPS[b.relationshipGoal]) points += 0.6;
    else points += 0.1;
  } else points += 0.5;

  total += 1;
  const religionImportanceDiff = Math.abs(a.religionImportance - b.religionImportance) / 4;
  const sameReligion = a.religion && a.religion === b.religion ? 1 : 0.5;
  points += clamp(1 - religionImportanceDiff, 0, 1) * 0.5 + sameReligion * 0.5;

  total += 1;
  const politicsImportanceDiff = Math.abs(a.politicsImportance - b.politicsImportance) / 4;
  const samePolitics = a.politics && a.politics === b.politics ? 1 : 0.5;
  points += clamp(1 - politicsImportanceDiff, 0, 1) * 0.5 + samePolitics * 0.5;

  for (const habit of ["smoking", "drinking", "exercise"] as const) {
    total += 1;
    const av = HABIT_ORDER[a[habit]] ?? 1;
    const bv = HABIT_ORDER[b[habit]] ?? 1;
    points += clamp(1 - Math.abs(av - bv) / 2, 0, 1);
  }

  const score = clamp((points / total) * 100);
  const note =
    score >= 70
      ? "Your day-to-day lifestyle and relationship goals line up well."
      : "There are some lifestyle or goal differences worth talking through.";
  return { score, note };
}

/** Love languages (5%, lower weight — Chapman's framework has only mixed
 * empirical support, see Impett et al., 2014). */
function scoreLoveLanguage(a: MatchProfile, b: MatchProfile): { score: number; note: string } {
  const av = parseVector(a.loveLanguagesJson);
  const bv = parseVector(b.loveLanguagesJson);
  const score = clamp(profileSimilarity(av, bv));
  const note = score >= 70 ? "You express and receive affection in similar ways." : "You may express affection differently — good to name explicitly.";
  return { score, note };
}

export function computeCompatibility(a: MatchProfile, b: MatchProfile): ScoreBreakdown {
  const attachment = scoreAttachment(a, b);
  const bigFive = scoreBigFive(a, b);
  const values = scoreValues(a, b);
  const lifestyle = scoreLifestyle(a, b);
  const loveLanguage = scoreLoveLanguage(a, b);

  const total = clamp(
    attachment.score * MATCH_WEIGHTS.attachment +
      bigFive.score * MATCH_WEIGHTS.bigFive +
      values.score * MATCH_WEIGHTS.values +
      lifestyle.score * MATCH_WEIGHTS.lifestyle +
      loveLanguage.score * MATCH_WEIGHTS.loveLanguage
  );

  return {
    total: Math.round(total * 10) / 10,
    attachment: Math.round(attachment.score),
    bigFive: Math.round(bigFive.score),
    values: Math.round(values.score),
    lifestyle: Math.round(lifestyle.score),
    loveLanguage: Math.round(loveLanguage.score),
    reasons: [attachment.note, bigFive.note, values.note, lifestyle.note, loveLanguage.note],
  };
}
