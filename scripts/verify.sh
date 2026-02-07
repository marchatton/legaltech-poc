#!/usr/bin/env bash
set -euo pipefail

# Keep fixtures and docs aligned (oracle closure criteria RH-2.10).
node --experimental-strip-types scripts/fixtures/verify_pack_names.ts

pnpm -s lint
pnpm -s test
pnpm -s build

echo "Verify OK."
