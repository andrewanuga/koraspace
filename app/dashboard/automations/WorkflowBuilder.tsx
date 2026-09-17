"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code,
  FileCheck2,
  GitBranch,
  Play,
  Plus,
  Save,
  Trash2,
  Workflow,
  XCircle,
  Zap,
} from "lucide-react";

import { INTEGRATIONS } from "@/lib/automation/integrations";
import type { AutomationWorkflow, AutomationNodeData } from "@/lib/automation/types";
import { useToast } from "@/components/ui/toast";

interface Props {
  automation: AutomationWorkflow & { id?: string };
}

// ----------------------------------------------------------------------
// Custom Node Components
// ----------------------------------------------------------------------

function NodeWrapper({
  title,
  subtitle,
  icon: Icon,
  accentColor = "#168cff",
  hasTopHandle = true,
  hasBottomHandle = true,
  customBottomHandles,
}: {
  title: string;
  subtitle: string;
  icon: any;
  accentColor?: string;
  hasTopHandle?: boolean;
  hasBottomHandle?: boolean;
  customBottomHandles?: React.ReactNode;
}) {
  return (
    <div className="min-w-[240px] max-w-[280px] rounded-xl border border-white/10 bg-[#171717] shadow-xl transition hover:border-white/20">
      {hasTopHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="!h-2.5 !w-2.5 !border-0"
          style={{ background: accentColor }}
        />
      )}

      <div className="flex items-center gap-3 p-3.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${accentColor}18`, color: accentColor }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-bold text-white">{title}</div>
          <div className="mt-0.5 truncate text-[10px] text-white/40">{subtitle}</div>
        </div>
      </div>

      {hasBottomHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!h-2.5 !w-2.5 !border-0"
          style={{ background: accentColor }}
        />
      )}

      {customBottomHandles}
    </div>
  );
}

function TriggerNode({ data }: { data: AutomationNodeData }) {
  return (
    <NodeWrapper
      title={data.label || "Trigger"}
      subtitle={data.provider ? `${data.provider} trigger` : "Workflow starts here"}
      icon={Zap}
      accentColor="#168cff"
      hasTopHandle={false}
      hasBottomHandle={true}
    />
  );
}

function ActionNode({ data }: { data: AutomationNodeData }) {
  return (
    <NodeWrapper
      title={data.label || "Action"}
      subtitle={
        data.provider
          ? `${data.provider} · ${data.action || "action"}`
          : "Integration action"
      }
      icon={Plus}
      accentColor="#168cff"
    />
  );
}

function ConditionNode({ data }: { data: AutomationNodeData }) {
  const field = String(data.config?.field || "condition");
  const operator = String(data.config?.operator || "equals");

  return (
    <NodeWrapper
      title={data.label || "Condition"}
      subtitle={`${field} ${operator}`}
      icon={GitBranch}
      accentColor="#a78bfa"
      hasBottomHandle={false}
      customBottomHandles={
        <div className="flex items-center justify-between border-t border-white/5 px-3 py-1.5 text-[9px] font-semibold">
          <div className="relative text-emerald-400">
            True
            <Handle
              id="true"
              type="source"
              position={Position.Bottom}
              className="!h-2 !w-2 !border-0 !bg-emerald-400"
              style={{ left: 10 }}
            />
          </div>
          <div className="relative text-rose-400">
            False
            <Handle
              id="false"
              type="source"
              position={Position.Bottom}
              className="!h-2 !w-2 !border-0 !bg-rose-400"
              style={{ right: 10 }}
            />
          </div>
        </div>
      }
    />
  );
}

function DelayNode({ data }: { data: AutomationNodeData }) {
  const seconds = Number(data.config?.seconds || 60);
  return (
    <NodeWrapper
      title={data.label || "Delay"}
      subtitle={`Wait ${seconds >= 60 ? `${Math.round(seconds / 60)} min` : `${seconds}s`}`}
      icon={Clock}
      accentColor="#f59e0b"
    />
  );
}

function AiNode({ data }: { data: AutomationNodeData }) {
  return (
    <NodeWrapper
      title={data.label || "AI Step"}
      subtitle="Generate / Analyze text"
      icon={Bot}
      accentColor="#22d3a5"
    />
  );
}

function ApprovalNode({ data }: { data: AutomationNodeData }) {
  return (
    <NodeWrapper
      title={data.label || "Approval"}
      subtitle="Requires review"
      icon={FileCheck2}
      accentColor="#ec4899"
    />
  );
}

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
  ai: AiNode,
  approval: ApprovalNode,
};

