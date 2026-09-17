import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { WorkflowBuilder } from "../WorkflowBuilder";

export default async function NewAutomationPage() {
  const session = await auth();
    const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, persona")
    .eq("id", user.id)
    .single();

  if (
    profile &&
    profile.persona !== "marketer" &&
    profile.plan !== "advanced" &&
    profile.plan !== "team"
  ) {
    redirect("/dashboard");
  }

  return (
    <WorkflowBuilder
      automation={{
        name: "New Marketing Automation",
        description: "Automated workflow",
        status: "draft",
        nodes: [
          {
            id: "trigger-1",
            type: "trigger",
            position: { x: 380, y: 80 },
            data: {
              label: "Instagram Comment Received",
              provider: "instagram",
              triggerType: "comment_received",
              description: "Triggers when a user comments on any post",
            },
          },
          {
            id: "condition-1",
            type: "condition",
            position: { x: 380, y: 220 },
            data: {
              label: "Contains Keyword 'PRICE'",
              config: {
                field: "comment.text",
                operator: "contains",
                value: "price",
              },
            },
          },
          {
            id: "action-crm",
            type: "action",
            position: { x: 260, y: 380 },
            data: {
              label: "Create CRM Lead",
              provider: "hubspot",
              action: "create_contact",
              config: {
                email: "{{comment.user_email}}",
                firstname: "{{comment.user_name}}",
              },
            },
          },
          {
            id: "action-reply",
            type: "action",
            position: { x: 500, y: 380 },
            data: {
              label: "Send Instagram Direct Reply",
              provider: "instagram",
              action: "send_message",
              config: {
                message: "Hey {{comment.user_name}}, thanks for your interest! Check your DMs for pricing options.",
              },
            },
          },
        ],
        edges: [
          {
            id: "e-trigger-condition",
            source: "trigger-1",
            target: "condition-1",
            animated: true,
            style: { stroke: "#168cff", strokeWidth: 2 },
          },
          {
            id: "e-condition-crm",
            source: "condition-1",
            target: "action-crm",
            sourceHandle: "true",
            animated: true,
            style: { stroke: "#22d3a5", strokeWidth: 2 },
          },
          {
            id: "e-condition-reply",
            source: "condition-1",
            target: "action-reply",
            sourceHandle: "true",
            animated: true,
            style: { stroke: "#168cff", strokeWidth: 2 },
          },
        ],
        settings: {
          timezone: "UTC",
          maxRunsPerHour: 100,
          failurePolicy: "continue",
        },
      }}
    />
  );
}
