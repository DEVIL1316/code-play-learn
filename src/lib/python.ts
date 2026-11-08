export type PythonResult = {
  output: string;
  error: string | null;
};

type Pending = {
  resolve: (result: PythonResult) => void;
  timer: ReturnType<typeof setTimeout>;
};

const FIRST_RUN_TIMEOUT = 90_000;
const RUN_TIMEOUT = 8_000;

let worker: Worker | null = null;
let nextId = 0;
let runtimeReady = false;
const pending = new Map<number, Pending>();

function failPending(message: string) {
  for (const [id, entry] of pending) {
    clearTimeout(entry.timer);
    entry.resolve({ output: "", error: message });
    pending.delete(id);
  }
}

function resetWorker(message = "Python restarted. Try running your program again.") {
  worker?.terminate();
  worker = null;
  runtimeReady = false;
  failPending(message);
}

function ensureWorker(): Worker {
  if (worker) return worker;

  const next = new Worker(new URL("./python-worker.ts", import.meta.url), {
    type: "module",
  });

  next.onmessage = (
    event: MessageEvent<
      PythonResult & { id: number } | { type: "ready" }
    >,
  ) => {
    if ("type" in event.data) {
      runtimeReady = true;
      return;
    }
    const entry = pending.get(event.data.id);
    if (!entry) return;
    clearTimeout(entry.timer);
    pending.delete(event.data.id);
    entry.resolve({
      output: event.data.output,
      error: event.data.error,
    });
  };

  next.onerror = () => {
    resetWorker(
      "Python could not start. Check your internet connection and try again.",
    );
  };

  worker = next;
  return next;
}

/** Download the Python runtime before the player presses Run. */
export function preloadPython() {
  try {
    ensureWorker();
  } catch {
    /* The Run action will surface a helpful error if workers are unavailable. */
  }
}

/** Run Python in a worker. Resolves with captured output or a readable error. */
export function runPython(code: string): Promise<PythonResult> {
  let active: Worker;
  try {
    active = ensureWorker();
  } catch {
    return Promise.resolve({
      output: "",
      error: "This browser could not start the Python runtime.",
    });
  }

  const id = ++nextId;
  const wasReady = runtimeReady;
  const timeout = wasReady ? RUN_TIMEOUT : FIRST_RUN_TIMEOUT;

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      resetWorker();
      resolve({
        output: "",
        error: wasReady
          ? "Time limit reached. Check for an infinite loop, then run again."
          : "Python is taking too long to load. Check your connection and try again.",
      });
    }, timeout);

    pending.set(id, { resolve, timer });
    active.postMessage({ id, code });
  });
}

/** Compare program output while ignoring trailing spaces and blank end lines. */
export function normalizeOutput(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n+$/, "");
}

export function outputsMatch(actual: string, expected: string) {
  return normalizeOutput(actual) === normalizeOutput(expected);
}
