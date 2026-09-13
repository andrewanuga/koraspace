"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { BrandIcon, LinkedInIcon } from "@/components/landing/brand-icons";
import {
  audiences,
  ctaTargets,
  integrationPreview,
  productCategories,
  resourceGroups,
  type MenuLeaf,
} from "@/components/landing/nav-data";

const panelShell =
  "rounded-2xl border border-white/[0.10] bg-[#131118]/95 shadow-[0_28px_70px_rgba(0,0,0,0.65)] backdrop-blur-2xl";

const eyebrow = "text-[11px] font-bold tracking-[0.2em] text-white/45";
const groupTitle = "text-[11px] font-bold tracking-[0.16em] text-white/40";
const panelLede = "mt-1 text-[15px] text-white/70";

/** Items without an href aren't built yet, so they render inert rather than 404. */
function Leaf({ item }: { item: MenuLeaf }) {
  const base =
    "block rounded-lg px-2 py-2 text-[15px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white";

  if (!item.href) {
    return (
      <span aria-disabled="true" className={`${base} cursor-default`}>
        {item.label}
      </span>
    );
  }

  return (
    <a href={item.href} className={base}>
      {item.label}
    </a>
  );
}

/** A real link — these read as calls to action, so they must behave like one. */
function PanelFooter({ label, href }: { label: string; href: string }) {
  return (
    <div className="mt-1 border-t border-white/[0.08] px-5 py-4">
      <a
        href={href}
        className="group inline-flex items-center gap-2 rounded-md text-[15px] font-semibold text-[#ff9fc9] underline-offset-4 outline-none transition-colors hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-[#ff9fc9]"
      >
        {label}
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}

function useStagger() {
  const reduce = useReducedMotion();
  return (i: number) =>
    reduce
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.22, delay: 0.03 + i * 0.025, ease: "easeOut" as const },
        };
}

export function ProductMenu() {
  const stagger = useStagger();

  return (
    <div className={`${panelShell} w-[760px] overflow-hidden`}>
      <div className="px-5 pt-5">
        <span className={eyebrow}>PRODUCT</span>
        <p className={panelLede}>Everything working together to grow your business.</p>
      </div>

      <div className="grid grid-cols-3 gap-x-6 gap-y-5 p-5">
        {productCategories.map((cat, i) => (
          <motion.div key={cat.key} {...stagger(i)}>
            <p className={`mb-2 px-2 ${groupTitle}`}>{cat.title.toUpperCase()}</p>
            {cat.items.map((item) => (
              <Leaf key={item.label} item={item} />
            ))}
          </motion.div>
        ))}
      </div>

      <PanelFooter label="Explore the KoraSpace platform" href={ctaTargets.product} />
    </div>
  );
}

export function AudienceMenu() {
  const stagger = useStagger();

  return (
    <div className={`${panelShell} w-[660px] overflow-hidden`}>
      <div className="px-5 pt-5">
        <span className={eyebrow}>MADE FOR</span>
        <p className={panelLede}>Built around the way you actually work.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 p-5">
        {audiences.map((a, i) => {
          const { Icon } = a;
          return (
            <motion.span
              key={a.label}
              {...stagger(i)}
              aria-disabled="true"
              className="flex cursor-default gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-white/[0.08] hover:bg-white/[0.04]"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#ff9fc9]" />
              <span className="block">
                <span className="block text-[15px] font-semibold text-white/90">
                  {a.label}
                </span>
                <span className="mt-1 block text-[13.5px] leading-relaxed text-white/60">
                  {a.description}
                </span>
              </span>
            </motion.span>
          );
        })}
      </div>

      <PanelFooter
        label="See how KoraSpace fits your business"
        href={ctaTargets.audience}
      />
    </div>
  );
}

export function IntegrationsMenu() {
  const stagger = useStagger();

  return (
    <div className={`${panelShell} w-[400px] overflow-hidden`}>
      <div className="px-5 pt-5">
        <span className={eyebrow}>INTEGRATIONS</span>
        <p className={panelLede}>Connect the tools your business already uses.</p>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 p-5">
        {integrationPreview.map((p, i) => (
          <motion.span
            key={p.label}
            {...stagger(i)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[15px] text-white/75"
          >
            {"icon" in p ? (
              <BrandIcon icon={p.icon} className="h-6 w-6 shrink-0 text-white" />
            ) : (
              <LinkedInIcon className="h-6 w-6 shrink-0 text-white" />
            )}
            {p.label}
          </motion.span>
        ))}
      </div>

      <div className="px-5 pb-2">
        <span className="inline-flex items-center gap-1.5 text-[13.5px] text-white/45">
          <Plus className="h-3.5 w-3.5" />
          More integrations
        </span>
      </div>

      <PanelFooter label="Explore integrations" href={ctaTargets.integrations} />
    </div>
  );
}

export function ResourcesMenu() {
  const stagger = useStagger();

  return (
    <div className={`${panelShell} w-[560px] overflow-hidden`}>
      <div className="grid grid-cols-3 gap-x-5 gap-y-4 p-5">
        {resourceGroups.map((group, i) => (
          <motion.div key={group.title} {...stagger(i)}>
            <p className={`mb-2 px-2 ${groupTitle}`}>{group.title.toUpperCase()}</p>
            {group.items.map((item) => (
              <Leaf key={item.label} item={item} />
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
