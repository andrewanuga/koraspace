"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                               DESIGN TOKENS                                */
/* -------------------------------------------------------------------------- */

type AccentTone =
  | "primary"
  | "accent"
  | "pink"
  | "blue"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "green"
  | "red"
  | "gold"
  | "indigo"
  | "violet"
  | "muted";

const TONE_MAP: Record<
  AccentTone,
  {
    color: string;
    bg: string;
    border: string;
  }
> = {
  primary: {
    color: "var(--brand-primary)",
    bg: "var(--brand-primary-soft)",
    border: "var(--brand-primary-border)",
  },

  accent: {
    color: "var(--brand-primary)",
    bg: "var(--brand-primary-soft)",
    border: "var(--brand-primary-border)",
  },

  pink: {
    color: "var(--kora-pink)",
    bg: "var(--kora-pink-soft)",
    border: "rgba(236, 72, 153, 0.28)",
  },

  blue: {
    color: "var(--kora-blue)",
    bg: "var(--kora-blue-soft)",
    border: "rgba(59, 130, 246, 0.28)",
  },

  success: {
    color: "var(--success)",
    bg: "rgba(52, 211, 153, 0.10)",
    border: "rgba(52, 211, 153, 0.22)",
  },

  warning: {
    color: "var(--warning)",
    bg: "rgba(251, 191, 36, 0.10)",
    border: "rgba(251, 191, 36, 0.22)",
  },

  danger: {
    color: "var(--danger)",
    bg: "rgba(248, 113, 113, 0.10)",
    border: "rgba(248, 113, 113, 0.22)",
  },

  neutral: {
    color: "var(--fg-3)",
    bg: "var(--panel-fill-2)",
    border: "var(--stroke)",
  },

  green: {
    color: "var(--success)",
    bg: "rgba(52, 211, 153, 0.10)",
    border: "rgba(52, 211, 153, 0.22)",
  },

  red: {
    color: "var(--danger)",
    bg: "rgba(248, 113, 113, 0.10)",
    border: "rgba(248, 113, 113, 0.22)",
  },

  gold: {
    color: "var(--warning)",
    bg: "rgba(251, 191, 36, 0.10)",
    border: "rgba(251, 191, 36, 0.22)",
  },

  indigo: {
    color: "var(--brand-primary)",
    bg: "var(--brand-primary-soft)",
    border: "var(--brand-primary-border)",
  },

  violet: {
    color: "var(--brand-primary)",
    bg: "var(--brand-primary-soft)",
    border: "var(--brand-primary-border)",
  },

  muted: {
    color: "var(--fg-3)",
    bg: "var(--panel-fill-2)",
    border: "var(--stroke)",
  },
};

/* -------------------------------------------------------------------------- */
/*                                GLASS CARD                                  */
/* -------------------------------------------------------------------------- */

interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  interactive?: boolean;
  accent?: AccentTone;
  padding?: "none" | "sm" | "md" | "lg";
}

export function GlassCard({
  className,
  children,
  hover = false,
  interactive = false,
  accent,
  padding = "none",
  ...props
}: GlassCardProps) {
  const paddingMap = {
    none: "",
    sm: "p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-7",
  };

  const tone = accent ? TONE_MAP[accent] : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "border border-[var(--stroke)]",
        "bg-[var(--panel-fill)]",

        /*
         * subtle premium depth
         */

        "shadow-[0_10px_40px_rgba(0,0,0,0.18)]",

        hover &&
          [
            "transition-all duration-200",
            "hover:-translate-y-[2px]",
            "hover:border-[var(--stroke-strong)]",
            "hover:shadow-[0_18px_50px_rgba(0,0,0,0.28)]",
          ],

        interactive &&
          [
            "cursor-pointer",
            "transition-all duration-200",
            "hover:bg-[var(--panel-fill-hover)]",
            "active:scale-[0.99]",
          ],

        paddingMap[padding],

        className
      )}
      style={{
        ...(accent
          ? {
              borderColor: tone?.border,
            }
          : {}),
        ...props.style,
      }}
      {...props}
    >
      {accent && (
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: tone?.color,
            opacity: 0.7,
          }}
        />
      )}

      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PAGE HEADER                                   */
