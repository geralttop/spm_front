import { getApiErrorMessage } from "@/shared/lib/api-error-message";

export function getErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback);
}

export function getValidationError(
  result: { error: { issues: Array<{ path?: unknown[]; message?: unknown }> } },
  invalidEmailT: string
): string {
  const issues = result.error.issues;
  const first = issues[0];
  if (!first) return invalidEmailT;
  if (first.path?.[0] === "email") return invalidEmailT;
  return first.message != null ? String(first.message) : invalidEmailT;
}
