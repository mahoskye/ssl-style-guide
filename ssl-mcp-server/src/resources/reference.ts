import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";

export function registerReferenceResources(server: McpServer, indices: Indices): void {
  // ssl://grammar
  server.resource(
    "ssl-grammar",
    "ssl://grammar",
    { description: "SSL EBNF grammar in Markdown" },
    async (uri) => {
      return {
        contents: [{ uri: uri.href, mimeType: "text/markdown", text: indices.ebnfGrammar }],
      };
    }
  );

  // ssl://language-reference
  server.resource(
    "ssl-language-reference",
    "ssl://language-reference",
    { description: "SSL language reference and agent instructions" },
    async (uri) => {
      return {
        contents: [{ uri: uri.href, mimeType: "text/markdown", text: indices.agentInstructions }],
      };
    }
  );
}
