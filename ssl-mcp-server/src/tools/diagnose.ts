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
    "Validate SSL code for syntax errors, style violations, and common mistakes. Returns structured diagnostics with line/column, severity, and message. Pass code directly or a file path for large files. For data-source (.ds) content passed via code, set isDataSource so SQL bodies are not flagged with SSL checks.",
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
        // The validator returns an array; for single input there's exactly one entry
        const entry = Array.isArray(parsed) ? parsed[0] : parsed;
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
