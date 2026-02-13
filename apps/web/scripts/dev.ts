const { spawn } = require("node:child_process") as typeof import("node:child_process");
const { mkdirSync, readFileSync, rmSync, writeFileSync } = require("node:fs") as typeof import("node:fs");
const path = require("node:path") as typeof import("node:path");

const DEFAULT_PORT = "3000";
const LOCK_FILE = path.join(process.cwd(), ".next-dev.lock");

type DevLockState = {
  pid: number;
  port: string;
  started_at: string;
};

function readPort(argv: string[]): string {
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "-p" || token === "--port") {
      const nextValue = argv[i + 1];
      if (nextValue && !nextValue.startsWith("-")) return nextValue;
    }
    if (token.startsWith("--port=")) {
      const inline = token.slice("--port=".length).trim();
      if (inline) return inline;
    }
  }
  return process.env.PORT?.trim() || DEFAULT_PORT;
}

function processIsAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
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

function removeLock(): void {
  try {
    rmSync(LOCK_FILE, { force: true });
  } catch {
    // no-op
  }
}

function claimLock(state: DevLockState): void {
  mkdirSync(path.dirname(LOCK_FILE), { recursive: true });

  const existing = readLockState();
  if (existing && processIsAlive(existing.pid)) {
    console.error(
      `Refusing to start a second dev server for apps/web while PID ${existing.pid} is running on port ${existing.port}.`,
    );
    process.exit(1);
  }
  if (existing) removeLock();

  writeFileSync(LOCK_FILE, JSON.stringify(state), { encoding: "utf8", flag: "wx" });
}

const args = process.argv.slice(2);
const port = readPort(args);
const lockState: DevLockState = {
  pid: process.pid,
  port,
  started_at: new Date().toISOString(),
};

try {
  claimLock(lockState);
} catch (error) {
  const e = error as NodeJS.ErrnoException;
  if (e.code === "EEXIST") {
    const existing = readLockState();
    if (existing && processIsAlive(existing.pid)) {
      console.error(
        `Refusing to start a second dev server for apps/web while PID ${existing.pid} is running on port ${existing.port}.`,
      );
      process.exit(1);
    }
    removeLock();
    claimLock(lockState);
  } else {
    throw error;
  }
}

const child = spawn("next", ["dev", ...args], {
  env: process.env,
  stdio: "inherit",
});

const forwardedSignals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGHUP"];
let cleanedUp = false;

function cleanup(): void {
  if (cleanedUp) return;
  cleanedUp = true;
  const current = readLockState();
  if (current?.pid === process.pid) removeLock();
}

for (const signal of forwardedSignals) {
  process.on(signal, () => {
    if (!child.killed) child.kill(signal);
  });
}

process.on("exit", cleanup);

child.on("exit", (code, signal) => {
  cleanup();
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
