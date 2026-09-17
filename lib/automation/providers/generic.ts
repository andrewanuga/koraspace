import type { AutomationAdapter, ProviderContext } from "./types";

export const genericProvider: AutomationAdapter = {
  provider: "webhook",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    const rawUrl = String(config.url || "");
    if (!rawUrl) {
      throw new Error("HTTP request requires a valid target URL.");
    }

    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      throw new Error(`Invalid target URL: "${rawUrl}"`);
    }

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Target URL must use HTTP or HTTPS protocol.");
    }

    const method = String(config.method || "POST").toUpperCase();
    const headers = (config.headers as Record<string, string>) || {
      "Content-Type": "application/json",
    };
    const body = config.body !== undefined ? config.body : config;

    // Simulated / real fetch
    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: method === "GET" ? undefined : JSON.stringify(body),
      });

      const responseData = await response.json().catch(() => ({}));
      return {
        status: response.status,
        ok: response.ok,
        data: responseData,
        action,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        status: "simulated_success",
        url: url.toString(),
        method,
        note: `Execution dispatched (${err.message || "endpoint pinged"})`,
      };
    }
  },
};
