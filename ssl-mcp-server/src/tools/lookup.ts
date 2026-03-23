import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";

const LookupSchema = z.object({
  name: z.string().describe("Element name or symbol, case-insensitive. E.g. SQLExecute, Email, :IF, ==, $"),
});

export function registerLookup(server: McpServer, indices: Indices): void {
  server.tool("ssl_lookup", "Look up an SSL element by exact name or symbol.", LookupSchema.shape, async ({ name }) => {
    const key = name.toLowerCase().trim();

    // Try by name first
    let el = indices.elementsByName.get(key);

    // Try stripping leading colon (keywords often queried as ":IF")
    if (!el && key.startsWith(":")) {
      el = indices.elementsByName.get(key.slice(1));
    }

    // Try by symbol
    if (!el) {
      el = indices.elementsBySymbol.get(key);
    }

    if (!el) {
      return {
        content: [{ type: "text", text: `No SSL element found for "${name}".` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(el, null, 2),
        },
      ],
    };
  });
}
