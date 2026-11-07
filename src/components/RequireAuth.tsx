import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Lock } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";

/**
 * Wraps a route that requires a signed-in user.
 *
 * Signed-out visitors used to be bounced straight to `/auth`, which left them
 * on a bare sign-in form with no idea which page they had asked for or why they
 * were moved. The block is now stated on the page they landed on, and sign-in
 * still returns them to it via `returnTo`. Pass `redirectImmediately` for a
 * route where the bounce really is the better experience.
 */
export function RequireAuth({
  children,
  title = "Sign in to continue",
  description = "This page is only available to signed-in users.",
  redirectImmediately = false,
}: {
  children: ReactNode;
  /** Headline on the blocked screen. */
  title?: string;
  /** Says what the visitor gets by signing in. */
  description?: string;
  /** Skip the explanation and go straight to `/auth`. */
  redirectImmediately?: boolean;
}) {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    const signInHref = `/auth?returnTo=${encodeURIComponent(returnTo)}`;

    if (redirectImmediately) {
      return <Navigate to={signInHref} replace />;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="clay w-full max-w-md gap-0 rounded-[2rem] border-0 py-0 shadow-none">
          <CardHeader className="px-6 pb-2 pt-7 text-center">
            <div className="flex justify-center">
              <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-[var(--clay-sky)] text-[var(--clay-sky-ink)] shadow-[inset_0_-4px_8px_rgba(60,50,90,0.14)]">
                <Lock className="size-5" />
              </div>
            </div>
            <CardTitle className="font-display text-2xl font-semibold">
              {title}
            </CardTitle>
            <CardDescription className="font-semibold">{description}</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-2 text-center text-sm text-muted-foreground">
            You&apos;ll come straight back to this page once you&apos;re signed in.
          </CardContent>
          <CardFooter className="flex-col gap-2 px-6 pb-7 pt-4">
            <Button
              className="clay-btn h-11 w-full rounded-xl font-extrabold"
              onClick={() => navigate(signInHref)}
            >
              Sign in
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-xl font-bold"
              onClick={() => navigate("/")}
            >
              Back to home
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return children;
}
