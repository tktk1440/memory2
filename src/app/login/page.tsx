import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-bold text-neutral-900">Welcome back</h1>
      <p className="mt-1 text-sm text-neutral-600">Log in to see your matches.</p>
      <div className="mt-6">
        <AuthForm action={loginAction} submitLabel="Log in" pendingLabel="Logging in…" />
      </div>
      <p className="mt-6 text-center text-sm text-neutral-600">
        New here?{" "}
        <Link href="/signup" className="font-medium text-rose-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
