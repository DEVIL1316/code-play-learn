import { Code2 } from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

/** ClayCode wordmark: a soft mint clay tile with a little code glyph. */
export function Brand({
  to = "/",
  className,
  showWordmark = true,
}: {
  to?: string;
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn("group flex items-center gap-3", className)}
      aria-label="ClayCode home"
    >
      <span className="clay-tile tone-mint grid size-11 place-items-center text-[var(--clay-mint-ink)] transition-transform duration-300 group-hover:-rotate-6">
        <Code2 className="size-5" strokeWidth={2.6} />
      </span>
      {showWordmark && (
        <span className="font-display text-xl font-semibold tracking-tight">
          Clay<span className="text-[var(--clay-mint-ink)]">Code</span>
        </span>
      )}
    </Link>
  );
}
