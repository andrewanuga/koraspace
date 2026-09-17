/**
 * Shared Zod-like validation schemas for KoraSpace API routes.
 *
 * We do NOT depend on the `zod` npm package (not in package.json) - this
 * module ships its own lightweight schema builder that produces compatible
 * safeParse() output so routes can validate inputs without adding a new
 * dependency.
 *
 * Each schema has a .safeParse(data) method that returns
 *   { success: true,  data: T }              on success
 *   { success: false, error: { issues: Issue[] } }  on failure
 */

export type Issue = { path: string; message: string };
export type SafeParseSuccess<T> = { success: true; data: T };
export type SafeParseFailure = { success: false; error: { issues: Issue[] } };
export type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseFailure;

// -- Primitive validators ----------------------------------------------------

function isString(v: unknown): v is string { return typeof v === "string"; }
function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function trimStr(v: unknown, max = 5000): string {
  if (!isString(v)) return "";
  return v.trim().slice(0, max);
}

function required(v: string, field: string): Issue | null {
  return v.length === 0 ? { path: field, message: `${field} is required.` } : null;
}

function maxLen(v: string, max: number, field: string): Issue | null {
  return v.length > max ? { path: field, message: `${field} must be at most ${max} characters.` } : null;
}

function minLen(v: string, min: number, field: string): Issue | null {
  return v.length < min ? { path: field, message: `${field} must be at least ${min} characters.` } : null;
}

function pattern(v: string, re: RegExp, field: string, msg: string): Issue | null {
  return re.test(v) ? null : { path: field, message: msg };
}

function oneOf<T extends string>(v: unknown, allowed: readonly T[], field: string): Issue | null {
  if (isString(v) && (allowed as readonly string[]).includes(v)) return null;
  return { path: field, message: `${field} must be one of: ${allowed.join(", ")}.` };
}

// -- Onboarding schema -------------------------------------------------------

export interface OnboardingPayload {
  persona: "creator" | "marketer";
  username: string;
  full_name: string;
  goals?: string[];
  platforms?: string[];
  contentFormats?: string[];
  niche?: string;
  industry?: string;
  audienceRange?: string;
  postingCadence?: string;
  automationLevel?: string;
}

const PERSONAS = ["creator", "marketer"] as const;

export const onboardingSchema = {
  safeParse(raw: unknown): SafeParseResult<OnboardingPayload> {
    const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const issues: Issue[] = [];

    const persona = trimStr(data.persona);
    const usernameRaw = trimStr(data.username, 50);
    const full_name = trimStr(data.full_name, 120);

    const r1 = oneOf(persona, PERSONAS, "persona");
    if (r1) issues.push(r1);

    const r2 = required(usernameRaw, "username");
    if (r2) issues.push(r2);
    else {
      const r3 = minLen(usernameRaw, 3, "username");
      if (r3) issues.push(r3);
      const r4 = pattern(usernameRaw, /^[a-z0-9_]+$/i, "username", "Username may only contain letters, numbers, and underscores.");
      if (r4) issues.push(r4);
    }

    const r5 = required(full_name, "full_name");
    if (r5) issues.push(r5);
    else {
      const r6 = minLen(full_name, 2, "full_name");
      if (r6) issues.push(r6);
    }

    if (issues.length > 0) return { success: false, error: { issues } };

    return {
      success: true,
      data: {
        persona: persona as "creator" | "marketer",
        username: usernameRaw.toLowerCase(),
        full_name,
        goals: isStringArray(data.goals) ? data.goals.slice(0, 10) : undefined,
        platforms: isStringArray(data.platforms) ? data.platforms.slice(0, 10) : undefined,
        contentFormats: isStringArray(data.contentFormats) ? data.contentFormats.slice(0, 10) : undefined,
        niche: isString(data.niche) ? data.niche.trim().slice(0, 200) : undefined,
        industry: isString(data.industry) ? data.industry.trim().slice(0, 100) : undefined,
        audienceRange: isString(data.audienceRange) ? data.audienceRange.trim().slice(0, 50) : undefined,
        postingCadence: isString(data.postingCadence) ? data.postingCadence.trim().slice(0, 50) : undefined,
        automationLevel: isString(data.automationLevel) ? data.automationLevel.trim().slice(0, 50) : undefined,
      },
    };
  },
};

// -- Billing checkout schema -------------------------------------------------

const PLANS = ["free", "pro", "advanced", "team"] as const;
export type PlanId = (typeof PLANS)[number];

export interface CheckoutPayload { plan: PlanId; method?: "paystack" | "opay" | "stripe" | "crypto" }

export const checkoutSchema = {
  safeParse(raw: unknown): SafeParseResult<CheckoutPayload> {
    const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const issues: Issue[] = [];
    const r = oneOf(data.plan, PLANS, "plan");
    if (r) issues.push(r);
    if (issues.length > 0) return { success: false, error: { issues } };
    return { success: true, data: { plan: data.plan as PlanId, method: (data.method as any) || "paystack" } };
  },
};

// -- Team invite schema ------------------------------------------------------

const ROLES = ["admin", "manager", "member"] as const;
export type TeamRole = (typeof ROLES)[number];

export interface TeamInvitePayload { email: string; role: TeamRole }

export const teamInviteSchema = {
  safeParse(raw: unknown): SafeParseResult<TeamInvitePayload> {
    const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const issues: Issue[] = [];

    const email = trimStr(data.email, 254).toLowerCase();
    const r1 = required(email, "email");
    if (r1) issues.push(r1);
    else {
      const r2 = pattern(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "email", "Enter a valid email address.");
      if (r2) issues.push(r2);
    }

    const r3 = oneOf(data.role ?? "member", ROLES, "role");
    if (r3) issues.push(r3);

    if (issues.length > 0) return { success: false, error: { issues } };
    return { success: true, data: { email, role: (data.role ?? "member") as TeamRole } };
  },
};

// -- AI generate schema ------------------------------------------------------

export interface GeneratePayload {
  prompt: string;
  platform?: string;
  type?: string;
  tone?: string;
  context?: string;
}

export const generateSchema = {
  safeParse(raw: unknown): SafeParseResult<GeneratePayload> {
    const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const issues: Issue[] = [];

    const prompt = trimStr(data.prompt, 4000);
    const r = required(prompt, "prompt");
    if (r) issues.push(r);

    if (issues.length > 0) return { success: false, error: { issues } };
    return {
      success: true,
      data: {
        prompt,
        platform: isString(data.platform) ? data.platform.trim().slice(0, 50) : undefined,
        type: isString(data.type) ? data.type.trim().slice(0, 50) : undefined,
        tone: isString(data.tone) ? data.tone.trim().slice(0, 50) : undefined,
        context: isString(data.context) ? data.context.trim().slice(0, 2000) : undefined,
      },
    };
  },
};

// -- Helper: format validation errors for API responses ---------------------
// Returns a plain object; callers pass it to NextResponse.json().
export function validationErrorBody(issues: Issue[]) {
  return {
    error: "Validation failed.",
    issues: issues.map((i) => `${i.path}: ${i.message}`),
  };
}
