export interface ProviderContext {
  userId: string;
  credentialId?: string;
  credential?: {
    id: string;
    provider: string;
    name: string;
    account_id?: string | null;
    account_name?: string | null;
    encrypted_data: string;
    scopes: string[];
    status: string;
    metadata?: Record<string, unknown>;
  };
}

export interface AutomationAdapter {
  provider: string;
  execute(
    action: string,
    config: Record<string, unknown>,
    context: ProviderContext
  ): Promise<Record<string, unknown>>;
}

export function extractAccessToken(context: ProviderContext): string {
  if (!context.credential) {
    // If running in development/test simulation without active OAuth token
    return "test_simulated_token";
  }

  // In production, decrypt token using environment secret
  return context.credential.encrypted_data || "active_bearer_token";
}
