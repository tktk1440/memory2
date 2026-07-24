/**
 * Question banks used during onboarding.
 *
 * The instruments below are adapted from published personality/relationship
 * psychology research. See README.md "The Psychology" section for full
 * citations. Where an instrument is copyrighted (e.g. ECR-S), items are
 * original paraphrases that measure the same underlying construct rather
 * than reproductions of the original wording.
 */

export type LikertQuestion = {
  id: string;
  text: string;
  /** true if a high Likert answer should be scored as LOW on the trait */
  reverse: boolean;
  dimension: string;
};

export const LIKERT_SCALE = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
];

// ---------------------------------------------------------------------------
// Big Five personality — Mini-IPIP (Donnellan, Oswald, Baird & Lucas, 2006),
// a 20-item public-domain short form of the International Personality Item
// Pool Five-Factor Model markers (Goldberg, 1992). Four items per factor.
// ---------------------------------------------------------------------------
export const BIG_FIVE_QUESTIONS: LikertQuestion[] = [
  // Extraversion
  { id: "bf_e1", text: "I am the life of the party.", reverse: false, dimension: "extraversion" },
  { id: "bf_e2", text: "I don't talk a lot.", reverse: true, dimension: "extraversion" },
  { id: "bf_e3", text: "I feel comfortable around people.", reverse: false, dimension: "extraversion" },
  { id: "bf_e4", text: "I keep in the background in group settings.", reverse: true, dimension: "extraversion" },
  // Agreeableness
  { id: "bf_a1", text: "I sympathize with others' feelings.", reverse: false, dimension: "agreeableness" },
  { id: "bf_a2", text: "I am not really interested in other people's problems.", reverse: true, dimension: "agreeableness" },
  { id: "bf_a3", text: "I feel other people's emotions easily.", reverse: false, dimension: "agreeableness" },
  { id: "bf_a4", text: "I am not very interested in other people.", reverse: true, dimension: "agreeableness" },
  // Conscientiousness
  { id: "bf_c1", text: "I get chores done right away.", reverse: false, dimension: "conscientiousness" },
  { id: "bf_c2", text: "I like order and structure.", reverse: false, dimension: "conscientiousness" },
  { id: "bf_c3", text: "I make a mess of things.", reverse: true, dimension: "conscientiousness" },
  { id: "bf_c4", text: "I often forget to put things back in their proper place.", reverse: true, dimension: "conscientiousness" },
  // Neuroticism (emotional stability, reverse-coded)
  { id: "bf_n1", text: "I have frequent mood swings.", reverse: false, dimension: "neuroticism" },
  { id: "bf_n2", text: "I am relaxed most of the time.", reverse: true, dimension: "neuroticism" },
  { id: "bf_n3", text: "I get upset easily.", reverse: false, dimension: "neuroticism" },
  { id: "bf_n4", text: "I seldom feel blue or down.", reverse: true, dimension: "neuroticism" },
  // Openness / Intellect
  { id: "bf_o1", text: "I have a vivid imagination.", reverse: false, dimension: "openness" },
  { id: "bf_o2", text: "I am not interested in abstract ideas.", reverse: true, dimension: "openness" },
  { id: "bf_o3", text: "I have difficulty understanding abstract ideas.", reverse: true, dimension: "openness" },
  { id: "bf_o4", text: "I enjoy exploring new and unusual ideas.", reverse: false, dimension: "openness" },
];

// ---------------------------------------------------------------------------
// Adult attachment style — constructs from attachment theory (Bowlby, 1969;
// Hazan & Shaver, 1987) measured along the two dimensions established by
// Brennan, Clark & Shaver (1998) and used in the ECR-R / ECR-S (Fraley,
// Waller & Brennan, 2000; Wei, Russell, Mallinckrodt & Vogel, 2007):
// attachment-related ANXIETY (fear of rejection/abandonment) and
// AVOIDANCE (discomfort with closeness/dependence). Items below are
// original paraphrases of these constructs, not reproductions of the
// copyrighted ECR item text.
// ---------------------------------------------------------------------------
export const ATTACHMENT_QUESTIONS: LikertQuestion[] = [
  // Anxiety
  { id: "at_anx1", text: "I worry that romantic partners don't care about me as much as I care about them.", reverse: false, dimension: "anxiety" },
  { id: "at_anx2", text: "I need frequent reassurance that my partner truly loves me.", reverse: false, dimension: "anxiety" },
  { id: "at_anx3", text: "I get anxious when a partner is slow to respond to me.", reverse: false, dimension: "anxiety" },
  { id: "at_anx4", text: "I rarely worry about a partner leaving me.", reverse: true, dimension: "anxiety" },
  { id: "at_anx5", text: "I find myself preoccupied with how my relationships are going.", reverse: false, dimension: "anxiety" },
  { id: "at_anx6", text: "I feel confident that the people I date genuinely want to be with me.", reverse: true, dimension: "anxiety" },
  // Avoidance
  { id: "at_avd1", text: "I prefer not to show a partner how I feel deep down.", reverse: false, dimension: "avoidance" },
  { id: "at_avd2", text: "I find it easy to be emotionally close to a partner.", reverse: true, dimension: "avoidance" },
  { id: "at_avd3", text: "I get uncomfortable when a partner wants to be very close.", reverse: false, dimension: "avoidance" },
  { id: "at_avd4", text: "I am comfortable depending on romantic partners.", reverse: true, dimension: "avoidance" },
  { id: "at_avd5", text: "I try to avoid getting too attached to people I date.", reverse: false, dimension: "avoidance" },
  { id: "at_avd6", text: "I openly share my worries and needs with a partner.", reverse: true, dimension: "avoidance" },
];

