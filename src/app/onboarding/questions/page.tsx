import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/currentUser";
import { QuestionnaireWizard } from "@/components/QuestionnaireWizard";

export default async function QuestionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.profile?.onboardingComplete) redirect("/onboarding");
  if (user.profile.questionnaireComplete) redirect("/discover");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="mb-1 text-sm font-semibold text-rose-600">Step 2 of 2</p>
      <QuestionnaireWizard />
    </div>
  );
}
