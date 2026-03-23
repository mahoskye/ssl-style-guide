import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Indices } from "../data/indices.js";
import type { NamingValidationResult } from "../types.js";

const ValidateNamingSchema = z.object({
  name: z.string().describe("Variable name to check (e.g. sUserName, nCount)"),
  expected_type: z
    .string()
    .optional()
    .describe("Expected type to validate prefix against (e.g. string, numeric, boolean)"),
});

const SSL_CONSTANTS = new Set([".T.", ".F.", "NIL"]);
const LOOP_COUNTERS = new Set(["i", "j", "k", "x", "y", "z"]);
const UPPER_SNAKE_CASE = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/;

function isCamelCase(body: string): boolean {
  if (!body) return false;
  // Body starts with uppercase letter
  return /^[A-Z]/.test(body);
}

export function registerValidateNaming(server: McpServer, indices: Indices): void {
  server.tool(
    "ssl_validate_naming",
    "Check if a variable name follows SSL Hungarian notation.",
    ValidateNamingSchema.shape,
    async ({ name, expected_type }) => {
      const issues: string[] = [];

      // Exempt SSL constants
      if (SSL_CONSTANTS.has(name)) {
        const result: NamingValidationResult = {
          valid: true,
          prefix: "",
          inferred_type: "ssl_constant",
          body: name,
          issues: [],
        };
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      // Exempt loop counters
      if (LOOP_COUNTERS.has(name)) {
        const result: NamingValidationResult = {
          valid: true,
          prefix: name,
          inferred_type: "loop_counter",
          body: "",
          issues: [],
        };
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      // Exempt documented constant style
      if (UPPER_SNAKE_CASE.test(name)) {
        const result: NamingValidationResult = {
          valid: true,
          prefix: "",
          inferred_type: "constant",
          body: name,
          issues: [],
        };
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      // Find matching prefix — try longest match first
      let matchedPrefix = "";
      let inferredType: string | null = null;

      // Sort prefixes by length descending so "fn" matches before "f"
      const sortedPrefixes = Array.from(indices.hungarianPrefixes.entries()).sort(
        (a, b) => b[0].length - a[0].length
      );

      for (const [pfx, typeName] of sortedPrefixes) {
        if (name.startsWith(pfx) && name.length > pfx.length) {
          matchedPrefix = pfx;
          inferredType = typeName;
          break;
        }
      }

      const body = matchedPrefix ? name.slice(matchedPrefix.length) : name;

      if (!matchedPrefix) {
        issues.push(`No recognized Hungarian notation prefix found. Expected one of: ${Array.from(indices.hungarianPrefixes.keys()).sort().join(", ")}`);
      }

      if (matchedPrefix && !isCamelCase(body)) {
        issues.push(`Body "${body}" should start with an uppercase letter after the prefix (for example, sUserName).`);
      }

      if (expected_type && inferredType && inferredType !== expected_type) {
        issues.push(`Prefix "${matchedPrefix}" indicates type "${inferredType}" but expected type "${expected_type}".`);
      }

      const result: NamingValidationResult = {
        valid: issues.length === 0,
        prefix: matchedPrefix,
        inferred_type: inferredType,
        body,
        issues,
      };

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