// ----------------------------------------------------------------------
// WorkflowBuilder Main Component
// ----------------------------------------------------------------------

export function WorkflowBuilder({ automation }: Props) {
  const { toast } = useToast();
  const [workflowId, setWorkflowId] = useState<string | undefined>(automation.id);
  const [name, setName] = useState(automation.name || "Untitled Automation");
  const [status, setStatus] = useState(automation.status || "draft");

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    (automation.nodes as any) || [
      {
        id: "trigger-1",
        type: "trigger",
        position: { x: 350, y: 80 },
        data: {
          label: "New Comment",
          provider: "instagram",
          triggerType: "comment_received",
          description: "When an Instagram comment is received",
          config: { keyword: "PRICE" },
        },
      },
    ]
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    (automation.edges as any) || []
  );

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: "#168cff", strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  function addNode(type: "trigger" | "action" | "condition" | "delay" | "ai" | "approval") {
    const id = `${type}-${crypto.randomUUID().slice(0, 8)}`;
    const xPos = 350 + (nodes.length % 4) * 20;
    const yPos = 120 + nodes.length * 60;

    const defaultLabels: Record<string, string> = {
      trigger: "Trigger",
      action: "Integration Action",
      condition: "Condition Check",
      delay: "Delay",
      ai: "AI Step",
      approval: "Human Approval",
    };

    const newNode: Node = {
      id,
      type,
      position: { x: xPos, y: yPos },
      data: {
        label: defaultLabels[type] || "Step",
        config:
          type === "condition"
            ? { field: "lead.score", operator: "greater_than_or_equal", value: "70" }
            : type === "delay"
            ? { seconds: 1800 }
            : type === "ai"
            ? { instruction: "Write a warm, concise response to the customer", tone: "professional" }
            : {},
      },
    };

    setNodes((curr) => [...curr, newNode]);
    setSelectedNode(newNode);
  }

  function addIntegrationNode(providerId: string) {
    const integration = INTEGRATIONS.find((i) => i.id === providerId);
    if (!integration) return;

    const id = `action-${crypto.randomUUID().slice(0, 8)}`;
    const newNode: Node = {
      id,
      type: "action",
      position: { x: 360 + nodes.length * 20, y: 140 + nodes.length * 50 },
      data: {
        label: `${integration.name} Action`,
        provider: integration.id,
        action: integration.actions[0] || "publish_post",
        description: `Execute action on ${integration.name}`,
        config: {},
      },
    };

    setNodes((curr) => [...curr, newNode]);
    setSelectedNode(newNode);
  }

  function deleteSelectedNode() {
    if (!selectedNode) return;
    setNodes((curr) => curr.filter((n) => n.id !== selectedNode.id));
    setEdges((curr) =>
      curr.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
    );
    setSelectedNode(null);
  }

  async function saveWorkflow(targetStatus: "draft" | "active" = status as any) {
    // Validation before activation
    if (targetStatus === "active") {
      const hasTrigger = nodes.some((n) => n.type === "trigger");
      const hasAction = nodes.some((n) => n.type === "action" || n.type === "ai");
      if (!hasTrigger) {
        toast({
          title: "Activation Blocked",
          description: "A valid trigger node is required before activating.",
          variant: "error",
        });
        return;
      }
      if (!hasAction) {
        toast({
          title: "Activation Blocked",
          description: "At least one action or AI step is required.",
          variant: "error",
        });
        return;
      }
    }

    setSaving(true);
    try {
      const method = workflowId ? "PATCH" : "POST";
      const url = workflowId ? `/api/automations/${workflowId}` : "/api/automations";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nodes,
          edges,
          status: targetStatus,
          settings: automation.settings || {
            timezone: "UTC",
            maxRunsPerHour: 100,
            failurePolicy: "continue",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      if (data.automation?.id) {
        setWorkflowId(data.automation.id);
      }
      setStatus(targetStatus);

      toast({
        title: targetStatus === "active" ? "Workflow Activated" : "Workflow Saved",
        description: `"${name}" is now ${targetStatus}.`,
      });
    } catch (err: any) {
      toast({
        title: "Save Error",
        description: err.message || "Failed to save automation.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function runTest() {
    setTesting(true);
    setTestResult(null);

    // Save draft first if not persisted
    if (!workflowId) {
      await saveWorkflow("draft");
    }

    try {
      const targetId = workflowId || automation.id;
      const res = await fetch(`/api/automations/${targetId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger: {
            comment: { text: "What is the price of your plan?" },
            lead: { first_name: "Sarah", score: 85, email: "sarah@example.com" },
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      setTestResult(data);

      if (data.success) {
        toast({
          title: "Test Run Complete",
          description: "All nodes executed successfully.",
        });
      } else {
        toast({
          title: "Test Run Failed",
          description: data.error || "Execution encountered an error.",
          variant: "error",
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
      toast({
        title: "Test Run Error",
        description: err.message || "Execution failed.",
        variant: "error",
      });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-[#121212] text-white">
      {/* TOP BAR */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#161616] px-5">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Link
            href="/dashboard/automations"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:border-[#168cff]/40 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="min-w-0 flex-1">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-md bg-transparent text-base font-bold text-white outline-none focus:border-b focus:border-[#168cff]"
              placeholder="Automation Workflow Name"
            />
            <div className="flex items-center gap-2 text-[10px] text-white/40">
              <span>Visual Workflow Builder</span>
              <span>•</span>
              <span className="capitalize">{status}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={runTest}
            disabled={testing}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-[#1c1c1c] px-3.5 text-xs font-semibold text-white/80 transition hover:border-[#168cff]/50 hover:text-white"
          >
            <Play className={`h-3.5 w-3.5 ${testing ? "animate-spin text-[#168cff]" : ""}`} />
            {testing ? "Testing..." : "Test Run"}
          </button>

          <button
            onClick={() => saveWorkflow("draft")}
            disabled={saving}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-[#1c1c1c] px-3.5 text-xs font-semibold text-white/80 transition hover:border-white/20 hover:text-white"
          >
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </button>

          <button
            onClick={() => saveWorkflow("active")}
            disabled={saving}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-[#168cff] px-4 text-xs font-semibold text-white transition hover:bg-[#0b7be5] shadow-sm"
          >
            <Play className="h-3.5 w-3.5" />
            Activate
          </button>
        </div>
      </header>

      {/* WORKSPACE: LEFT PALETTE, CANVAS, RIGHT INSPECTOR */}
      <div className="flex min-h-0 flex-1">
        {/* LEFT PALETTE */}
        <aside className="w-[260px] shrink-0 border-r border-white/10 bg-[#151515] p-4 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/60">
              Logic Steps
            </h2>
            <p className="mt-0.5 text-[11px] text-white/35">Click to add step to canvas</p>
          </div>

          <div className="space-y-1.5">
            <PaletteButton
              icon={Zap}
              title="Trigger"
              color="#168cff"
              desc="Start when event arrives"
              onClick={() => addNode("trigger")}
            />
            <PaletteButton
              icon={GitBranch}
              title="Condition"
              color="#a78bfa"
              desc="Branch based on data"
              onClick={() => addNode("condition")}
            />
            <PaletteButton
              icon={Clock}
              title="Delay"
              color="#f59e0b"
              desc="Pause before next step"
              onClick={() => addNode("delay")}
            />
            <PaletteButton
              icon={Bot}
              title="AI Step"
              color="#22d3a5"
              desc="Analyze or generate text"
              onClick={() => addNode("ai")}
            />
            <PaletteButton
              icon={FileCheck2}
              title="Approval"
              color="#ec4899"
              desc="Require human review"
              onClick={() => addNode("approval")}
            />
            <PaletteButton
              icon={Plus}
              title="Generic Action"
              color="#168cff"
              desc="Execute HTTP / webhook"
              onClick={() => addNode("action")}
            />
          </div>

          <div className="mt-6 border-t border-white/10 pt-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
              24 Integrations
            </div>
            <div className="space-y-1">
              {INTEGRATIONS.map((integration) => (
                <button
                  key={integration.id}
                  onClick={() => addIntegrationNode(integration.id)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-white/60 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <span className="truncate">{integration.name}</span>
                  <span className="text-[9px] uppercase tracking-wider text-white/25">
                    {integration.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CANVAS */}
        <main className="relative min-w-0 flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            className="bg-[#101010]"
          >
            <Background gap={24} size={1} color="#242424" />
            <Controls className="!border-white/10 !bg-[#181818] !text-white" />
            <MiniMap
              nodeColor="#168cff"
              maskColor="rgba(16,16,16,0.85)"
              className="!border-white/10 !bg-[#181818]"
            />
          </ReactFlow>

          {/* TEST RESULTS DRAWER */}
          {testResult && (
            <div className="absolute bottom-4 left-4 right-4 max-w-2xl rounded-2xl border border-white/10 bg-[#161616]/95 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400" />
                  )}
                  {testResult.success ? "Test Run Succeeded" : "Test Run Failed"}
                </div>
                <button
                  onClick={() => setTestResult(null)}
                  className="text-xs text-white/40 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
              <div className="mt-3 max-h-40 overflow-y-auto font-mono text-[11px] text-white/70">
                {testResult.error ? (
                  <div className="text-rose-400">{testResult.error}</div>
                ) : (
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(testResult.context?.results || testResult, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </main>

        {/* RIGHT NODE INSPECTOR */}
        {selectedNode && (
          <aside className="w-[340px] shrink-0 border-l border-white/10 bg-[#151515] p-5 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#168cff]">
                  {selectedNode.type} configuration
                </span>
                <h3 className="text-sm font-bold text-white">
                  {String(selectedNode.data?.label || "Node")}
                </h3>
              </div>
              <button
                onClick={deleteSelectedNode}
                title="Delete Node"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-rose-500/10 hover:text-rose-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <NodeInspector
              node={selectedNode}
              updateNode={(updated) => {
                setNodes((curr) => curr.map((n) => (n.id === updated.id ? updated : n)));
                setSelectedNode(updated);
              }}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

function PaletteButton({
  icon: Icon,
  title,
  desc,
  color,
  onClick,
}: {
  icon: any;
  title: string;
  desc: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#1a1a1a] p-2.5 text-left transition hover:border-white/20 hover:bg-[#1f1f1f]"
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${color}18`, color }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold text-white">{title}</div>
        <div className="truncate text-[10px] text-white/35">{desc}</div>
      </div>
    </button>
  );
}

// ----------------------------------------------------------------------
// Node Inspector Panel
// ----------------------------------------------------------------------

function NodeInspector({
  node,
  updateNode,
}: {
  node: Node;
  updateNode: (node: Node) => void;
}) {
  const data = (node.data || {}) as Record<string, any>;
  const config = (data.config || {}) as Record<string, any>;

  function updateConfig(patch: Record<string, unknown>) {
    updateNode({
      ...node,
      data: {
        ...data,
        config: {
          ...config,
          ...patch,
        },
      },
    });
  }

  return (
    <div className="mt-4 space-y-4 text-xs">
      <div>
        <label className="mb-1 block text-[11px] font-semibold text-white/50">Step Title</label>
        <input
          value={data.label || ""}
          onChange={(e) =>
            updateNode({
              ...node,
              data: { ...data, label: e.target.value },
            })
          }
          className="h-9 w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-3 text-xs text-white outline-none focus:border-[#168cff]"
        />
      </div>

      {/* TRIGGER INSPECTOR */}
      {node.type === "trigger" && (
        <>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-white/50">Trigger Source</label>
            <select
              value={data.provider || "instagram"}
              onChange={(e) =>
                updateNode({
                  ...node,
                  data: { ...data, provider: e.target.value },
                })
              }
              className="h-9 w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-3 text-xs text-white outline-none focus:border-[#168cff]"
            >
              <option value="schedule">Schedule (Time-based)</option>
              <option value="webhook">Webhook / API Event</option>
              {INTEGRATIONS.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-white/50">Filter Keyword / Rule</label>
            <input
              value={String(config.keyword || "")}
              onChange={(e) => updateConfig({ keyword: e.target.value })}
              placeholder="e.g. PRICE or VIP"
              className="h-9 w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-3 text-xs text-white outline-none focus:border-[#168cff]"
            />
          </div>
        </>
      )}

      {/* ACTION INSPECTOR */}
      {node.type === "action" && (
        <>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-white/50">Integration</label>
            <select
              value={data.provider || "webhook"}
              onChange={(e) => {
                const provider = e.target.value;
                const integ = INTEGRATIONS.find((i) => i.id === provider);
                updateNode({
                  ...node,
                  data: {
                    ...data,
                    provider,
                    action: integ?.actions[0] || "http_request",
                  },
                });
              }}
              className="h-9 w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-3 text-xs text-white outline-none focus:border-[#168cff]"
            >
              {INTEGRATIONS.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>

          {data.provider && (
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-white/50">Action</label>
              <select
                value={data.action || ""}
                onChange={(e) =>
                  updateNode({
                    ...node,
                    data: { ...data, action: e.target.value },
                  })
                }
                className="h-9 w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-3 text-xs text-white outline-none focus:border-[#168cff]"
              >
                {(
                  INTEGRATIONS.find((i) => i.id === data.provider)?.actions || ["http_request"]
                ).map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-white/50">
              Message / Payload (Variables supported)
            </label>
            <textarea
              value={String(config.message || config.text || "")}
              onChange={(e) => updateConfig({ message: e.target.value, text: e.target.value })}
              rows={3}
              placeholder="Hey {{lead.first_name}}, thanks for your comment!"
              className="w-full rounded-xl border border-white/10 bg-[#1c1c1c] p-3 text-xs text-white outline-none focus:border-[#168cff] resize-none"
            />
          </div>
        </>
      )}

      {/* CONDITION INSPECTOR */}
      {node.type === "condition" && (
        <>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-white/50">Data Field</label>
            <input
              value={String(config.field || "")}
              onChange={(e) => updateConfig({ field: e.target.value })}
              placeholder="lead.score or comment.text"
              className="h-9 w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-3 text-xs text-white outline-none focus:border-[#168cff]"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-white/50">Operator</label>
            <select
              value={String(config.operator || "equals")}
              onChange={(e) => updateConfig({ operator: e.target.value })}
              className="h-9 w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-3 text-xs text-white outline-none focus:border-[#168cff]"
            >
              <option value="equals">Equals</option>
              <option value="not_equals">Does Not Equal</option>
              <option value="contains">Contains</option>
              <option value="not_contains">Does Not Contain</option>
              <option value="greater_than">Greater Than (&gt;)</option>
              <option value="greater_than_or_equal">Greater Than or Equal (&gt;=)</option>
              <option value="less_than">Less Than (&lt;)</option>
              <option value="exists">Exists</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-white/50">Comparison Value</label>
            <input
              value={String(config.value || "")}
              onChange={(e) => updateConfig({ value: e.target.value })}
              placeholder="e.g. 70 or PRICE"
              className="h-9 w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-3 text-xs text-white outline-none focus:border-[#168cff]"
            />
          </div>
        </>
      )}

      {/* DELAY INSPECTOR */}
      {node.type === "delay" && (
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-white/50">Duration (Seconds)</label>
          <input
            type="number"
            value={Number(config.seconds || 60)}
            onChange={(e) => updateConfig({ seconds: Number(e.target.value) })}
            className="h-9 w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-3 text-xs text-white outline-none focus:border-[#168cff]"
          />
          <div className="mt-1 text-[10px] text-white/40">
            {Number(config.seconds || 0) >= 3600
              ? `${(Number(config.seconds) / 3600).toFixed(1)} hours`
              : `${Math.round(Number(config.seconds || 0) / 60)} minutes`}
          </div>
        </div>
      )}

      {/* AI STEP INSPECTOR */}
      {node.type === "ai" && (
        <>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-white/50">AI Instruction</label>
            <textarea
              value={String(config.instruction || "")}
              onChange={(e) => updateConfig({ instruction: e.target.value })}
              rows={4}
              placeholder="Classify customer intent and draft an empathetic response..."
              className="w-full rounded-xl border border-white/10 bg-[#1c1c1c] p-3 text-xs text-white outline-none focus:border-[#168cff] resize-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-white/50">Tone</label>
            <select
              value={String(config.tone || "professional")}
              onChange={(e) => updateConfig({ tone: e.target.value })}
              className="h-9 w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-3 text-xs text-white outline-none focus:border-[#168cff]"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual & Friendly</option>
              <option value="urgent">Urgent</option>
              <option value="concise">Concise & Direct</option>
            </select>
          </div>
        </>
      )}

      {/* APPROVAL INSPECTOR */}
      {node.type === "approval" && (
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-white/50">Approver Role</label>
          <select
            value={String(config.approver || "marketing_manager")}
            onChange={(e) => updateConfig({ approver: e.target.value })}
            className="h-9 w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-3 text-xs text-white outline-none focus:border-[#168cff]"
          >
            <option value="marketing_manager">Marketing Manager</option>
            <option value="admin">Admin</option>
            <option value="compliance">Compliance Sentinel</option>
          </select>
        </div>
      )}
    </div>
  );
}
