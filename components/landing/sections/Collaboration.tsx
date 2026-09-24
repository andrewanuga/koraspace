"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Users,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import {
  SectionHead,
  cardHoverSpring,
  containerVariants,
  itemFadeUp,
} from "@/components/landing/primitives";

/* ── 10. Collaboration & Agency Workspaces (#collaboration) ───────── */

const COLLAB_FEATURES = [
  {
    title: "Client Workspace Portals",
    desc: "Isolated brand environments with strict row-level security. Give clients a clean view of their scheduled calendar and reports.",
    icon: Briefcase,
  },
  {
    title: "1-Click Shareable Draft Approvals",
    desc: "Send review links to clients or stakeholders without forcing them to create an account or login.",
    icon: ShieldCheck,
  },
  {
    title: "Role-Based Team Permissions",
    desc: "Assign roles (Admin, Editor, Reviewer, Client) with granular permissions over publishing, billing, and credentials.",
    icon: Users,
  },
  {
    title: "Audit Trail & Activity Log",
    desc: "Track every edit, approval, prompt update, and published post with complete timestamps and user attribution.",
    icon: Clock,
  },
];

export function Collaboration() {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Team & Agency Workspaces"
          tone="blue"
          title="Collaborate seamlessly with multi-seat controls"
          sub="Built for marketing agencies, brand teams, and growth operators managing multiple client brands under one roof."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {COLLAB_FEATURES.map((collab) => (
            <motion.div
              key={collab.title}
              variants={itemFadeUp}
              whileHover={{ y: -6, scale: 1.01, borderColor: "rgba(59,130,246,0.3)" }}
              transition={cardHoverSpring}
              className="rounded-3xl border border-white/[0.08] bg-[#171717] p-6 sm:p-7 flex gap-4 items-start transition-colors hover:bg-[#1a1a1a]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/30">
                <collab.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white mb-1.5">
                  {collab.title}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed font-normal">
                  {collab.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
