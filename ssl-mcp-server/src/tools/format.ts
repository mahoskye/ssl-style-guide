import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatSsl } from "../lsp/runner.js";

const FormatSchema = z.object({
  code: z.string().optional().describe("SSL source code to format (provide this or file, not both)"),
  file: z.string().optional().describe("Absolute path to an SSL file to format (avoids piping large files through stdin)"),
});

export function registerFormat(server: McpServer): void {
  server.tool(
    "ssl_format",
    "Format SSL source code using canonical style-guide rules. Returns the formatted code with proper indentation, keyword normalization, operator spacing, semicolons, and embedded SQL formatting. Pass code directly or a file path for large files.",
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
        result = await formatSsl(file ? { file } : { code: code! });
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

      return {
        content: [{ type: "text" as const, text: result.stdout }],
      };
    }
  );
}
