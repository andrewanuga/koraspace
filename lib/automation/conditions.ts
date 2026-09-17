import type { Operator, AutomationContext } from "./types";

export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  const parts = path.trim().split(".");
  let current: any = obj;

  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }

  return current;
}

export function evaluateCondition(
  actual: unknown,
  operator: Operator,
  expected?: unknown
): boolean {
  switch (operator) {
    case "equals":
      return String(actual) === String(expected);

    case "not_equals":
      return String(actual) !== String(expected);

    case "contains":
      if (typeof actual === "string") {
        return actual.toLowerCase().includes(String(expected ?? "").toLowerCase());
      }
      if (Array.isArray(actual)) {
        return actual.some((item) => String(item).toLowerCase() === String(expected).toLowerCase());
      }
      return false;

    case "not_contains":
      if (typeof actual === "string") {
        return !actual.toLowerCase().includes(String(expected ?? "").toLowerCase());
      }
      if (Array.isArray(actual)) {
        return !actual.some((item) => String(item).toLowerCase() === String(expected).toLowerCase());
      }
      return true;

    case "greater_than":
      return Number(actual) > Number(expected);

    case "greater_than_or_equal":
      return Number(actual) >= Number(expected);

    case "less_than":
      return Number(actual) < Number(expected);

    case "less_than_or_equal":
      return Number(actual) <= Number(expected);

    case "exists":
      return actual !== undefined && actual !== null && actual !== "";

    case "not_exists":
      return actual === undefined || actual === null || actual === "";

    default:
      return false;
  }
}

/**
 * Resolves template variables like {{trigger.lead.email}} or {{comment.text}} or {{variables.score}}
 */
export function resolveVariables(
  template: string,
  context: AutomationContext
): string {
  if (!template || typeof template !== "string") return "";

  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (match, path) => {
    // 1. Direct match in variables
    const inVariables = getNestedValue(context.variables, path);
    if (inVariables !== undefined && inVariables !== null) return String(inVariables);

    // 2. Direct match in trigger
    const inTrigger = getNestedValue(context.trigger, path);
    if (inTrigger !== undefined && inTrigger !== null) return String(inTrigger);

    // 3. Fallback check for paths prefixed with "trigger."
    if (path.startsWith("trigger.")) {
      const sub = path.substring("trigger.".length);
      const val = getNestedValue(context.trigger, sub);
      if (val !== undefined && val !== null) return String(val);
    }

    // 4. Fallback check for paths prefixed with "results."
    if (path.startsWith("results.")) {
      const sub = path.substring("results.".length);
      const val = getNestedValue(context.results, sub);
      if (val !== undefined && val !== null) return String(val);
    }

    // Return original match if unresolvable
    return match;
  });
}
