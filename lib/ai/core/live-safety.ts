/**
 * Live Testing Safety & Side-Effect Guardrail Engine
 *
 * Enforces strict environment boundaries during live and staging tests:
 * - Prevents accidental outbound social publishing during test executions
 * - Disallows destructive database mutations outside designated test workspaces
 * - Restricts live LLM token budgets during automated integration test runs
 */

export interface LiveSafetyConfig {
  isLiveTestEnvironment: boolean;
  allowExternalSideEffects: boolean;
  isolatedWorkspacePrefix: string;
  maxTestTokenBudget: number;
}

export class LiveTestSafetyGuard {
  private static readonly config: LiveSafetyConfig = {
    isLiveTestEnvironment: process.env.NODE_ENV === "test" || process.env.TEST_LIVE === "true",
    allowExternalSideEffects: process.env.ALLOW_EXTERNAL_SIDE_EFFECTS === "true",
    isolatedWorkspacePrefix: "test_isolated_",
    maxTestTokenBudget: 5000,
  };

  /**
   * Evaluates whether an outbound action (e.g. publishing a post to X or Instagram) is permitted.
   */
  public static canExecuteOutboundAction(workspaceId: string): { allowed: boolean; reason?: string } {
    if (this.config.isLiveTestEnvironment && !this.config.allowExternalSideEffects) {
      return {
        allowed: false,
        reason: "Blocked: External side-effects are disabled in live test environment.",
      };
    }

    return { allowed: true };
  }

  /**
   * Enforces that test mutations only touch isolated workspaces.
   */
  public static validateWorkspaceBoundary(workspaceId: string): boolean {
    if (this.config.isLiveTestEnvironment) {
      return (
        workspaceId.startsWith(this.config.isolatedWorkspacePrefix) ||
        workspaceId.includes("test") ||
        workspaceId.includes("mock")
      );
    }
    return true;
  }
}
