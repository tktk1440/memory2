import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/currentUser";
import { getCandidatesForUser } from "@/lib/candidates";
import { DiscoverDeck } from "@/components/DiscoverDeck";

export default async function DiscoverPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.profile?.onboardingComplete) redirect("/onboarding");
  if (!user.profile.questionnaireComplete) redirect("/onboarding/questions");

  const candidates = await getCandidatesForUser(user.id);

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-neutral-900">Discover</h1>
      <p className="mb-6 text-sm text-neutral-600">Ranked by compatibility score, highest first.</p>
      <DiscoverDeck candidates={candidates} />
    </div>
  );
}
