import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "./data/indices.js";
import { registerLookup } from "./tools/lookup.js";
import { registerSearch } from "./tools/search.js";
import { registerSignature } from "./tools/signature.js";
import { registerValidateNaming } from "./tools/validate-naming.js";
import { registerStyleRule } from "./tools/style-rule.js";
import { registerCategory } from "./tools/category.js";
import { registerContextPack } from "./tools/context-pack.js";
import { registerDiagnose } from "./tools/diagnose.js";
import { registerFormat } from "./tools/format.js";
import { registerElementResources } from "./resources/elements.js";
import { registerClassResources } from "./resources/classes.js";
import { registerCategoryResources } from "./resources/categories.js";
import { registerStyleGuideResources } from "./resources/style-guide.js";
import { registerReferenceResources } from "./resources/reference.js";
import { registerMachineResources } from "./resources/machine.js";
import { registerCodeReviewPrompt } from "./prompts/code-review.js";
import { registerRefactoringPrompt } from "./prompts/refactoring.js";
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from "./constants.js";

export function createServer(indices: Indices): McpServer {
  const server = new McpServer({
    name: MCP_SERVER_NAME,
    version: MCP_SERVER_VERSION,
  });

  // Tools
  registerLookup(server, indices);
  registerSearch(server, indices);
  registerSignature(server, indices);
  registerValidateNaming(server, indices);
  registerStyleRule(server, indices);
  registerCategory(server, indices);
  registerContextPack(server, indices);
  registerDiagnose(server);
  registerFormat(server);

  // Resources
  registerElementResources(server, indices);
  registerClassResources(server, indices);
  registerCategoryResources(server, indices);
  registerStyleGuideResources(server, indices);
  registerReferenceResources(server, indices);
  registerMachineResources(server, indices);

  // Prompts
  registerCodeReviewPrompt(server, indices);
  registerRefactoringPrompt(server, indices);

  return server;
}
