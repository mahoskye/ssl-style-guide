import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";

const SignatureSchema = z.object({
  name: z.string().describe("Function or class name"),
});

export function registerSignature(server: McpServer, indices: Indices): void {
  server.tool(
    "ssl_signature",
    "Get documented syntax and related details for a function or class.",
    SignatureSchema.shape,
    async ({ name }) => {
      const key = name.toLowerCase().trim();
      const el = indices.elementsByName.get(key);

      if (!el) {
        return {
          content: [{ type: "text", text: `No SSL element found for "${name}".` }],
          isError: true,
        };
      }

      if (el.type !== "function" && el.type !== "class") {
        return {
          content: [
            {
              type: "text",
              text: `"${el.name}" is a ${el.type}, not a function or class. Use ssl_lookup for non-function elements.`,
            },
          ],
        };
      }

      const result: Record<string, unknown> = {
        name: el.name,
        type: el.type,
        syntax: el.syntax,
      };

      if (el.type === "class") {
        result["members"] = el.members;
      }

      if (el.related) {
        result["related"] = el.related;
      }

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
