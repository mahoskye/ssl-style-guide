import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { validateSsl } from "../lsp/runner.js";

const DiagnoseSchema = z.object({
  code: z.string().describe("SSL source code to validate"),
});

export function registerDiagnose(server: McpServer): void {
  server.tool(
    "ssl_diagnose",
    "Validate SSL code for syntax errors, style violations, and common mistakes. Returns structured diagnostics with line/column, severity, and message.",
    DiagnoseSchema.shape,
    async ({ code }) => {
      let result;
      try {
        result = await validateSsl(code);
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
        // The validator returns an array; for --stdin there's exactly one entry
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
