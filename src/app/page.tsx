import Link from "next/link";
import { getCurrentUser } from "@/lib/currentUser";

const PILLARS = [
  {
    title: "Attachment style",
    desc: "The strongest predictor of relationship stability (Hazan & Shaver, 1987). We match you toward security, not just chemistry.",
    icon: "🧭",
  },
  {
    title: "Personality fit",
    desc: "Mini-IPIP Big Five traits reveal how you'll actually behave day-to-day together (Dyrenforth et al., 2010).",
    icon: "🧩",
  },
  {
    title: "Shared values",
    desc: "Couples who agree on what matters most report far less conflict (Gonzaga et al., 2007).",
    icon: "🌱",
  },
  {
    title: "Real-life fit",
    desc: "Goals, habits, and dealbreakers you actually can't compromise on.",
    icon: "🗺️",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  const ctaHref = user ? "/discover" : "/signup";
  const ctaLabel = user ? "Go to Discover" : "Take the questionnaire";

  return (
    <div>
      <section className="mx-auto max-w-5xl px-4 pt-16 pb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
          Dating, matched by <span className="text-rose-600">relationship science</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
          Kindred scores compatibility using attachment theory, the Big Five, and shared values
          research — not just a photo and a swipe.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href={ctaHref}
            className="rounded-full bg-rose-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-rose-700"
          >
            {ctaLabel}
          </Link>
          {!user && (
            <Link
              href="/login"
              className="rounded-full border border-neutral-300 px-6 py-3 font-semibold text-neutral-700 hover:bg-white"
            >
              I have an account
            </Link>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 pb-16 sm:grid-cols-2">
        {PILLARS.map((p) => (
          <div key={p.title} className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
            <div className="text-3xl">{p.icon}</div>
            <h3 className="mt-3 text-lg font-semibold">{p.title}</h3>
            <p className="mt-1 text-sm text-neutral-600">{p.desc}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 text-center text-sm text-neutral-500">
        Curious how the matching score is calculated? The full breakdown of the research behind
        it is in the project README under &ldquo;The Psychology&rdquo;.
      </section>
    </div>
  );
}
