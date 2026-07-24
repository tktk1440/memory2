import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/currentUser";
import { BasicsForm } from "@/components/BasicsForm";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.profile?.questionnaireComplete) redirect("/discover");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold text-rose-600">Step 1 of 2</p>
        <h1 className="mt-1 text-2xl font-bold text-neutral-900">Tell us about you</h1>
        <p className="mt-1 text-sm text-neutral-600">
          This is used for hard filters (age range, gender preference, dealbreakers). Next you&apos;ll
          take the compatibility questionnaire.
        </p>
      </div>
      <BasicsForm existing={user.profile} />
    </div>
  );
}
