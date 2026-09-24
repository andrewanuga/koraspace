/**
 * REST API: /api/ai/memory/[id]
 *
 * Workspace-scoped Memory Item Operations:
 * - GET: Retrieve memory by ID
 * - PATCH: Update memory content, type, importance, or metadata
 * - DELETE: Forget / delete memory
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/workspace";
import { WorkspaceRBAC } from "@/lib/ai/core/rbac";
import { MemoryService, UpdateMemoryInputSchema } from "@/lib/ai/memory";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const workspace = await getActiveWorkspace(supabase);
    if (!workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!WorkspaceRBAC.hasPermission(workspace.role, "memory:read")) {
      return NextResponse.json(
        { error: `Forbidden: Role "${workspace.role}" lacks permission "memory:read".`, code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const memory = await MemoryService.getMemory(workspace.workspaceId, id, supabase);
    if (!memory) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    return NextResponse.json({ memory });
  } catch (err: any) {
    console.error("[GET /api/ai/memory/[id]] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve memory" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const workspace = await getActiveWorkspace(supabase);
    if (!workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!WorkspaceRBAC.hasPermission(workspace.role, "memory:write")) {
      return NextResponse.json(
        { error: `Forbidden: Role "${workspace.role}" lacks permission "memory:write".`, code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updates = UpdateMemoryInputSchema.parse(body);

    const memory = await MemoryService.updateMemory(
      workspace.workspaceId,
      id,
      updates,
      supabase
    );

    if (!memory) {
      return NextResponse.json({ error: "Memory not found or not owned by workspace" }, { status: 404 });
    }

    return NextResponse.json({ success: true, memory });
  } catch (err: any) {
    console.error("[PATCH /api/ai/memory/[id]] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update memory" },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const workspace = await getActiveWorkspace(supabase);
    if (!workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!WorkspaceRBAC.hasPermission(workspace.role, "memory:delete")) {
      return NextResponse.json(
        { error: `Forbidden: Role "${workspace.role}" lacks permission "memory:delete".`, code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const deleted = await MemoryService.forgetMemory(workspace.workspaceId, id, supabase);
    if (!deleted) {
      return NextResponse.json({ error: "Memory not found or not owned by workspace" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    console.error("[DELETE /api/ai/memory/[id]] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete memory" },
      { status: 500 }
    );
  }
}
