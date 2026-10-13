import type { Variables } from "@modelcontextprotocol/sdk/shared/uriTemplate.js";

/**
 * Read one variable matched by a ResourceTemplate, percent-decoded.
 * A malformed escape sequence is returned as-is rather than throwing.
 */
export function templateVar(variables: Variables, name: string): string {
  const raw = variables[name];
  const value = Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
