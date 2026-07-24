import Link from "next/link";
import { signupAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-bold text-neutral-900">Create your account</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Takes about 10 minutes, including the compatibility questionnaire.
      </p>
      <div className="mt-6">
        <AuthForm action={signupAction} submitLabel="Sign up" pendingLabel="Creating account…" />
      </div>
      <p className="mt-6 text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-rose-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
