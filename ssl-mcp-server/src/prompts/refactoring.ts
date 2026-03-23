import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";
import { stringify as yamlStringify } from "yaml";

const RefactoringSchema = z.object({
  code: z.string().describe("SSL code to refactor"),
  goal: z.string().optional().describe("Specific refactoring focus or goal"),
});

export function registerRefactoringPrompt(server: McpServer, indices: Indices): void {
  server.prompt(
    "ssl_refactoring",
    "Generate a structured SSL refactoring prompt with the full refactoring guide and style rules.",
    RefactoringSchema.shape,
    async ({ code, goal }) => {
      const guide = (indices.styleGuide as Record<string, unknown>)["ssl_style_guide"] as
        | Record<string, unknown>
        | undefined;

      // Include key style sections for refactoring
      const keys = ["naming", "formatting", "error_handling", "control_flow", "procedures", "sql", "classes"];
      const relevantRules: Record<string, unknown> = {};
      if (guide) {
        for (const k of keys) {
          if (guide[k] !== undefined) relevantRules[k] = guide[k];
        }
      }

      const rulesText = yamlStringify(relevantRules);
      const goalText = goal ? `\n\nRefactoring goal: ${goal}` : "";

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Refactor the SSL code below following the SSL refactoring guide and style rules.${goalText}

## SSL Refactoring Guide

${indices.refactoringGuide}

## Relevant Style Rules

\`\`\`yaml
${rulesText}\`\`\`

## Code to Refactor

\`\`\`ssl
${code}
\`\`\`

Produce the complete refactored output. Explain significant changes.`,
            },
          },
        ],
      };
    }
  );
}
