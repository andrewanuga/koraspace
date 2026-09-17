import { registerExecutor } from "../engine";
import { executeIntegrationAction } from "./router";
import { INTEGRATIONS } from "../integrations";

let registered = false;

export function registerIntegrationExecutors() {
  if (registered) return;
  registered = true;

  // 1. Generic action executor for any integration node
  registerExecutor("action", async (node, context) => {
    const provider = node.data.provider || "webhook";
    const action = node.data.action || "http_request";
    const config = node.data.config || {};

    return executeIntegrationAction(provider, action, config, {
      userId: context.userId,
      credentialId: node.data.credentialId,
    });
  });

  // 2. Specific registrations for all catalog actions
  for (const integration of INTEGRATIONS) {
    for (const action of integration.actions) {
      const key = `${integration.id}:${action}`;
      registerExecutor(key, async (node, context) => {
        return executeIntegrationAction(integration.id, action, node.data.config || {}, {
          userId: context.userId,
          credentialId: node.data.credentialId,
        });
      });
    }
  }
}