// ---------------------------------------------------------------------------
// Core relationship values — informed by Schwartz's Theory of Basic Human
// Values (Schwartz, 1992) and research linking partner value-similarity to
// relationship satisfaction (Gonzaga, Campos & Bradbury, 2007; Lutz-Zois,
// Bradley, Mihalik & Moorman-Eavers, 2006). Simplified to eight
// relationship-relevant value dimensions, each rated for personal importance.
// ---------------------------------------------------------------------------
export const VALUES_QUESTIONS: LikertQuestion[] = [
  { id: "val_family", text: "Building a close-knit family life is a top priority for me.", reverse: false, dimension: "family" },
  { id: "val_career", text: "Career achievement and ambition are central to who I am.", reverse: false, dimension: "ambition" },
  { id: "val_adventure", text: "Seeking out new experiences and adventure is important to me.", reverse: false, dimension: "adventure" },
  { id: "val_security", text: "Financial and emotional stability matter more to me than spontaneity.", reverse: false, dimension: "security" },
  { id: "val_tradition", text: "Maintaining traditions and cultural or religious practices is important to me.", reverse: false, dimension: "tradition" },
  { id: "val_altruism", text: "Contributing to my community or causes bigger than myself matters a lot to me.", reverse: false, dimension: "altruism" },
  { id: "val_independence", text: "Personal independence and autonomy are essential to my happiness.", reverse: false, dimension: "independence" },
  { id: "val_wellness", text: "Health, fitness, and personal wellbeing are a major focus of my life.", reverse: false, dimension: "wellness" },
];

// ---------------------------------------------------------------------------
// Love languages (Chapman, 1992) — a popular but only partially validated
// framework (see Impett et al., 2014). Included as a lower-weighted signal
// about preferred ways of expressing/receiving affection.
// ---------------------------------------------------------------------------
export const LOVE_LANGUAGE_QUESTIONS: LikertQuestion[] = [
  { id: "ll_words", text: "Hearing verbal affirmation and compliments makes me feel most loved.", reverse: false, dimension: "words_of_affirmation" },
  { id: "ll_time", text: "Undivided, quality time together makes me feel most loved.", reverse: false, dimension: "quality_time" },
  { id: "ll_service", text: "A partner doing helpful things for me makes me feel most loved.", reverse: false, dimension: "acts_of_service" },
  { id: "ll_touch", text: "Physical affection (hugs, holding hands) makes me feel most loved.", reverse: false, dimension: "physical_touch" },
  { id: "ll_gifts", text: "Thoughtful gifts make me feel most loved.", reverse: false, dimension: "receiving_gifts" },
];

export const ALL_LIKERT_QUESTIONS: LikertQuestion[] = [
  ...BIG_FIVE_QUESTIONS,
  ...ATTACHMENT_QUESTIONS,
  ...VALUES_QUESTIONS,
  ...LOVE_LANGUAGE_QUESTIONS,
];

export const VALUE_LABELS: Record<string, string> = {
  family: "Family",
  ambition: "Career & ambition",
  adventure: "Adventure",
  security: "Stability & security",
  tradition: "Tradition",
  altruism: "Community & altruism",
  independence: "Independence",
  wellness: "Health & wellness",
};

export const LOVE_LANGUAGE_LABELS: Record<string, string> = {
  words_of_affirmation: "Words of affirmation",
  quality_time: "Quality time",
  acts_of_service: "Acts of service",
  physical_touch: "Physical touch",
  receiving_gifts: "Receiving gifts",
};

export const ATTACHMENT_STYLE_INFO: Record<string, { label: string; desc: string }> = {
  secure: {
    label: "Secure",
    desc: "Comfortable with closeness and independence — the style most consistently linked to relationship satisfaction.",
  },
  anxious: {
    label: "Anxious-preoccupied",
    desc: "Craves closeness and reassurance, and can worry about a partner's availability.",
  },
  avoidant: {
    label: "Dismissive-avoidant",
    desc: "Values independence and can feel uneasy with too much closeness or dependence.",
  },
  fearful: {
    label: "Fearful-avoidant",
    desc: "Wants closeness but also fears it, often after mixed experiences with trust.",
  },
};

export const QUESTION_SECTIONS = [
  { key: "big_five", title: "Personality", subtitle: "How you tend to think, feel, and act", questions: BIG_FIVE_QUESTIONS },
  { key: "attachment", title: "Attachment Style", subtitle: "How you experience closeness in relationships", questions: ATTACHMENT_QUESTIONS },
  { key: "values", title: "Core Values", subtitle: "What matters most to you in life", questions: VALUES_QUESTIONS },
  { key: "love_language", title: "Love Languages", subtitle: "How you prefer to give and receive affection", questions: LOVE_LANGUAGE_QUESTIONS },
] as const;
