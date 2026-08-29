/**
 * Spawns the starlims-lsp Go binary in CLI mode (--validate or --format)
 * and pipes SSL content through stdin, returning the result.
 */

import { spawn } from "child_process";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Resolve the bundled LSP binary for the current platform. */
function resolveBinaryPath(): string {
  const binDir = resolve(__dirname, "..", "..", "bin", "lsp");
  const platform = process.platform; // "win32", "darwin", "linux"
  const arch = process.arch; // "x64", "arm64"

  const goArch = arch === "x64" ? "amd64" : arch;
  let name: string;

  if (platform === "win32") {
    name = `starlims-lsp-windows-${goArch}.exe`;
  } else if (platform === "darwin") {
    name = `starlims-lsp-darwin-${goArch}`;
  } else {
    name = `starlims-lsp-linux-${goArch}`;
  }

  const fullPath = resolve(binDir, name);
  if (!existsSync(fullPath)) {
    throw new Error(
      `LSP binary not found: ${fullPath}\n` +
        `Run "bun run fetch-lsp" to download it from the starlims-lsp GitHub ` +
        `release, or "bun run bundle-lsp" to build from a sibling checkout.`
    );
  }

  return fullPath;
}

let cachedBinaryPath: string | undefined;

function getBinaryPath(): string {
  if (!cachedBinaryPath) {
    cachedBinaryPath = resolveBinaryPath();
  }
  return cachedBinaryPath;
}

export interface LspRunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Run the LSP binary with the given CLI arguments, piping `input` to stdin.
 * Returns the captured stdout, stderr, and exit code.
 * Times out after 30 seconds to prevent indefinite hangs.
 */
export function runLsp(
  args: string[],
  input: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<LspRunResult> {
  return new Promise((resolve, reject) => {
    const bin = getBinaryPath();
    const child = spawn(bin, args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => stdoutChunks.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to spawn LSP binary: ${err.message}`));
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) {
        reject(new Error(`LSP binary timed out after ${timeoutMs}ms`));
        return;
      }
      resolve({
        stdout: Buffer.concat(stdoutChunks).toString("utf-8"),
        stderr: Buffer.concat(stderrChunks).toString("utf-8"),
        exitCode: code ?? 1,
      });
    });

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
  });
}

/**
 * Validate SSL code. Pass code as a string, or a file path to read directly.
 * Set isDataSource to classify the input as a data-source (.ds) document,
 * which exempts its SQL content from SSL checks; .ds file paths are
 * classified by extension without it.
 *
 * Always passes --info and --hungarian. Both tiers are opt-in in the LSP
 * (--info since starlims-lsp v0.18.0, --hungarian since v0.20.0) because
 * they are noisy in an editor, but both are designed for exactly this
 * LLM-facing surface: the info tier carries style observations and idiom
 * notes, and the Hungarian checks turn SSL's naming convention into a
 * type signal an assistant can act on. Consumers can filter on the
 * diagnostic's severity or code field for the everyday view — notably
 * hungarian_notation, which fires on legacy names that predate the
 * convention and is usually not worth acting on in old code.
 */
export async function validateSsl(
  input: ({ code: string } | { file: string }) & { isDataSource?: boolean }
): Promise<LspRunResult> {
  const dsFlag = input.isDataSource ? ["--ds"] : [];
  if ("file" in input) {
    return runLsp(["--validate", "--info", "--hungarian", ...dsFlag, input.file], "");
  }
  return runLsp(["--validate", "--info", "--hungarian", "--stdin", ...dsFlag], input.code);
}

/**
 * Format SSL code. Pass code as a string, or a file path to read directly.
 */
export async function formatSsl(
  input: { code: string } | { file: string }
): Promise<LspRunResult> {
  if ("file" in input) {
    return runLsp(["--format", input.file], "");
  }
  return runLsp(["--format", "--stdin"], input.code);
}
