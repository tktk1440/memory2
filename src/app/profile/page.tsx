import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/currentUser";
import { ScoreBar } from "@/components/ScoreBar";
import { VALUE_LABELS, LOVE_LANGUAGE_LABELS, ATTACHMENT_STYLE_INFO } from "@/lib/questions";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const profile = user.profile;
  if (!profile) redirect("/onboarding");

  const values: Record<string, number> = profile.valuesJson ? JSON.parse(profile.valuesJson) : {};
  const loveLanguages: Record<string, number> = profile.loveLanguagesJson ? JSON.parse(profile.loveLanguagesJson) : {};
  const style = profile.attachmentStyle ? ATTACHMENT_STYLE_INFO[profile.attachmentStyle] : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">{profile.name}&apos;s profile</h1>
        <Link href="/onboarding" className="text-sm text-rose-600 hover:underline">
          Edit basics
        </Link>
      </div>
      <p className="mt-1 text-sm text-neutral-500">{user.email}</p>

      {!profile.questionnaireComplete ? (
        <div className="mt-6 rounded-2xl border border-rose-100 bg-white p-6 text-center">
          <p className="text-sm text-neutral-600">
            You haven&apos;t finished the compatibility questionnaire yet.
          </p>
          <Link
            href="/onboarding/questions"
            className="mt-3 inline-block rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Finish questionnaire
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {style && (
            <section className="rounded-2xl border border-rose-100 bg-white p-6">
              <h2 className="text-lg font-semibold">Attachment style</h2>
              <p className="mt-1 text-2xl font-bold text-rose-600">{style.label}</p>
              <p className="mt-1 text-sm text-neutral-600">{style.desc}</p>
            </section>
          )}

          <section className="rounded-2xl border border-rose-100 bg-white p-6">
            <h2 className="text-lg font-semibold">Personality (Big Five)</h2>
            <div className="mt-4 space-y-3">
              <ScoreBar label="Openness" value={Math.round(profile.openness ?? 0)} />
              <ScoreBar label="Conscientiousness" value={Math.round(profile.conscientiousness ?? 0)} />
              <ScoreBar label="Extraversion" value={Math.round(profile.extraversion ?? 0)} />
              <ScoreBar label="Agreeableness" value={Math.round(profile.agreeableness ?? 0)} />
              <ScoreBar label="Neuroticism" value={Math.round(profile.neuroticism ?? 0)} />
            </div>
          </section>

          <section className="rounded-2xl border border-rose-100 bg-white p-6">
            <h2 className="text-lg font-semibold">Core values</h2>
            <div className="mt-4 space-y-3">
              {Object.entries(values).map(([k, v]) => (
                <ScoreBar key={k} label={VALUE_LABELS[k] ?? k} value={Math.round(v)} />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-rose-100 bg-white p-6">
            <h2 className="text-lg font-semibold">Love languages</h2>
            <div className="mt-4 space-y-3">
              {Object.entries(loveLanguages).map(([k, v]) => (
                <ScoreBar key={k} label={LOVE_LANGUAGE_LABELS[k] ?? k} value={Math.round(v)} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
