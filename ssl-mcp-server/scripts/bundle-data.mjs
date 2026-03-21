#!/usr/bin/env node
/**
 * Sync data files into ssl-mcp-server/data/ for self-contained operation.
 *
 * This is a maintainer-only operation — run manually when upstream data changes.
 * The data/ directory is the runtime source used by the MCP server.
 */

import { readFileSync, writeFileSync, copyFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = resolve(__dirname, "..");
const REPO_ROOT = resolve(SERVER_ROOT, "..");
const DATA_DIR = resolve(SERVER_ROOT, "data");

const PUBLIC_STATUSES = new Set(["validated", "source_validated", "indirectly_accessible"]);

const refDir = resolve(REPO_ROOT, "..", "ssl-api-documentation", "ssl-reference");
try {
  readFileSync(resolve(refDir, "ssl-element-list.json"));
} catch {
  console.error(
    "Error: ssl-api-documentation sibling repo not found.\n" +
    "This is a maintainer-only operation. The data/ directory is the runtime source."
  );
  process.exit(1);
}

// 1. ssl-element-list.json — developer-facing elements, public fields only
const rawElements = JSON.parse(readFileSync(resolve(refDir, "ssl-element-list.json"), "utf-8"));
const elements = rawElements
  .filter((el) => el.developer_facing && PUBLIC_STATUSES.has(el.validation?.status))
  .map(({ type, name, symbol, syntax, members, related }) => ({
    type, name, symbol, syntax, members, related,
  }));
writeFileSync(resolve(DATA_DIR, "ssl-element-list.json"), JSON.stringify(elements, null, 2) + "\n");
console.log(`Bundled ssl-element-list.json (${elements.length} elements)`);

// 2. class-member-validation.json — class and member names only
const rawClassVal = JSON.parse(readFileSync(resolve(refDir, "class-member-validation.json"), "utf-8"));
const classVal = {
  classes: rawClassVal.classes
    .filter((cls) => cls.developer_facing)
    .map((cls) => {
      const entry = {
        name: cls.name,
        members: {
          methods: (cls.members.methods ?? []).map((m) => ({ name: m.name })),
        },
      };
      const props = (cls.members.properties ?? []).map((p) => ({ name: p.name }));
      if (props.length > 0) entry.members.properties = props;
      return entry;
    }),
};
writeFileSync(resolve(DATA_DIR, "class-member-validation.json"), JSON.stringify(classVal, null, 2) + "\n");
console.log(`Bundled class-member-validation.json (${classVal.classes.length} classes)`);

// 3. Supporting files — copy from canonical locations
const supportingFiles = [
  { src: "ssl-style-guide/ssl-style-guide.schema.yaml", dest: "ssl-style-guide.schema.yaml" },
  { src: "agent-guides/ssl_agent_instructions.md", dest: "ssl_agent_instructions.md" },
  { src: "agent-guides/ssl_refactoring_guide.md", dest: "ssl_refactoring_guide.md" },
  { src: "ssl-style-guide/ssl-ebnf-grammar.md", dest: "ssl-ebnf-grammar.md" },
];

for (const { src, dest } of supportingFiles) {
  copyFileSync(resolve(REPO_ROOT, src), resolve(DATA_DIR, dest));
  console.log(`Copied ${dest}`);
}

console.log("\nDone. All files synced to ssl-mcp-server/data/");
