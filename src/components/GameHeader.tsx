import { Button } from "@/components/ui/button";
import { Brand } from "@/components/Brand";
import { useAuth } from "@/hooks/use-auth";
import { Flame, LogOut, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";

/**
 * Shared top bar for the signed-in game screens: brand, XP pill,
 * a back-to-paths link and sign out.
 */
export function GameHeader({
  xp,
  showPathsLink = false,
}: {
  xp?: number;
  showPathsLink?: boolean;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
      <div className="flex items-center gap-3">
        <Brand to="/learn" />
        {showPathsLink && (
          <Button
            variant="ghost"
            size="sm"
            className="hidden rounded-full text-muted-foreground sm:inline-flex"
            onClick={() => navigate("/learn")}
          >
            All paths
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="clay-soft flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-extrabold text-[var(--clay-peach-ink)]">
          <Sparkles className="size-4" />
          {xp ?? 0} XP
        </span>
        {typeof xp === "number" && (
          <span className="clay-soft hidden items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-extrabold text-[var(--clay-mint-ink)] sm:flex">
            <Flame className="size-4" />
            Beginner
          </span>
        )}
        <span className="hidden max-w-32 truncate pl-1 text-sm font-bold text-muted-foreground md:block">
          {user?.name ?? user?.email ?? "Player"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:bg-white/60"
          onClick={handleSignOut}
          aria-label="Sign out"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
