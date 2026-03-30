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
        `Run "bun scripts/bundle-lsp.mjs" to build and bundle the binaries.`
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

    child.stdin.write(input);
    child.stdin.end();
  });
}

/**
 * Validate SSL code. Returns parsed JSON diagnostics.
 */
export async function validateSsl(code: string): Promise<LspRunResult> {
  return runLsp(["--validate", "--stdin"], code);
}

/**
 * Format SSL code. Returns the formatted source on stdout.
 */
export async function formatSsl(code: string): Promise<LspRunResult> {
  return runLsp(["--format", "--stdin"], code);
}
