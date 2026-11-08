/**
 * Worker-side Python runtime. Pyodide is fetched once from a pinned CDN and
 * cached by the browser. Running it off the main thread lets the UI stay alive
 * and lets the app terminate runaway programs.
 */
const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.29.5/full/";

type Pyodide = {
  runPythonAsync: (source: string) => Promise<unknown>;
};

type RunRequest = { id: number; code: string };
type RunResponse = {
  id: number;
  output: string;
  error: string | null;
};

const scope = self as unknown as {
  postMessage: (message: RunResponse | { type: "ready" }) => void;
  onmessage: ((event: MessageEvent<RunRequest>) => void) | null;
};

let runtime: Promise<Pyodide> | null = null;

function load(): Promise<Pyodide> {
  if (!runtime) {
    runtime = import(/* @vite-ignore */ `${PYODIDE_URL}pyodide.mjs`)
      .then(
        (module: {
          loadPyodide: (options: { indexURL: string }) => Promise<Pyodide>;
        }) => module.loadPyodide({ indexURL: PYODIDE_URL }),
      )
      .then((pyodide) => {
        scope.postMessage({ type: "ready" });
        return pyodide;
      })
      .catch((error) => {
        runtime = null;
        throw error;
      });
  }
  return runtime;
}

/* Start downloading the runtime as soon as the worker is created. */
void load().catch(() => {});

scope.onmessage = async ({ data }) => {
  const { id, code } = data;
  let output = "";
  let error: string | null = null;

  try {
    const pyodide = await load();

    /* Capture stdout and exceptions as JSON so nothing is lost when code fails. */
    const program = `import io, sys, traceback, json
_code = ${JSON.stringify(code)}
_buffer = io.StringIO()
_old_stdout = sys.stdout
sys.stdout = _buffer
_error = ""
try:
    exec(compile(_code, "<player>", "exec"), {"__name__": "__main__"})
except Exception:
    _error = traceback.format_exc()
finally:
    sys.stdout = _old_stdout
json.dumps({"output": _buffer.getvalue(), "error": _error})`;

    const raw = await pyodide.runPythonAsync(program);
    const parsed = JSON.parse(String(raw)) as {
      output: string;
      error: string;
    };
    const MAX_OUTPUT = 20_000;
    output =
      parsed.output.length > MAX_OUTPUT
        ? `${parsed.output.slice(0, MAX_OUTPUT)}\n… output truncated`
        : parsed.output;
    error = parsed.error.trim() ? parsed.error : null;
  } catch (caught) {
    error =
      caught instanceof Error
        ? caught.message
        : "Python could not run that program.";
  }

  scope.postMessage({ id, output, error });
};
