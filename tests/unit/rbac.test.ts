import { describe, it, expect } from "vitest";
import { WorkspaceRBAC } from "@/lib/ai/core/rbac";

describe("WorkspaceRBAC & Role Permissions", () => {
  it("should grant full administrative privileges to workspace owner and admin", () => {
    expect(WorkspaceRBAC.hasPermission("owner", "chat:execute")).toBe(true);
    expect(WorkspaceRBAC.hasPermission("owner", "memory:delete")).toBe(true);
    expect(WorkspaceRBAC.hasPermission("owner", "social:autopost")).toBe(true);
    expect(WorkspaceRBAC.hasPermission("owner", "billing:manage")).toBe(true);

    expect(WorkspaceRBAC.hasPermission("admin", "chat:execute")).toBe(true);
    expect(WorkspaceRBAC.hasPermission("admin", "memory:delete")).toBe(true);
    expect(WorkspaceRBAC.hasPermission("admin", "social:autopost")).toBe(true);
  });

  it("should restrict standard members from deleting memory or managing billing", () => {
    expect(WorkspaceRBAC.hasPermission("member", "chat:execute")).toBe(true);
    expect(WorkspaceRBAC.hasPermission("member", "memory:read")).toBe(true);
    expect(WorkspaceRBAC.hasPermission("member", "memory:delete")).toBe(false);
    expect(WorkspaceRBAC.hasPermission("member", "social:autopost")).toBe(false);
    expect(WorkspaceRBAC.hasPermission("member", "billing:manage")).toBe(false);
  });

  it("should throw a descriptive authorization error when enforcing denied permission", () => {
    expect(() => {
      WorkspaceRBAC.enforce("viewer", "chat:execute");
    }).toThrow('Forbidden: Role "viewer" lacks permission "chat:execute".');
  });
});
