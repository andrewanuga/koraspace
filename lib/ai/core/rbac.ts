/**
 * Workspace Role-Based Access Control (RBAC) & Permission Engine
 *
 * Enforces granular permissions per workspace role (owner, admin, member, viewer):
 * - ChatAgent reasoning & execution
 * - AI Memory read, write, and deletion
 * - Social connection & autonomous auto-posting
 * - Workspace configuration & billing
 */

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export type AIPermission =
  | "chat:execute"
  | "memory:read"
  | "memory:write"
  | "memory:delete"
  | "social:connect"
  | "social:autopost"
  | "observability:read"
  | "workspace:manage"
  | "billing:manage";

export const ROLE_PERMISSIONS: Record<WorkspaceRole, readonly AIPermission[]> = {
  owner: [
    "chat:execute",
    "memory:read",
    "memory:write",
    "memory:delete",
    "social:connect",
    "social:autopost",
    "observability:read",
    "workspace:manage",
    "billing:manage",
  ],
  admin: [
    "chat:execute",
    "memory:read",
    "memory:write",
    "memory:delete",
    "social:connect",
    "social:autopost",
    "observability:read",
    "workspace:manage",
  ],
  member: [
    "chat:execute",
    "memory:read",
    "memory:write",
    "social:connect",
  ],
  viewer: [
    "memory:read",
  ],
};

export class WorkspaceRBAC {
  /**
   * Checks whether a given workspace role holds a specific permission.
   */
  public static hasPermission(role: WorkspaceRole, permission: AIPermission): boolean {
    const allowed = ROLE_PERMISSIONS[role] || [];
    return allowed.includes(permission);
  }

  /**
   * Enforces permission, throwing a 403 authorization error if denied.
   */
  public static enforce(role: WorkspaceRole, permission: AIPermission): void {
    if (!this.hasPermission(role, permission)) {
      throw new Error(`Forbidden: Role "${role}" lacks permission "${permission}".`);
    }
  }
}
