import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatSslChecked } from "../lsp/runner.js";

const FormatSchema = z.object({
  code: z.string().optional().describe("SSL source code to format (provide this or file, not both)"),
  file: z.string().optional().describe("Absolute path to an SSL file to format (avoids piping large files through stdin)"),
});

export function registerFormat(server: McpServer): void {
  server.tool(
    "ssl_format",
    "Format SSL source code using canonical style-guide rules. Returns the formatted code with proper indentation, keyword normalization, operator spacing, and semicolons. It does NOT format embedded SQL strings — format those by hand. Formatting is whole-file: on a legacy file it typically rewrites most lines, so reformatting a file you only made a small change to will bury that change in churn. Format files you created; for an existing file, reformat only when reformatting is the task. The result is checked for stability and flags the rare input the formatter cannot settle on. Pass code directly or a file path for large files.",
    FormatSchema.shape,
    async ({ code, file }) => {
      if (!code && !file) {
        return {
          content: [{ type: "text" as const, text: "Provide either 'code' or 'file' parameter" }],
          isError: true,
        };
      }

      let result;
      try {
        result = await formatSslChecked(file ? { file } : { code: code! });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `LSP binary error: ${msg}` }],
          isError: true,
        };
      }

      if (result.exitCode !== 0 && !result.stdout) {
        return {
          content: [
            {
              type: "text" as const,
              text: result.stderr
                ? `Format failed: ${result.stderr}`
                : "Formatter produced no output",
            },
          ],
          isError: true,
        };
      }

      // Idempotence holds on every measured corpus, so reaching here
      // means a formatter regression. Say so once and stop the caller
      // re-formatting a file that will never settle.
      if (result.unstable) {
        return {
          content: [
            {
              type: "text" as const,
              text:
                `NOTE: formatting this input is not stable — running the formatter on ` +
                `its own output changes it again. Formatting is supposed to be ` +
                `idempotent, so this is a formatter bug, not something to fix by ` +
                `re-running. Accept this result, review it by eye, report the ` +
                `instability, and include the input shape that triggered it.\n\n` +
                result.stdout,
            },
          ],
        };
      }

      return {
        content: [{ type: "text" as const, text: result.stdout }],
      };
    }
  );
}
