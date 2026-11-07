import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-16 size-72 rounded-full bg-[var(--clay-mint)] opacity-60" />
        <div className="absolute -right-20 bottom-10 size-80 rounded-full bg-[var(--clay-butter)] opacity-70" />
      </div>

      <div className="clay w-full max-w-md p-8 text-center">
        <div className="mb-5 flex justify-center">
          <Brand />
        </div>
        <div className="clay-tile tone-peach mx-auto grid size-20 place-items-center font-display text-3xl font-semibold text-[var(--clay-peach-ink)]">
          404
        </div>
        <h1 className="mt-5 text-3xl font-semibold">This quest is missing</h1>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          The page you were looking for got squished. Let&apos;s get you back to
          the learning paths.
        </p>
        <Button asChild className="clay-btn mt-6 h-12 rounded-2xl px-6 font-extrabold">
          <Link to="/">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
