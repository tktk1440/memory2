# Kindred — compatibility-first dating app

A full-stack dating app (Next.js App Router + Prisma/SQLite) that matches people
using a scored, research-backed compatibility algorithm instead of photo-swiping
alone. Users sign up, fill out a short profile, answer a ~45-item psychology
questionnaire, then browse ranked, explainable match scores and chat with mutual
likes.

## Quick start

```bash
npm install                # also runs `prisma generate` via postinstall
npm run db:migrate         # create prisma/dev.db and apply the schema
npm run db:seed            # seed 9 demo profiles + one pre-made match
npm run dev                # http://localhost:3000
```

Log in with the seeded demo account to see a populated experience immediately:

- **Email:** `demo@kindred.app`
- **Password:** `password123`

That account already has a mutual match (with a couple of messages) and a
ranked queue of other seeded candidates. All other seeded accounts share the
same password if you want to log in as them too.

Copy `.env.example` to `.env` and set a real `AUTH_SECRET` before deploying
anywhere real; the checked-in `.env` is dev-only.

## How it's built

- **Next.js App Router** (Server Components + Server Actions) — no separate
  REST/GraphQL API layer; forms call server actions directly.
- **Prisma 7 + SQLite** (via `@prisma/adapter-better-sqlite3`) for storage —
  zero external services required to run locally.
- **Auth**: email/password, `bcryptjs` hashing, stateless session via signed
  JWT (`jose`) in an httpOnly cookie, enforced by `src/proxy.ts` (Next's
  middleware/proxy convention).
- **Validation**: `zod` on every server action.

### Key files

| Path | What it does |
|---|---|
| `src/lib/questions.ts` | The question bank (Big Five, attachment, values, love languages) |
| `src/lib/scoring.ts` | Turns raw 1–5 answers into 0–100 trait scores |
| `src/lib/matching.ts` | Pure compatibility-scoring function + hard dealbreaker filters |
| `src/lib/candidates.ts` | Fetches & ranks candidates for a user from the DB |
| `src/app/actions/*.ts` | Server actions: auth, onboarding, like/pass/message |
| `prisma/schema.prisma` | Data model |
| `prisma/seed.ts` | Demo data generator |

## The psychology

The questionnaire and scoring model are built from published relationship-
science findings rather than invented from scratch. Nothing here is a
substitute for real clinical or research instruments — copyrighted
instruments (like the ECR-S) are paraphrased into original items that target
the same underlying construct, not reproduced verbatim.

**1. Personality — Big Five via Mini-IPIP**
20-item public-domain short form of the Big Five (Donnellan, Oswald, Baird &
Lucas, 2006), itself drawn from Goldberg's (1992) International Personality
Item Pool. Actor–partner analyses across three large longitudinal samples
found that a partner's own agreeableness, conscientiousness, and low
neuroticism predict relationship satisfaction regardless of the other
partner's traits (Dyrenforth, Kashy, Donnellan & Lucas, 2010), while people
tend to actually pair up assortatively on conscientiousness, agreeableness,
and emotional stability specifically — not openness or extraversion (Botwin,
Buss & Shackelford, 1997).

**2. Attachment style**
Modeled on adult attachment theory (Bowlby, 1969; Hazan & Shaver, 1987) along
the two dimensions established by Brennan, Clark & Shaver (1998) and used in
instruments like the ECR-R/ECR-S (Fraley, Waller & Brennan, 2000; Wei,
Russell, Mallinckrodt & Vogel, 2007): **anxiety** (fear of rejection/
abandonment) and **avoidance** (discomfort with closeness/dependence).
Attachment security is one of the most consistent predictors of relationship
satisfaction and stability in meta-analytic work (Feeney, 1994; Simpson,
1990), and the classic "anxious pursues, avoidant withdraws" pairing is
associated with lower satisfaction (Pistole, 1994; Mikulincer & Shaver,
2007) — the algorithm penalizes exactly that combination. Four-category
classification (secure / anxious-preoccupied / dismissive-avoidant /
fearful-avoidant) follows Bartholomew & Horowitz (1991).

**3. Core values**
Simplified, dating-relevant set of value dimensions inspired by Schwartz's
Theory of Basic Human Values (Schwartz, 1992). Shared values between
partners are linked to lower conflict and more positive emotion in the
relationship (Gonzaga, Campos & Bradbury, 2007) and to relationship
satisfaction more broadly (Lutz-Zois, Bradley, Mihalik & Moorman-Eavers,
2006). Compatibility is scored as a profile-similarity metric, in the
spirit of the couple profile-correlation approach used to study
assortative mating on personality/values (Luo & Klohnen, 2005).

**4. Love languages**
Chapman's (1992) popular framework for preferred ways of giving/receiving
affection. Included at low weight (5%) because empirical support is mixed
compared to the other constructs (Impett, Park & Muise, 2014).

**5. Lifestyle & goals**
Relationship intent, religion/politics importance, smoking/drinking/exercise
habits. Shared attitudes and daily-life compatibility predict relational
stability (Surra & Longstreth, 1990). Fundamental mismatches (e.g. one
person wants children and the other explicitly doesn't) act as **hard
filters** rather than scored dials, mirroring how real dealbreakers function
(Jonason, Garcia, Webster, Li & Fisher, 2015).

### The score

```
compatibility = 30% attachment + 25% personality + 25% values
                + 15% lifestyle/goals + 5% love language
```

Weights are explicit constants in `src/lib/matching.ts` (`MATCH_WEIGHTS`), not
hidden — every match shows its full breakdown and a plain-language reason per
category. Candidates are only shown at all if they pass hard filters (mutual
gender preference, mutual age range, no children dealbreaker conflict).

## App flow

1. **Sign up** (`/signup`) → creates account, redirects to onboarding.
2. **Onboarding basics** (`/onboarding`) → name, age, gender/seeking, bio,
   lifestyle, goals, dealbreakers.
3. **Questionnaire** (`/onboarding/questions`) → 4-section wizard (personality,
   attachment, values, love languages), scored on submit.
4. **Discover** (`/discover`) → ranked candidate deck with score breakdown;
   like/pass. A mutual like creates a `Match`.
5. **Matches** (`/matches`) → list of mutual matches with a preview.
6. **Chat** (`/matches/[matchId]`) → simple threaded messaging between the
   two matched users.
7. **Profile** (`/profile`) → your own computed personality/attachment/values
   results.

## Notes & limitations

- This is a demo-grade implementation: no photo upload, no push
  notifications, no real-time websocket chat (messages appear on send/
  refresh via Server Actions + `router.refresh()`), no rate limiting/report-
  abuse tooling that a production dating app would need.
- SQLite is used for zero-config local development; swap the Prisma adapter
  (e.g. to Postgres) for a real deployment with concurrent writers.
- The psychology instruments here are simplified and adapted for demo
  purposes — they are not validated clinical assessments.
