export type AutomationStatus =
  | "draft"
  | "active"
  | "paused"
  | "archived";

export type AutomationNodeType =
  | "trigger"
  | "condition"
  | "action"
  | "delay"
  | "ai"
  | "branch"
  | "approval";

export type TriggerType =
  | "schedule"
  | "webhook"
  | "message_received"
  | "comment_received"
  | "mention_received"
  | "lead_created"
  | "lead_updated"
  | "form_submitted"
  | "post_published"
  | "payment_succeeded"
  | "order_created"
  | "campaign_event"
  | "manual";

export type ActionType =
  | "publish_post"
  | "publish_video"
  | "publish_reel"
  | "create_pin"
  | "send_message"
  | "send_template"
  | "send_email"
  | "reply_comment"
  | "reply"
  | "create_lead"
  | "update_lead"
  | "move_lead"
  | "add_tag"
  | "create_task"
  | "update_contact"
  | "create_contact"
  | "create_deal"
  | "update_deal"
  | "create_customer"
  | "update_customer"
  | "create_invoice"
  | "create_row"
  | "update_row"
  | "find_row"
  | "create_record"
  | "update_record"
  | "create_page"
  | "update_page"
  | "http_request"
  | "delay"
  | "condition"
  | "branch"
  | "approval"
  | "ai_generate"
  | "create_campaign"
  | "pause_automation"
  | "notify_team";

export type Operator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "greater_than"
  | "greater_than_or_equal"
  | "less_than"
  | "less_than_or_equal"
  | "exists"
  | "not_exists";

export interface ConditionRule {
  field: string;
  operator: Operator;
  value?: unknown;
}

export interface AutomationNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  provider?: string;
  action?: string;
  triggerType?: TriggerType;
  config?: Record<string, unknown>;
  credentialId?: string;
  enabled?: boolean;
}

export interface AutomationNode {
  id: string;
  type: AutomationNodeType;
  position: {
    x: number;
    y: number;
  };
  data: AutomationNodeData;
}

export interface AutomationEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  animated?: boolean;
  style?: Record<string, unknown>;
}

export interface AutomationWorkflowSettings {
  timezone: string;
  maxRunsPerHour: number;
  failurePolicy: "stop" | "continue";
  retries?: {
    maxAttempts: number;
    backoffSeconds: number[];
  };
}

export interface AutomationWorkflow {
  id?: string;
  user_id?: string;
  name: string;
  description?: string | null;
  status: AutomationStatus;
  trigger_type?: string;
  trigger_config?: Record<string, unknown>;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
  settings: AutomationWorkflowSettings;
  version?: number;
  last_run_at?: string | null;
  last_success_at?: string | null;
  last_failure_at?: string | null;
  total_runs?: number;
  successful_runs?: number;
  failed_runs?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AutomationRun {
  id: string;
  automation_id: string;
  user_id: string;
  status: "queued" | "running" | "waiting" | "success" | "failed" | "cancelled";
  trigger_payload: Record<string, unknown>;
  context: AutomationContext;
  current_step: number;
  idempotency_key?: string;
  error?: string | null;
  started_at: string;
  finished_at?: string | null;
  created_at: string;
}

export interface AutomationNodeRun {
  id: string;
  run_id: string;
  node_id: string;
  node_type: string;
  status: "waiting" | "running" | "success" | "failed" | "skipped";
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error?: string | null;
  attempts: number;
  started_at: string;
  finished_at?: string | null;
}

export interface AutomationContext {
  userId: string;
  automationId?: string;
  runId?: string;
  depth: number;
  executionChain: string[];
  trigger: Record<string, unknown>;
  variables: Record<string, unknown>;
  results: Record<string, Record<string, unknown>>;
  logs?: Array<{
    nodeId: string;
    status: string;
    timestamp: string;
    message?: string;
  }>;
}

export interface AutomationCredentialSummary {
  id: string;
  provider: string;
  name: string;
  account_name?: string | null;
  scopes: string[];
  status: "active" | "expired" | "revoked" | "error";
  expires_at?: string | null;
}

export interface NormalizedEvent {
  id: string;
  provider: string;
  type: string;
  accountId?: string;
  timestamp: string;
  data: Record<string, unknown>;
}
