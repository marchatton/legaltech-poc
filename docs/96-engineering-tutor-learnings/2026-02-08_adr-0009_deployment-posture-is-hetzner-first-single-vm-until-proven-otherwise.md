# ADR-0009: Deployment posture is Hetzner-first (single VM) until proven otherwise

Status: accepted  
Date: 2026-02-06  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
We want a PoC that stays up, is easy to debug, and can run long jobs. The simplest way to get that is: run everything on one real server you control.

So the default is one Hetzner VM that runs:
- the Next.js server (web app and API)
- the WDK worker (background durable workflows)
- Postgres (the database)
- optionally MinIO (object storage, if we choose to self-host it)

This is not because Vercel is bad. It is because serverless platforms are optimized for short, stateless work, and our PoC has durable orchestration plus long-running side effects like OCR, embeddings, and LLM calls.

Simplification: this explainer ignores high availability, multi-region, and auto-scaling. Those become relevant when we have proof we need them.

## Metaphor/analogy (with mapping + where it breaks)
Think of this PoC as a single well-equipped workshop before you build a factory.

Mapping:
- Hetzner VM: the workshop building you own.
- Next.js server: the front desk that takes requests and talks to customers.
- WDK worker: the technician in the back doing long jobs and resuming work after interruptions.
- Postgres: the filing cabinet where all job state and data is stored.
- MinIO (optional): the storage room for large files.
- Vercel (later option): renting a storefront for the front desk, while keeping the filing cabinet and technician in your workshop.

Where the metaphor breaks:
- Real systems have network boundaries, security controls, and failure isolation that a single-building metaphor glosses over.
- Serverless traffic can create connection bursts to Postgres.
- Moving the web app off the VM changes latency and trust boundaries more than moving a physical desk.

## Visual explanation (small ASCII diagram)
```text
Default (Hetzner-first, single VM)
[Browser] -> HTTPS -> [Hetzner VM]
                      | Next.js server (apps/web)
                      | WDK worker (durable workflows)
                      | Postgres
                      ` MinIO (optional)

Later (optional split)
[Browser] -> [Vercel: apps/web] -> [VM: WDK worker + Postgres (+ MinIO)]
```

## Step-by-step breakdown
1. A user hits the web app and API served by the Next.js server.
2. The server can kick off a workflow for work that is long-running or failure-prone (OCR, embeddings, LLM calls).
3. The WDK worker executes those workflow steps as a long-lived process, with retries and resumability.
4. Postgres is local to the VM, so the server and worker avoid common serverless database connection pitfalls (too many short-lived connections at once).
5. If we need S3-like storage, we can add MinIO on the VM, but that also means we own its durability and backups.
6. Because we own the VM, we own basic ops: TLS, process supervision, backups, and monitoring.
7. Once the runtime shape is stable and we have evidence we need a different posture, we can split pieces. A likely first move is web app to Vercel for previews, while keeping worker and Postgres on the VM.

Inputs (what this posture expects):
- A workload with long-running side effects (OCR/embeddings/LLM calls).
- A need for durable orchestration (WDK worker stays running).
- A Postgres database that must not be overwhelmed by bursty serverless connections.
- Basic ops capacity (TLS, restarts, backups, monitoring).

Outputs (what this posture gives you):
- A stable demo environment with fewer moving parts.
- Easier debugging (one place to check logs and processes).
- A clear default deployment target that matches the PoC runtime needs.

Trade-offs:
- Pro: simpler system, faster to ship a stable demo.
- Con: single VM is a single blast radius and not horizontally scalable by default.
- Pro: predictable runtime for worker processes.
- Con: we take on operational responsibilities earlier.

Failure modes to watch:
- VM outage: web, worker, and database all go down together.
- Disk fills up: Postgres and file storage fail in surprising ways.
- Backups not restorable: you only learn this during an incident unless you test restores.
- Process supervision misconfig: worker silently stops, workflows stall.
- TLS/secrets mistakes: security exposure or downtime.

Why this design vs alternatives:
- Vercel-first (serverless) is great for stateless web, but a poor default for durable workers and long-running side effects, and it can create database connection problems without pooling and limits.
- Multi-VM or Kubernetes adds complexity before the product/runtime shape is stable.
- Managed database + serverless web is viable later, but introduces more providers, network boundaries, and debugging surface area during the PoC.

## Common misunderstandings
- "Hetzner-first means we are locked into Hetzner." It means it is the default target until we have evidence to change.
- "Single VM means no separation of concerns." We still separate concerns by process (server vs worker) and explicit contracts.
- "Vercel is banned." It is explicitly optional later, especially for `apps/web` and previews.
- "This is production-grade HA." It is a PoC posture optimized for stability and debugging speed, not maximum uptime.
- "MinIO is free durability." If we self-host storage, we own backups and durability, like Postgres.

## Check understanding (teach-back question)
In 3 to 5 sentences, explain: what runs on the single Hetzner VM, why that helps with WDK workflows and long-running side effects, and what concrete evidence would make you recommend moving `apps/web` to Vercel or splitting into multiple machines.

