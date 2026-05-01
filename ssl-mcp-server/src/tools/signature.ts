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
        title: el.title,
        type: el.type,
        summary: el.summary,
      };

      if (el.type === "function") {
        if (el.signature) result["signature"] = el.signature;
        if (el.parameters) result["parameters"] = el.parameters;
        if (el.returns) result["returns"] = el.returns;
      } else {
        if (el.constructors) result["constructors"] = el.constructors;
        if (el.properties) result["properties"] = el.properties;
        if (el.methods) result["methods"] = el.methods;
        if (el.base_class) result["base_class"] = el.base_class;
      }

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
