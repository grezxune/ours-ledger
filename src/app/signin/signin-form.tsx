"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/field";

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path
        d="M21.6 12.23c0-.72-.06-1.25-.2-1.81H12v3.46h5.52c-.11.86-.73 2.15-2.1 3.02l-.02.12 3.02 2.29.21.02c1.91-1.72 2.97-4.24 2.97-7.1Z"
        fill="#4285F4"
      />
      <path
        d="M12 21.75c2.7 0 4.97-.87 6.63-2.37l-3.22-2.43c-.86.59-2.02 1.01-3.41 1.01-2.64 0-4.88-1.72-5.68-4.1l-.12.01-3.14 2.38-.04.11C4.67 19.59 8.06 21.75 12 21.75Z"
        fill="#34A853"
      />
      <path
        d="M6.32 13.86A5.72 5.72 0 0 1 6 12c0-.64.12-1.26.31-1.86l-.01-.13-3.18-2.42-.1.05A9.55 9.55 0 0 0 2 12c0 1.57.38 3.05 1.03 4.36l3.29-2.5Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.04c1.75 0 2.94.74 3.61 1.36l2.64-2.52C16.97 3.71 14.7 3 12 3a9.83 9.83 0 0 0-8.98 5.64L6.31 11.1C7.12 8.72 9.36 6.04 12 6.04Z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * Sign-in form for NextAuth credentials and Google provider.
 */
export function SignInForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleCredentialsSignIn(formData: FormData) {
    setError(null);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      name: formData.get("name"),
      passphrase: formData.get("passphrase"),
      redirect: false,
      callbackUrl: "/",
    });

    if (!result || result.error) {
      setError("Sign-in failed. Check your passphrase.");
      return;
    }

    window.location.assign(result.url || "/");
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl: "/" });
    setIsGoogleLoading(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        aria-label="Continue with Google sign in"
        className="inline-flex h-11 items-center justify-center gap-3 rounded-lg border border-[#dadce0] bg-white px-4 text-[15px] font-medium text-[#3c4043] shadow-[0_1px_2px_rgba(60,64,67,0.08)] transition hover:shadow-[0_1px_3px_rgba(60,64,67,0.25)] focus:outline-none focus:ring-2 focus:ring-accent"
        onClick={handleGoogleSignIn}
        type="button"
      >
        <GoogleMark />
        <span>{isGoogleLoading ? "Redirecting..." : "Continue with Google"}</span>
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-line" />
        </div>
        <p className="relative mx-auto w-fit bg-surface px-3 text-xs uppercase tracking-[0.14em] text-foreground/60">
          Developer access
        </p>
      </div>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          await handleCredentialsSignIn(formData);
        }}
        className="rounded-2xl border border-line/80 bg-surface-muted/35 p-4"
      >
        <div className="grid gap-3">
          <InputField
            label="Email"
            name="email"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <InputField
            label="Display Name"
            name="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <InputField
            label="Dev Passphrase"
            name="passphrase"
            required
            type="password"
            value={passphrase}
            onChange={(event) => setPassphrase(event.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="mt-3">
          <Button ariaLabel="Sign in with developer credentials" startIcon={<LogIn className="size-4" />} type="submit">
            Sign In
          </Button>
        </div>
      </form>
    </div>
  );
}
