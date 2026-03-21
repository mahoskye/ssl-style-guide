import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { loadAllData } from "./data/loader.js";
import { buildIndices } from "./data/indices.js";
import { createServer } from "./server.js";

export async function main(): Promise<void> {
  const data = loadAllData();
  const indices = buildIndices(data);
  const server = createServer(indices);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("[ssl-mcp-server] Ready\n");
}

const entryArg = process.argv[1];
const isEntrypoint =
  entryArg !== undefined &&
  import.meta.url === pathToFileURL(resolve(entryArg)).href;

if (isEntrypoint) {
  main().catch((err) => {
    process.stderr.write(`[ssl-mcp-server] Fatal: ${err}\n`);
    process.exit(1);
  });
}
