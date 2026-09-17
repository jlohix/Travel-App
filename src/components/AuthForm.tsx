"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import type { AuthState } from "@/app/(auth)/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-brand-600 px-4 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Please wait..." : label}
    </button>
  );
}

export function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "signup";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
}) {
  const [state, formAction] = useFormState(action, undefined);
  const isSignup = mode === "signup";

  return (
    <div className="mx-auto mt-8 w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {isSignup
          ? "Join the community of travelers."
          : "Log in to continue planning."}
      </p>

      {state?.error && (
        <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="you@example.com"
          />
        </div>

        {isSignup && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="traveler123"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="••••••••"
          />
        </div>

        <SubmitButton label={isSignup ? "Sign up" : "Log in"} />
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-600 hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="font-medium text-brand-600 hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>

      {!isSignup && (
        <div className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Demo login: <strong>alice@example.com</strong> / <strong>password123</strong>
        </div>
      )}
    </div>
  );
}
