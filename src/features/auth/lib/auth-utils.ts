export function getErrorMessage(error: any, fallback: string): string {
  const msg = error?.response?.data?.message;
  if (Array.isArray(msg)) return msg[0] ?? fallback;
  if (typeof msg === "string") return msg;
  return error?.message && error.message !== "No access token available" ? error.message : fallback;
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
