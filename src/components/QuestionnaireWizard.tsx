"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QUESTION_SECTIONS, LIKERT_SCALE } from "@/lib/questions";
import { submitQuestionnaireAction } from "@/app/actions/onboarding";

export function QuestionnaireWizard() {
  const router = useRouter();
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const section = QUESTION_SECTIONS[sectionIndex];
  const isLastSection = sectionIndex === QUESTION_SECTIONS.length - 1;

  const sectionComplete = useMemo(
    () => section.questions.every((q) => answers[q.id] != null),
    [section, answers]
  );

  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = QUESTION_SECTIONS.reduce((n, s) => n + s.questions.length, 0);

  function setAnswer(id: string, value: number) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function handleNext() {
    if (!sectionComplete) return;
    setError(null);
    if (isLastSection) {
      startTransition(async () => {
        const res = await submitQuestionnaireAction(answers);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        router.push("/discover");
      });
    } else {
      setSectionIndex((i) => i + 1);
    }
  }

  function handleBack() {
    setError(null);
    setSectionIndex((i) => Math.max(0, i - 1));
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm text-neutral-500">
        <span>
          Section {sectionIndex + 1} of {QUESTION_SECTIONS.length}
        </span>
        <span>{totalAnswered} / {totalQuestions} answered</span>
      </div>
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-rose-100">
        <div
          className="h-full rounded-full bg-rose-500 transition-all"
          style={{ width: `${(totalAnswered / totalQuestions) * 100}%` }}
        />
      </div>

      <h2 className="text-xl font-bold text-neutral-900">{section.title}</h2>
      <p className="mt-1 text-sm text-neutral-600">{section.subtitle}</p>

      <div className="mt-6 space-y-6">
        {section.questions.map((q) => (
          <fieldset key={q.id} className="rounded-xl border border-rose-100 bg-white p-4">
            <legend className="px-1 text-sm font-medium text-neutral-800">{q.text}</legend>
            <div className="mt-3 flex flex-wrap justify-between gap-2">
              {LIKERT_SCALE.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex flex-1 min-w-[90px] cursor-pointer flex-col items-center gap-1 rounded-lg border px-2 py-2 text-center text-xs transition-colors ${
                    answers[q.id] === opt.value
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.value}
                    className="sr-only"
                    checked={answers[q.id] === opt.value}
                    onChange={() => setAnswer(q.id, opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={sectionIndex === 0 || pending}
          className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!sectionComplete || pending}
          className="rounded-full bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
        >
          {pending ? "Saving…" : isLastSection ? "Finish & find matches" : "Next section"}
        </button>
      </div>
    </div>
  );
}
