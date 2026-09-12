/**
 * Golden Evaluation Datasets for Agent Benchmarking
 *
 * Provides curated input-output evaluation test cases across:
 * - Content Generation & Brand Voice Alignment
 * - Competitor Research & Claim Verification
 * - Social Triage, Lead Qualification & Complaint Escalation
 */

export interface ChatEvaluationCase {
  id: string;
  name: string;
  userPrompt: string;
  expectedIntent: string;
  expectedTools: string[];
  forbiddenTerms: string[];
  requiredConcepts: string[];
  minQualityScore: number;
}

export interface GhostEvaluationCase {
  id: string;
  name: string;
  inboundMessage: string;
  senderName: string;
  platform: string;
  expectedAction: "auto_reply" | "flag_lead" | "escalate_complaint" | "ignore";
  expectedIsLead: boolean;
  expectedRiskLevel: "low" | "medium" | "high" | "critical";
  mandatesHumanApproval: boolean;
}

export const GOLDEN_CHAT_DATASET: ChatEvaluationCase[] = [
  {
    id: "chat-case-001",
    name: "LinkedIn B2B Thought Leadership",
    userPrompt: "Write a high-impact LinkedIn post about AI automation for Nigerian technology startups.",
    expectedIntent: "general_reasoning",
    expectedTools: [],
    forbiddenTerms: ["guaranteed overnight success", "get rich quick", "100% risk free"],
    requiredConcepts: ["automation", "leverage", "startups"],
    minQualityScore: 0.85,
  },
  {
    id: "chat-case-002",
    name: "Competitor Research & Breakdown",
    userPrompt: "Can you analyze competitor https://buffer.com and see where they are winning?",
    expectedIntent: "competitor_analysis",
    expectedTools: ["scrape_url", "analyze_competitor"],
    forbiddenTerms: ["guaranteed overnight success"],
    requiredConcepts: ["competitor", "strengths", "differentiation"],
    minQualityScore: 0.85,
  },
  {
    id: "chat-case-003",
    name: "Claim Verification & Fact Checking",
    userPrompt: "Please verify if the claim that Twitter changed its character limit to 10,000 is verified.",
    expectedIntent: "fact_verification",
    expectedTools: ["verify_claim"],
    forbiddenTerms: [],
    requiredConcepts: ["verified", "claim"],
    minQualityScore: 0.85,
  },
];

export const GOLDEN_GHOST_DATASET: GhostEvaluationCase[] = [
  {
    id: "ghost-case-001",
    name: "Inbound Enterprise Pricing Lead",
    inboundMessage: "How much does the team plan cost? We have 15 creators looking to onboard.",
    senderName: "Agency Director",
    platform: "linkedin",
    expectedAction: "flag_lead",
    expectedIsLead: true,
    expectedRiskLevel: "low",
    mandatesHumanApproval: true,
  },
  {
    id: "ghost-case-002",
    name: "Urgent Payment & Service Complaint",
    inboundMessage: "My card was charged twice and the post scheduling failed. Please refund immediately!",
    senderName: "Dissatisfied Customer",
    platform: "x",
    expectedAction: "escalate_complaint",
    expectedIsLead: false,
    expectedRiskLevel: "high",
    mandatesHumanApproval: true,
  },
  {
    id: "ghost-case-003",
    name: "Routine Community Compliment",
    inboundMessage: "Love this breakdown so much! Best social tool I've used this year 🔥",
    senderName: "Active Follower",
    platform: "instagram",
    expectedAction: "auto_reply",
    expectedIsLead: false,
    expectedRiskLevel: "low",
    mandatesHumanApproval: false, // in auto mode
  },
  {
    id: "ghost-case-004",
    name: "Spam Link & Crypto Promotion",
    inboundMessage: "Make $5,000 daily with this Telegram trading bot click here: https://bit.ly/spam",
    senderName: "Bot Account",
    platform: "telegram",
    expectedAction: "ignore",
    expectedIsLead: false,
    expectedRiskLevel: "low",
    mandatesHumanApproval: false,
  },
];
