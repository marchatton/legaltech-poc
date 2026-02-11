"use client";

import { useState, type FormEvent } from "react";

import { useRouter } from "next/navigation";

import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";

const EMPTY_NAME_MESSAGE = "Matter name is required.";

function parseCreateError(payload: unknown): string {
  if (payload && typeof payload === "object") {
    const asRecord = payload as Record<string, unknown>;
    const nestedError = asRecord.error;
    if (nestedError && typeof nestedError === "object") {
      const nestedMessage = (nestedError as Record<string, unknown>).message;
      if (typeof nestedMessage === "string" && nestedMessage.length > 0) {
        return nestedMessage;
      }
    }

    if (typeof asRecord.message === "string" && asRecord.message.length > 0) {
      return asRecord.message;
    }
  }
  return "Could not create matter.";
}

export function CreateMatterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError(EMPTY_NAME_MESSAGE);
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
        setError(parseCreateError(payload));
        return;
      }

      const folderId = payload && typeof payload === "object" ? (payload as { folder?: { id?: unknown } }).folder?.id : null;
      if (typeof folderId !== "string" || folderId.length === 0) {
        setError("Matter was created but could not be opened.");
        return;
      }

      setName("");
      router.push(`/matters/${encodeURIComponent(folderId)}`);
      router.refresh();
    } catch {
      setError("Could not create matter.");
    } finally {
      setPending(false);
    }
  }

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

      {error ? (
        <p id="create-matter-error" role="alert" className="w-full text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  );
}