/* -------------------------------------------------------------------------- */

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  sub?: string;
  actions?: React.ReactNode;

  badge?: React.ReactNode;

  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  sub,
  actions,
  badge,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-7 flex flex-col gap-5",
        "lg:flex-row lg:items-end lg:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {(eyebrow || badge) && (
          <div className="mb-2 flex items-center gap-2">
            {eyebrow && (
              <span
                className="
                  font-data
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-[var(--brand-primary)]
                "
              >
                {eyebrow}
              </span>
            )}

            {badge}
          </div>
        )}

        <h1
          className="
            font-display
            text-[28px]
            font-semibold
            tracking-[-0.035em]
            text-[var(--fg)]

            sm:text-[32px]
          "
        >
          {title}
        </h1>

        {sub && (
          <p
            className="
              mt-2
              max-w-2xl
              text-[13px]
              leading-relaxed
              text-[var(--fg-3)]

              sm:text-sm
            "
          >
            {sub}
          </p>
        )}
      </div>

      {actions && (
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2

            lg:justify-end
          "
        >
          {actions}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SECTION HEADER                                */
/* -------------------------------------------------------------------------- */

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  icon,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-4 flex items-start justify-between gap-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className="
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-xl
              border border-[var(--stroke)]
              bg-[var(--panel-fill-2)]
              text-[var(--brand-primary)]
            "
          >
            {icon}
          </div>
        )}

        <div>
          <h2
            className="
              font-display
              text-[15px]
              font-semibold
              tracking-[-0.01em]
              text-[var(--fg)]
            "
          >
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-[12px] text-[var(--fg-4)]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                STAT TILE                                   */
/* -------------------------------------------------------------------------- */

interface StatTileProps {
  label: string;
  value: string;

  delta?: {
    dir: "up" | "down";
    value: string;
  };

  icon?: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;

  tone?: AccentTone;

  iconColor?: string;
  iconBg?: string;
  iconBorder?: string;
  iconClassName?: string;

  footer?: React.ReactNode;

  className?: string;
}

