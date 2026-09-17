/**
 * REST API: /api/ai/memory
 *
 * Workspace-scoped Memory Management API:
 * - GET: List, filter, search, and aggregate workspace memories
 * - POST: Store a new verified fact, preference, or brand rule
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/workspace";
import { WorkspaceRBAC } from "@/lib/ai/core/rbac";
import {
  MemoryService,
  StoreMemoryInputSchema,
  ListMemoriesOptionsSchema,
} from "@/lib/ai/memory";

export async function GET(req: NextRequest) {
  try {
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

    const { searchParams } = new URL(req.url);
    const rawOptions = {
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
      offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : 0,
      memoryType: searchParams.get("type") || undefined,
      minImportance: searchParams.get("minImportance") ? Number(searchParams.get("minImportance")) : undefined,
      search: searchParams.get("search") || undefined,
    };

    const options = ListMemoriesOptionsSchema.parse(rawOptions);
    const includeStats = searchParams.get("stats") === "true";

    const result = await MemoryService.listMemories(workspace.workspaceId, supabase, options);
    const stats = includeStats ? await MemoryService.getMemoryStats(workspace.workspaceId, supabase) : undefined;

    return NextResponse.json({
      memories: result.memories,
      total: result.total,
      limit: options.limit,
      offset: options.offset,
      stats,
    });
  } catch (err: any) {
    console.error("[GET /api/ai/memory] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve memories" },
      { status: 400 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
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
    const input = StoreMemoryInputSchema.parse(body);

    const memory = await MemoryService.storeMemory(workspace.workspaceId, input, supabase);

    return NextResponse.json({ success: true, memory }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/ai/memory] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to store memory" },
      { status: 400 }
    );
  }
}
