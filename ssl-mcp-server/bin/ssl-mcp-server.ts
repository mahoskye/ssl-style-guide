#!/usr/bin/env bun

import { main } from '../src/index.ts'

main().catch((err) => {
  process.stderr.write(`[ssl-mcp-server] Fatal: ${err}\n`)
  process.exit(1)
})