export function StatTile({
  label,
  value,
  delta,
  icon: Icon,
  tone = "primary",
  iconColor,
  iconBg,
  iconBorder,
  iconClassName,
  footer,
  className,
}: StatTileProps) {
  const theme = TONE_MAP[tone] || TONE_MAP.primary;

  return (
    <GlassCard
      className={cn(
        "group min-h-[132px] p-5",
        className
      )}
      hover
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-[var(--fg-3)]">
            {label}
          </p>

          <p
            className="
              font-display
              mt-2
              text-[26px]
              font-semibold
              tracking-[-0.025em]
              text-[var(--fg)]
            "
          >
            {value}
          </p>
        </div>

        {Icon && (
          <div
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-xl
              border
            "
            style={{
              background: iconBg || theme.bg,
              borderColor: iconBorder || theme.border,
            }}
          >
            <Icon
              className={cn("h-[17px] w-[17px]", iconClassName)}
              style={{
                color: iconColor || theme.color,
              }}
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {delta ? (
          <span
            className="
              inline-flex
              items-center
              gap-1
              text-[11px]
              font-semibold
            "
            style={{
              color:
                delta.dir === "up"
                  ? "var(--success)"
                  : "var(--danger)",
            }}
          >
            <span className="text-[9px]">
              {delta.dir === "up" ? "▲" : "▼"}
            </span>

            {delta.value}
          </span>
        ) : (
          <span />
        )}

        {footer}
      </div>
    </GlassCard>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PRIMARY BUTTON                                */
/* -------------------------------------------------------------------------- */

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;

  tone?: "primary" | "pink" | "blue";

  size?: "sm" | "md" | "lg";

  fullWidth?: boolean;
}

export function PrimaryButton({
  className,
  children,
  tone = "primary",
  size = "md",
  fullWidth = false,
  ...props
}: PrimaryButtonProps) {
  const sizeMap = {
    sm: "h-8 px-3 text-[11px]",
    md: "h-10 px-4 text-[13px]",
    lg: "h-11 px-5 text-[14px]",
  };

  const color =
    tone === "blue"
      ? "var(--kora-blue)"
      : tone === "pink"
      ? "var(--kora-pink)"
      : "var(--brand-primary)";

  const shadow =
    tone === "blue"
      ? "var(--kora-blue-shadow)"
      : tone === "pink"
      ? "var(--kora-pink-shadow)"
      : "var(--brand-primary-shadow)";

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "rounded-xl",
        "font-semibold",

        "text-white",

        "transition-all duration-200",

        "hover:brightness-110",
        "hover:-translate-y-[1px]",

        "active:translate-y-0",
        "active:scale-[0.98]",

        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-[var(--brand-primary)]/40",

        "disabled:pointer-events-none",
        "disabled:opacity-50",

        sizeMap[size],

        fullWidth && "w-full",

        className
      )}
      style={{
        background: color,
        boxShadow: shadow,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SECONDARY BUTTON                              */
/* -------------------------------------------------------------------------- */

interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;

  tone?: "primary" | "neutral" | "pink" | "blue";

  size?: "sm" | "md";

  fullWidth?: boolean;
}

export function SecondaryButton({
  className,
  children,
  tone = "neutral",
  size = "md",
  fullWidth = false,
  ...props
}: SecondaryButtonProps) {
  const sizeMap = {
    sm: "h-8 px-3 text-[11px]",
    md: "h-10 px-4 text-[13px]",
  };

  const theme =
    tone === "pink"
      ? TONE_MAP.pink
      : tone === "blue"
      ? TONE_MAP.blue
      : tone === "primary"
      ? TONE_MAP.primary
      : TONE_MAP.neutral;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "rounded-xl border",

        "font-medium",

        "transition-all duration-200",

        "hover:bg-[var(--hover)]",
        "active:scale-[0.98]",

        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-[var(--brand-primary)]/30",

        "disabled:pointer-events-none",
        "disabled:opacity-50",

        sizeMap[size],

        fullWidth && "w-full",

        className
      )}
      style={{
        color: theme.color,
        borderColor: theme.border,
        background: theme.bg,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                               GHOST BUTTON                                 */
/* -------------------------------------------------------------------------- */

export function GhostButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "rounded-xl",

        "border border-[var(--stroke)]",
        "bg-transparent",

        "px-4 py-2",

        "text-[13px] font-medium",
        "text-[var(--fg-2)]",

        "transition-all duration-200",

        "hover:border-[var(--stroke-strong)]",
        "hover:bg-[var(--hover)]",
        "hover:text-[var(--fg)]",

        "active:scale-[0.98]",

        "disabled:pointer-events-none",
        "disabled:opacity-50",

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                ICON BUTTON                                 */
/* -------------------------------------------------------------------------- */

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;

  size?: "sm" | "md" | "lg";

  active?: boolean;
}

export function IconButton({
  className,
  children,
  size = "md",
  active = false,
  ...props
}: IconButtonProps) {
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center",

        "rounded-xl",
        "border",

        "transition-all duration-200",

        active
          ? [
              "border-[var(--brand-primary-border)]",
              "bg-[var(--brand-primary-soft)]",
              "text-[var(--brand-primary)]",
            ]
          : [
              "border-[var(--stroke)]",
              "bg-[var(--panel-fill)]",
              "text-[var(--fg-3)]",
              "hover:bg-[var(--hover)]",
              "hover:text-[var(--fg)]",
            ],

        "active:scale-[0.95]",

        sizeMap[size],

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   PILL                                     */
/* -------------------------------------------------------------------------- */

interface PillProps {
  children: React.ReactNode;

  tone?: AccentTone;

  size?: "sm" | "md";

  dot?: boolean;

  className?: string;
}

export function Pill({
  children,
  tone = "primary",
  size = "md",
  dot = false,
  className,
}: PillProps) {
  const theme = TONE_MAP[tone] || TONE_MAP.primary;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "rounded-full",
        "border",

        "font-data",
        "font-medium",
        "uppercase",

        size === "sm"
          ? "px-2 py-[3px] text-[9px] tracking-[0.08em]"
          : "px-2.5 py-1 text-[10px] tracking-[0.1em]",

        className
      )}
      style={{
        color: theme.color,
        background: theme.bg,
        borderColor: theme.border,
      }}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: theme.color,
          }}
        />
      )}

      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 TAB GROUP                                  */
