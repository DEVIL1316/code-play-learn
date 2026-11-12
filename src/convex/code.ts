"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * Non-Python languages are compiled and executed by the public Judge0 sandbox.
 * Keeping this behind an authenticated Convex action means the browser can run
 * code without talking to a third-party API directly.
 */
const LANGUAGE_IDS: Record<string, number> = {
  c: 103,
  cpp: 105,
  javascript: 102,
  java: 91,
  go: 107,
};

/* Point this at a self-hosted Judge0 instance in production if needed. */
const JUDGE0_ENDPOINT =
  process.env.JUDGE0_ENDPOINT ?? "https://ce.judge0.com";
const MAX_SOURCE_LENGTH = 20_000;
const REMOTE_TIMEOUT = 35_000;

type JudgeStatus = { id: number; description: string };

type JudgeResult = {
  token?: string;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: JudgeStatus;
};

function friendlyFailure(status?: JudgeStatus) {
  if (status?.id === 5) {
    return "Time limit reached. Check for an infinite loop, then run again.";
  }
  if (status?.id === 6) {
    return "The compiler found an error. Read the messages in the console.";
  }
  if (status?.id === 4) {
    return "The program stopped with a runtime error.";
  }
  return status?.description
    ? `The program finished with: ${status.description.toLowerCase()}.`
    : "The program could not finish.";
}

export const runRemoteCode = action({
  args: {
    language: v.string(),
    source: v.string(),
  },
  handler: async (ctx, { language, source }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to run code.");

    const languageId = LANGUAGE_IDS[language];
    if (!languageId) throw new Error("That language does not have a runner.");
    if (source.length > MAX_SOURCE_LENGTH) {
      return {
        output: "",
        error: `Keep programs under ${MAX_SOURCE_LENGTH.toLocaleString()} characters.`,
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REMOTE_TIMEOUT);

    try {
      const response = await fetch(
        `${JUDGE0_ENDPOINT}/submissions?base64_encoded=false&wait=true`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language_id: languageId,
            source_code: source,
            stdin: "",
            cpu_time_limit: 5,
            wall_time_limit: 10,
          }),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        const busy = response.status === 429;
        return {
          output: "",
          error: busy
            ? "The shared compiler is busy right now. Wait a few seconds and run again."
            : `The remote compiler could not start (HTTP ${response.status}). Try again in a moment.`,
        };
      }

      let result = (await response.json()) as JudgeResult;

      /* wait=true usually blocks, but a busy shared queue can still return early. */
      for (
        let tries = 0;
        tries < 20 &&
        result.token &&
        (result.status?.id === 1 || result.status?.id === 2);
        tries++
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const poll = await fetch(
          `${JUDGE0_ENDPOINT}/submissions/${result.token}?base64_encoded=false`,
          { signal: controller.signal },
        );
        if (!poll.ok) break;
        result = (await poll.json()) as JudgeResult;
      }

      const output = result.stdout ?? "";
      if (result.status?.id === 3) {
        return { output, error: null };
      }

      const detail = [result.compile_output, result.stderr, result.message]
        .filter((part): part is string => Boolean(part && part.trim()))
        .join("\n")
        .trim();

      return {
        output,
        error: detail || friendlyFailure(result.status),
      };
    } catch (caught) {
      if ((caught as Error).name === "AbortError") {
        return {
          output: "",
          error:
            "The remote compiler took too long. Check your connection and try again.",
        };
      }
      return {
        output: "",
        error:
          "Could not reach the remote compiler. Check your internet connection and try again.",
      };
    } finally {
      clearTimeout(timer);
    }
  },
});
