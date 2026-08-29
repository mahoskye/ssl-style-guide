import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { validateSsl } from "../lsp/runner.js";

const DiagnoseSchema = z.object({
  code: z.string().optional().describe("SSL source code to validate (provide this or file, not both)"),
  file: z.string().optional().describe("Absolute path to an SSL file to validate (avoids piping large files through stdin)"),
  isDataSource: z
    .boolean()
    .optional()
    .describe(
      "Set true when validating data-source (.ds) content passed via code — data-source SQL is exempt from SSL checks, and stdin has no file extension to detect. Files with a .ds extension are classified automatically."
    ),
});

export function registerDiagnose(server: McpServer): void {
  server.tool(
    "ssl_diagnose",
    "Validate SSL code for syntax errors, style violations, and common mistakes. Returns structured diagnostics with line/column, severity, message, and a stable rule code for programmatic filtering. Includes info-severity advisories (style observations and idiom notes) and hungarian_type_mismatch, which reports a variable whose Hungarian prefix promises one type while its expression produces another; treat errors/warnings as actionable and info as context. The naming-convention audit (hungarian_notation) is deliberately not included. Pass code directly or a file path for large files. For data-source (.ds) content passed via code, set isDataSource so SQL bodies are not flagged with SSL checks.",
    DiagnoseSchema.shape,
    async ({ code, file, isDataSource }) => {
      if (!code && !file) {
        return {
          content: [{ type: "text" as const, text: "Provide either 'code' or 'file' parameter" }],
          isError: true,
        };
      }

      let result;
      try {
        result = await validateSsl(file ? { file, isDataSource } : { code: code!, isDataSource });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `LSP binary error: ${msg}` }],
          isError: true,
        };
      }

      // --validate outputs a JSON array to stdout
      const output = result.stdout.trim();
      if (!output) {
        return {
          content: [
            {
              type: "text" as const,
              text: result.stderr
                ? `Validation failed: ${result.stderr}`
                : "No output from validator",
            },
          ],
          isError: true,
        };
      }

      // Parse and re-serialize for consistent formatting
      try {
        const parsed = JSON.parse(output);
        const entries: Array<{ file?: string }> = Array.isArray(parsed) ? parsed : [parsed];
        // A binary older than the pinned release doesn't know a flag we
        // pass and reads it as a file path, emitting a phantom
        // failed-read entry alongside (or instead of) the real one. Fail
        // loudly rather than returning the wrong entry. Matched on the
        // `--` prefix rather than a list of flag names, so a future flag
        // is covered the day it is added.
        const unsupported = entries.find((e) => e?.file?.startsWith("--"));
        if (unsupported) {
          return {
            content: [
              {
                type: "text" as const,
                text:
                  `The bundled starlims-lsp binary predates the pinned release and does not ` +
                  `support ${unsupported.file}. Run "bun run fetch-lsp" in ssl-mcp-server/ to update it.`,
              },
            ],
            isError: true,
          };
        }
        // The validator returns an array; for single input there's exactly one entry
        const entry = entries[0];
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(entry, null, 2) },
          ],
        };
      } catch {
        // If JSON parsing fails, return raw output
        return {
          content: [{ type: "text" as const, text: output }],
        };
      }
    }
  );
}