/* -------------------------------------------------------------------------- */

interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabGroupProps {
  tabs: TabItem[];

  active: string;

  onChange: (key: string) => void;

  className?: string;
}

export function TabGroup({
  tabs,
  active,
  onChange,
  className,
}: TabGroupProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1",
        "overflow-x-auto",

        "rounded-xl",
        "border border-[var(--stroke)]",
        "bg-[var(--panel-fill-2)]",

        "p-1",

        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "flex shrink-0 items-center gap-2",

              "rounded-lg",

              "px-3 py-2",

              "text-[12px]",
              "font-medium",

              "transition-all duration-200",

              isActive
                ? [
                    "bg-[var(--panel-fill)]",
                    "text-[var(--fg)]",
                    "shadow-[0_2px_10px_rgba(0,0,0,0.18)]",
                  ]
                : [
                    "text-[var(--fg-4)]",
                    "hover:text-[var(--fg-2)]",
                  ]
            )}
          >
            {tab.icon && (
              <span
                className={cn(
                  "flex items-center",
                  isActive
                    ? "text-[var(--brand-primary)]"
                    : ""
                )}
              >
                {tab.icon}
              </span>
            )}

            {tab.label}

            {tab.badge !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-[1px]",
                  "text-[9px] font-semibold",

                  isActive
                    ? "bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
                    : "bg-[var(--panel-fill-3)] text-[var(--fg-4)]"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               EMPTY STATE                                  */
/* -------------------------------------------------------------------------- */

interface EmptyStateProps {
  icon?: React.ReactNode;

  title: string;

  description?: string;

  action?: React.ReactNode;

  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[260px] flex-col",
        "items-center justify-center",
        "rounded-2xl",
        "border border-dashed border-[var(--stroke)]",
        "bg-[var(--panel-fill)]",
        "p-8 text-center",

        className
      )}
    >
      {icon && (
        <div
          className="
            mb-4 flex h-12 w-12
            items-center justify-center

            rounded-2xl

            border border-[var(--brand-primary-border)]
            bg-[var(--brand-primary-soft)]

            text-[var(--brand-primary)]
          "
        >
          {icon}
        </div>
      )}

      <h3
        className="
          font-display
          text-[15px]
          font-semibold
          text-[var(--fg)]
        "
      >
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-[var(--fg-4)]">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              STATUS INDICATOR                              */
/* -------------------------------------------------------------------------- */

interface StatusIndicatorProps {
  status: "online" | "success" | "warning" | "error" | "offline";

  label?: string;

  pulse?: boolean;
}

export function StatusIndicator({
  status,
  label,
  pulse = false,
}: StatusIndicatorProps) {
  const statusMap = {
    online: "var(--kora-blue)",
    success: "var(--success)",
    warning: "var(--warning)",
    error: "var(--danger)",
    offline: "var(--fg-4)",
  };

  const color = statusMap[status];

  return (
    <span className="inline-flex items-center gap-2 text-[11px] text-[var(--fg-3)]">
      <span className="relative flex h-2 w-2">
        {pulse && status === "online" && (
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
            style={{
              background: color,
            }}
          />
        )}

        <span
          className="relative inline-flex h-2 w-2 rounded-full"
          style={{
            background: color,
          }}
        />
      </span>

      {label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                              DIVIDER                                       */
/* -------------------------------------------------------------------------- */

export function Divider({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-px w-full bg-[var(--stroke)]",
        className
      )}
    />
  );
}