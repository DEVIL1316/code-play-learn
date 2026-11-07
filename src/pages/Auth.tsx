import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, Sparkles, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/learn",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(
        `Failed to sign in as guest: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-28 -top-16 size-80 rounded-full bg-[var(--clay-mint)] opacity-60" />
        <div className="absolute -right-24 top-1/3 size-72 rounded-full bg-[var(--clay-butter)] opacity-70" />
        <div className="absolute bottom-0 left-1/4 size-64 rounded-full bg-[var(--clay-lilac)] opacity-40" />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center">
            <Brand to="/" />
          </div>

          <Card className="clay gap-0 overflow-hidden rounded-[2rem] border-0 py-0 shadow-none">
            {step === "signIn" ? (
              <>
                <CardHeader className="px-6 pb-2 pt-7 text-center">
                  <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-[var(--clay-mint)] text-2xl shadow-[inset_0_-4px_8px_rgba(60,50,90,0.14)]">
                    🐍
                  </div>
                  <CardTitle className="font-display text-2xl font-semibold">
                    Start your first quest
                  </CardTitle>
                  <CardDescription className="font-semibold">
                    Enter your email to sign in or create an account. Your XP
                    travels with it.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleEmailSubmit}>
                  <CardContent className="px-6 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
                        <Input
                          name="email"
                          placeholder="name@example.com"
                          type="email"
                          className="h-11 rounded-xl border-0 bg-[var(--muted)] pl-9 shadow-[inset_0_2px_6px_rgba(60,50,90,0.12)]"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading}
                        className="clay-btn size-11 rounded-xl"
                        aria-label="Send sign-in code"
                      >
                        {isLoading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <ArrowRight className="size-4" />
                        )}
                      </Button>
                    </div>
                    {error && (
                      <p className="mt-3 rounded-xl bg-[var(--clay-coral)] px-3 py-2 text-xs font-bold text-[var(--clay-coral-ink)]">
                        {error}
                      </p>
                    )}

                    <div className="relative my-5">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-card px-3 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                          or
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="clay-btn h-11 w-full rounded-xl border-0 bg-[var(--muted)] font-extrabold"
                      onClick={handleGuestLogin}
                      disabled={isLoading}
                    >
                      <UserX className="size-4" />
                      Continue as guest
                    </Button>
                    <p className="mt-3 text-center text-[11px] font-bold text-muted-foreground">
                      Guest progress stays on this device.
                    </p>
                  </CardContent>
                </form>
              </>
            ) : (
              <>
                <CardHeader className="px-6 pb-2 pt-7 text-center">
                  <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-[var(--clay-sky)] text-2xl shadow-[inset_0_-4px_8px_rgba(60,50,90,0.14)]">
                    ✉️
                  </div>
                  <CardTitle className="font-display text-2xl font-semibold">
                    Check your email
                  </CardTitle>
                  <CardDescription className="font-semibold">
                    We sent a 6-digit code to {step.email}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleOtpSubmit}>
                  <CardContent className="px-6 pb-4 pt-4">
                    <input type="hidden" name="email" value={step.email} />
                    <input type="hidden" name="code" value={otp} />

                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            otp.length === 6 &&
                            !isLoading
                          ) {
                            const form = (event.target as HTMLElement).closest("form");
                            if (form) form.requestSubmit();
                          }
                        }}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="rounded-lg border-0 bg-[var(--muted)]"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {error && (
                      <p className="mt-3 rounded-xl bg-[var(--clay-coral)] px-3 py-2 text-center text-xs font-bold text-[var(--clay-coral-ink)]">
                        {error}
                      </p>
                    )}
                    <p className="mt-4 text-center text-sm font-semibold text-muted-foreground">
                      Didn&apos;t receive a code?{" "}
                      <Button
                        variant="link"
                        className="h-auto p-0 font-extrabold"
                        onClick={() => setStep("signIn")}
                      >
                        Try again
                      </Button>
                    </p>
                  </CardContent>
                  <CardFooter className="flex-col gap-2 px-6 pb-6">
                    <Button
                      type="submit"
                      className="clay-btn h-11 w-full rounded-xl font-extrabold"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify code
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full rounded-xl font-bold"
                      onClick={() => setStep("signIn")}
                      disabled={isLoading}
                    >
                      Use a different email
                    </Button>
                  </CardFooter>
                </form>
              </>
            )}

            <div className="flex items-center justify-center gap-2 border-t border-border/70 bg-[var(--muted)] px-6 py-3.5 text-[11px] font-bold text-muted-foreground">
              <Sparkles className="size-3.5" />
              14 quests · explanations included · free to play
            </div>
          </Card>

          <p className="mt-5 text-center text-xs font-bold text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              ← Back to ClayCode
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
