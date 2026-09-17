import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/workspace";
import type { Capability } from "./capabilities";
import { type WorkspaceRole, capabilitiesForRole } from "./rbac";
import type { AgentContext } from "./types";

export interface AIRouteAuthSuccess {
  authorized: true;
  context: AgentContext;
  workspaceId: string;
  role: WorkspaceRole;
  userId: string;
  supabase: SupabaseClient;
  error?: undefined;
}

export interface AIRouteAuthFailure {
  authorized: false;
  context?: undefined;
  workspaceId?: undefined;
  role?: undefined;
  userId?: undefined;
  supabase?: undefined;
  error: {
    status: number;
    message: string;
    code: string;
  };
}

export type AIRouteAuthResult = AIRouteAuthSuccess | AIRouteAuthFailure;

/**
 * Canonical AI Route Authorization Primitive.
 * Validates authentication session, active workspace resolution, and capability checks.
 * Returns an authentic AgentContext guaranteed to have authentic userId and workspaceId.
 */
export async function authorizeAIRoute(
  requiredCapability?: Capability,
  customSupabase?: SupabaseClient
): Promise<AIRouteAuthResult> {
  const supabase = customSupabase ?? (await createClient());
  const workspace = await getActiveWorkspace(supabase);

  if (!workspace) {
    return {
      authorized: false,
      error: {
        status: 401,
        message: "Unauthorized: Invalid session or workspace membership.",
        code: "UNAUTHORIZED",
      },
    };
  }

  const { workspaceId, role, userId } = workspace;
  const capabilities = capabilitiesForRole(role);

  if (requiredCapability && !capabilities.includes(requiredCapability)) {
    return {
      authorized: false,
      error: {
        status: 403,
        message: `Forbidden: Role "${role}" lacks capability "${requiredCapability}".`,
        code: "MISSING_CAPABILITY",
      },
    };
  }

  const context: AgentContext = {
    userId,
    workspaceId,
    capabilities,
    autonomyMode: "assist",
    supabase,
  };

  return {
    authorized: true,
    context,
    workspaceId,
    role,
    userId,
    supabase,
  };
}

/**
 * Helper to convert an AIRouteAuthFailure to a standardized NextResponse.
 */
export function toAuthErrorResponse(auth: AIRouteAuthFailure): NextResponse {
  return NextResponse.json(
    { error: auth.error.message, code: auth.error.code },
    { status: auth.error.status }
  );
}
