"use client";

import { useState, type FormEvent } from "react";

import { useRouter } from "next/navigation";

import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { ErrorBanner } from "../../ui/ErrorBanner";
import { Input } from "../../ui/Input";

type StructuredError = {
  code: string;
  message: string;
  retryable?: boolean;
};

function parseCreateError(payload: unknown): { code: string; message: string } {
  if (payload && typeof payload === "object") {
    const asRecord = payload as Record<string, unknown>;
    const nestedError = asRecord.error;
    if (nestedError && typeof nestedError === "object") {
      const nested = nestedError as Record<string, unknown>;
      const code = typeof nested.code === "string" && nested.code.length > 0 ? nested.code : null;
      const message = typeof nested.message === "string" && nested.message.length > 0 ? nested.message : null;
      if (message) return { code: code ?? "SERVER_ERROR", message };
    }

    if (typeof asRecord.message === "string" && asRecord.message.length > 0) {
      return { code: "SERVER_ERROR", message: asRecord.message };
    }
  }
  return { code: "SERVER_ERROR", message: "Could not create matter." };
}

export function CreateMatterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<StructuredError | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError({ code: "VALIDATION_ERROR", message: "Matter name is required." });
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const parsed = parseCreateError(payload);
        setError({ ...parsed, retryable: true });
        return;
      }

      const folderId = payload && typeof payload === "object" ? (payload as { folder?: { id?: unknown } }).folder?.id : null;
      if (typeof folderId !== "string" || folderId.length === 0) {
        setError({ code: "INVALID_RESPONSE", message: "Matter was created but could not be opened.", retryable: false });
        return;
      }

      setName("");
      router.push(`/matters/${encodeURIComponent(folderId)}`);
      router.refresh();
    } catch {
      setError({ code: "NETWORK_ERROR", message: "Could not create matter.", retryable: true });
    } finally {
      setPending(false);
    }
  }

  const isValidationError = error?.code === "VALIDATION_ERROR";

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2" noValidate>
      <label className="grid gap-1 text-sm">
        <span className="text-muted-foreground">Matter name</span>
        <Input
          name="name"
          value={name}
          onChange={(event) => {
            setName(event.currentTarget.value);
            if (error) setError(null);
          }}
          placeholder="e.g. Acme Corp v. GlobalTech"
          aria-label="Matter name"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "create-matter-error" : undefined}
        />
      </label>

      <Button type="submit" loading={pending} loadingLabel="Creating">
        New Matter
      </Button>

      {error && isValidationError ? (
        <Alert id="create-matter-error" variant="destructive" hideIcon className="w-full">
          {error.message}
        </Alert>
      ) : null}

      {error && !isValidationError ? (
        <div className="w-full" id="create-matter-error">
          <ErrorBanner
            code={error.code}
            message={error.message}
            retryable={error.retryable}
            onRetry={error.retryable ? () => setError(null) : undefined}
          />
        </div>
      ) : null}
    </form>
  );
}
