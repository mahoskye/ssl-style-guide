import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { parse as parseYaml } from "yaml";
import type { Element, ClassMemberValidationFile } from "../types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// dist/data/loader.js → ../../data/ (i.e. ssl-mcp-server/data/)
const DATA_DIR = resolve(__dirname, "..", "..", "data");

function dataPath(filename: string): string {
  return resolve(DATA_DIR, filename);
}

export interface LoadedData {
  elements: Element[];
  classMemberValidation: ClassMemberValidationFile;
  styleGuide: Record<string, unknown>;
  agentInstructions: string;
  refactoringGuide: string;
  ebnfGrammar: string;
}

export function loadAllData(): LoadedData {
  const elements: Element[] = JSON.parse(readFileSync(dataPath("ssl-element-list.json"), "utf-8"));
  const classMemberValidation: ClassMemberValidationFile = JSON.parse(
    readFileSync(dataPath("class-member-validation.json"), "utf-8")
  );
  const styleGuide = parseYaml(readFileSync(dataPath("ssl-style-guide.schema.yaml"), "utf-8")) as Record<string, unknown>;
  const agentInstructions = readFileSync(dataPath("ssl_agent_instructions.md"), "utf-8");
  const refactoringGuide = readFileSync(dataPath("ssl_refactoring_guide.md"), "utf-8");
  const ebnfGrammar = readFileSync(dataPath("ssl-ebnf-grammar.md"), "utf-8");

  // Log counts to stderr for verification
  const byType = elements.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});

  process.stderr.write(
    `[ssl-mcp-server] Loaded ${elements.length} elements: ` +
      Object.entries(byType)
        .map(([t, n]) => `${n} ${t}s`)
        .join(", ") +
      "\n"
  );
  process.stderr.write(
    `[ssl-mcp-server] Loaded ${classMemberValidation.classes.length} class member validations\n`
  );

  return {
    elements,
    classMemberValidation,
    styleGuide,
    agentInstructions,
    refactoringGuide,
    ebnfGrammar,
  };
}
