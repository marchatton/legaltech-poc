const { spawn } = require("node:child_process") as typeof import("node:child_process");
const { readFileSync } = require("node:fs") as typeof import("node:fs");
const path = require("node:path") as typeof import("node:path");

const LOCK_FILE = path.join(process.cwd(), ".next-dev.lock");

type DevLockState = {
  pid: number;
  port: string;
  started_at: string;
};

function processIsAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    // In restricted environments kill(0) can be denied even when process exists.
    if (err.code === "EPERM") return true;
    return false;
  }
}

function readLockState(): DevLockState | null {
  try {
    const raw = readFileSync(LOCK_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<DevLockState>;
    if (typeof parsed.pid !== "number") return null;
    if (typeof parsed.port !== "string") return null;
    if (typeof parsed.started_at !== "string") return null;
    return parsed as DevLockState;
  } catch {
    return null;
  }
}

const existing = readLockState();
if (existing && processIsAlive(existing.pid)) {
  console.error(
    `Refusing to run build while apps/web dev server is active (PID ${existing.pid}, port ${existing.port}). ` +
      "Stop dev first to avoid .next chunk corruption.",
  );
  process.exit(1);
}

const child = spawn("next", ["build", ...process.argv.slice(2)], {
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
