import "server-only";

import { createGateway } from "@ai-sdk/gateway";

export const DEFAULT_CHAT_MODEL_ID = "anthropic/claude-haiku-4.5";
// Documented "later switch" target (PR0 decision). Not used by default.
export const LATER_CHAT_MODEL_ID = "anthropic/claude-sonnet-4.5";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function gatewayProvider() {
  // Fail closed; do not attempt OIDC auth in PR0.
  const apiKey = requireEnv("AI_GATEWAY_API_KEY");

  return createGateway({ apiKey });
}

/**
 * Returns a LanguageModel handle for chat (AI SDK).
 *
 * Default is Haiku; override with `LLM_MODEL_CHAT`.
 * Future toggle target is documented by `LATER_CHAT_MODEL_ID`.
 */
export function chatModel() {
  const modelId = process.env.LLM_MODEL_CHAT?.trim() || DEFAULT_CHAT_MODEL_ID;
  return gatewayProvider().languageModel(modelId);
}

/**
 * Returns an EmbeddingModel handle (AI SDK).
 *
 * Require `EMBED_MODEL` to force explicit selection for retrieval slices.
 */
export function embeddingModel() {
  const modelId = requireEnv("EMBED_MODEL");
  return gatewayProvider().textEmbeddingModel(modelId);
}
