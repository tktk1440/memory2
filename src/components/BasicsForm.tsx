"use client";

import { useActionState } from "react";
import { saveBasicsAction, type ActionState } from "@/app/actions/onboarding";
import type { Profile } from "@/generated/prisma/client";

const fieldClass =
  "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500";
const labelClass = "block text-sm font-medium text-neutral-700";

export function BasicsForm({ existing }: { existing: Profile | null }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveBasicsAction, undefined);
  const seeking = existing?.seeking?.split(",") ?? [];

  return (
    <form action={formAction} className="space-y-8">
      <section className="space-y-4 rounded-2xl border border-rose-100 bg-white p-6">
        <h2 className="text-lg font-semibold">About you</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className={labelClass}>Name</label>
            <input id="name" name="name" required defaultValue={existing?.name} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="age" className={labelClass}>Age</label>
            <input id="age" name="age" type="number" min={18} max={100} required defaultValue={existing?.age} className={fieldClass} />
          </div>
        </div>
        <div>
          <span className={labelClass}>I am a</span>
          <div className="mt-1 flex gap-4 text-sm">
            {["man", "woman", "nonbinary"].map((g) => (
              <label key={g} className="flex items-center gap-1.5 capitalize">
                <input type="radio" name="gender" value={g} required defaultChecked={existing?.gender === g} />
                {g}
              </label>
            ))}
          </div>
        </div>
        <div>
          <span className={labelClass}>Looking for</span>
          <div className="mt-1 flex gap-4 text-sm">
            {["man", "woman", "nonbinary"].map((g) => (
              <label key={g} className="flex items-center gap-1.5 capitalize">
                <input type="checkbox" name="seeking" value={g} defaultChecked={seeking.includes(g)} />
                {g}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="location" className={labelClass}>Location (city)</label>
          <input id="location" name="location" defaultValue={existing?.location} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="bio" className={labelClass}>Short bio</label>
          <textarea id="bio" name="bio" rows={3} maxLength={500} defaultValue={existing?.bio} className={fieldClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="minAgePref" className={labelClass}>Min age preference</label>
            <input id="minAgePref" name="minAgePref" type="number" min={18} max={100} required defaultValue={existing?.minAgePref ?? 21} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="maxAgePref" className={labelClass}>Max age preference</label>
            <input id="maxAgePref" name="maxAgePref" type="number" min={18} max={100} required defaultValue={existing?.maxAgePref ?? 45} className={fieldClass} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-rose-100 bg-white p-6">
        <h2 className="text-lg font-semibold">Goals &amp; dealbreakers</h2>
        <div>
          <label htmlFor="relationshipGoal" className={labelClass}>What are you looking for?</label>
          <select id="relationshipGoal" name="relationshipGoal" required defaultValue={existing?.relationshipGoal ?? ""} className={fieldClass}>
            <option value="" disabled>Select one</option>
            <option value="long_term">Long-term relationship</option>
            <option value="marriage">Marriage-minded</option>
            <option value="short_term">Short-term / dating around</option>
            <option value="casual">Something casual</option>
            <option value="unsure">Not sure yet</option>
          </select>
        </div>
        <div>
          <label htmlFor="wantsChildren" className={labelClass}>Children</label>
          <select id="wantsChildren" name="wantsChildren" required defaultValue={existing?.wantsChildren ?? ""} className={fieldClass}>
            <option value="" disabled>Select one</option>
            <option value="yes">Want children</option>
            <option value="no">Don&apos;t want children</option>
            <option value="unsure">Not sure</option>
            <option value="have_want_more">Have kids, want more</option>
            <option value="have_dont_want_more">Have kids, don&apos;t want more</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="religion" className={labelClass}>Religion (optional)</label>
            <input id="religion" name="religion" defaultValue={existing?.religion} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="religionImportance" className={labelClass}>How important? (1-5)</label>
            <input id="religionImportance" name="religionImportance" type="number" min={1} max={5} required defaultValue={existing?.religionImportance ?? 1} className={fieldClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="politics" className={labelClass}>Political leaning (optional)</label>
            <input id="politics" name="politics" defaultValue={existing?.politics} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="politicsImportance" className={labelClass}>How important? (1-5)</label>
            <input id="politicsImportance" name="politicsImportance" type="number" min={1} max={5} required defaultValue={existing?.politicsImportance ?? 1} className={fieldClass} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="smoking" className={labelClass}>Smoking</label>
            <select id="smoking" name="smoking" required defaultValue={existing?.smoking ?? "never"} className={fieldClass}>
              <option value="never">Never</option>
              <option value="sometimes">Sometimes</option>
              <option value="regularly">Regularly</option>
            </select>
          </div>
          <div>
            <label htmlFor="drinking" className={labelClass}>Drinking</label>
            <select id="drinking" name="drinking" required defaultValue={existing?.drinking ?? "never"} className={fieldClass}>
              <option value="never">Never</option>
              <option value="socially">Socially</option>
              <option value="regularly">Regularly</option>
            </select>
          </div>
          <div>
            <label htmlFor="exercise" className={labelClass}>Exercise</label>
            <select id="exercise" name="exercise" required defaultValue={existing?.exercise ?? "sometimes"} className={fieldClass}>
              <option value="never">Rarely</option>
              <option value="sometimes">Sometimes</option>
              <option value="often">Often</option>
            </select>
          </div>
        </div>
      </section>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-rose-600 px-4 py-3 font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Continue to the questionnaire"}
      </button>
    </form>
  );
}
