"use client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";



import { useEffect, useState } from "react";
import {
<<<<<<< HEAD
  User, Palette, Bot, CreditCard, Bell, Save, Loader2,
  ShieldAlert, Check, Sun, Moon, Monitor, Sparkles,
  Search, Eye, Zap, Crown, Gift, ChevronDown, ChevronUp,
  ExternalLink, Users, Trash2, Mail, UserPlus, Brain
=======
  User,
  Users,
  Building2,
  Bell,
  Sparkles,
  Shield,
  CreditCard,
  Trash2,
  ChevronRight,
  Check,
  Camera,
  Mail,
  Lock,
  Globe,
  Clock3,
  Palette,
  Brain,
  MessageSquare,
  CalendarDays,
  BarChart3,
  Bot,
  LogOut,
  KeyRound,
  Monitor,
  Smartphone,
  Laptop,
  AlertTriangle,
  Save,
  Pencil,
  Crown,
  Zap,
  FileText,
  Moon,
  Sun,
  Type,
>>>>>>> main
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
<<<<<<< HEAD
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { TeamSettingsTab } from "@/components/dashboard/TeamSettingsTab";
import { AIMemorySettingsTab } from "@/components/dashboard/AIMemorySettingsTab";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "ai", label: "AI", icon: Bot },
  { id: "memory", label: "AI Memory", icon: Brain },
  { id: "team", label: "Team", icon: Users },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;
type Tab = (typeof TABS)[number]["id"];
=======
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import {
  ANALYTICS_STYLES,
  FONT_FAMILIES,
  THEME_MODES,
  DASHBOARD_DENSITIES,
  type AnalyticsStyle,
  type FontFamily,
  type ThemeMode,
  type DashboardDensity,
} from "@/lib/preferences/types";

type Section =
  | "account"
  | "workspace"
  | "preferences"
  | "notifications"
  | "ai"
  | "security"
  | "billing"
  | "danger";
>>>>>>> main

type ToggleProps = {
  enabled: boolean;
  onChange: (value: boolean) => void;
};

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      className="relative h-6 w-11 shrink-0 rounded-full border transition-all"
      style={{
        background: enabled ? "#ff0a8a" : "#242424",
        borderColor: enabled ? "#ff0a8a" : "#3a3a3a",
      }}
    >
      <span
        className="absolute top-1 h-4 w-4 rounded-full bg-white transition-all"
        style={{
          left: enabled ? "22px" : "4px",
        }}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-[#252525] py-5 last:border-b-0">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#303030] bg-[#191919]">
          <Icon className="h-4 w-4 text-[#bdbdbd]" />
        </div>

        <div className="min-w-0">
          <p className="text-[13px] font-medium text-white">{title}</p>

          {description && (
            <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-[#777]">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

function SectionCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#292929] bg-[#171717]">
      <div className="border-b border-[#292929] px-5 py-5 sm:px-6">
        {eyebrow && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff0a8a]">
            {eyebrow}
          </p>
        )}

        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-white">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-[12px] leading-relaxed text-[#777]">
            {description}
          </p>
        )}
      </div>

      <div className="px-5 sm:px-6">{children}</div>
    </section>
  );
}

function NavItem({
  active,
  icon: Icon,
  label,
  description,
  onClick,
  danger,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  description: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all"
      style={{
        background: active
          ? danger
            ? "rgba(239,68,68,0.08)"
            : "rgba(255,10,138,0.10)"
          : "transparent",
      }}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all"
        style={{
          borderColor: active
            ? danger
              ? "rgba(239,68,68,0.35)"
              : "rgba(255,10,138,0.35)"
            : "#292929",
          background: active ? "#1c1c1c" : "#171717",
        }}
      >
        <Icon
          className="h-4 w-4"
          style={{
            color: active
              ? danger
                ? "#ef4444"
                : "#ff0a8a"
              : "#858585",
          }}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className="block text-[12.5px] font-medium"
          style={{
            color: active
              ? danger
                ? "#f87171"
                : "#fff"
              : "#c5c5c5",
          }}
        >
          {label}
        </span>

        <span className="mt-0.5 block truncate text-[10.5px] text-[#666]">
          {description}
        </span>
      </span>

      <ChevronRight
        className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-50"
        style={{
          color: danger ? "#ef4444" : "#ff0a8a",
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const supabase = createClient();
  const { success, error: toastError } = useToast();

  const [section, setSection] = useState<Section>("account");
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState("Alex Carter");
  const [username, setUsername] = useState("alexcarter");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState(
    "Creator, strategist and builder helping people use AI to work smarter."
  );

  const [workspaceName, setWorkspaceName] = useState("Alex Carter's Workspace");

  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("Europe/Amsterdam");

  const { preferences, updatePreferences, setThemeMode: setGlobalTheme } = usePreferences();
  const [prefAnalyticsStyle, setPrefAnalyticsStyle] = useState<AnalyticsStyle>(
    preferences.analytics_style || "auto"
  );
  const [prefFontFamily, setPrefFontFamily] = useState<FontFamily>(
    preferences.font_family || "inter"
  );
  const [prefThemeMode, setPrefThemeMode] = useState<ThemeMode>(
    preferences.theme_mode || "dark"
  );
  const [prefDensity, setPrefDensity] = useState<DashboardDensity>(
    preferences.dashboard_density || "balanced"
  );

  useEffect(() => {
    if (preferences) {
      setPrefAnalyticsStyle(preferences.analytics_style);
      setPrefFontFamily(preferences.font_family);
      setPrefThemeMode(preferences.theme_mode);
      setPrefDensity(preferences.dashboard_density);
    }
  }, [preferences]);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inboxNotifications, setInboxNotifications] = useState(true);
  const [publishingNotifications, setPublishingNotifications] =
    useState(true);
  const [analyticsNotifications, setAnalyticsNotifications] = useState(false);
  const [aiNotifications, setAiNotifications] = useState(true);

  const [rememberPreferences, setRememberPreferences] = useState(true);
  const [learnFromContent, setLearnFromContent] = useState(true);
  const [adaptToAudience, setAdaptToAudience] = useState(true);
  const [useConversations, setUseConversations] = useState(true);

  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = await createClient();
  const session = await auth();
        const user = session?.user;

      if (!user) return;

      setUserId(user.id || null);
      setEmail(user.email ?? "");

      // Pull whatever is available from auth metadata.
      setName(
        (user as any).user_metadata?.full_name ??
          (user as any).user_metadata?.name ??
          "Alex Carter"
      );

      setUsername((user as any).user_metadata?.username ?? "alexcarter");

      if ((user as any).user_metadata?.bio) {
        setBio((user as any).user_metadata.bio);
      }
    }

    load();
  }, []);

  const saveAccount = async () => {
    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: name,
          username,
          bio,
        },
      });

      if (error) throw error;

      success("Account settings saved");
    } catch (error) {
      toastError(
        "Couldn't save settings",
        error instanceof Error ? error.message : undefined
      );
    } finally {
      setSaving(false);
    }
  };

  const saveWorkspace = async () => {
    setSaving(true);

    // Keep this UI-ready without assuming a particular workspace schema.
    // Connect this to your workspaces table when workspace persistence is wired.
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSaving(false);
    success("Workspace settings saved");
  };

  const savePreferences = async () => {
    setSaving(true);

    try {
      const ok = await updatePreferences({
        analytics_style: prefAnalyticsStyle,
        font_family: prefFontFamily,
        theme_mode: prefThemeMode,
        dashboard_density: prefDensity,
      });

      if (ok) {
        success("Personalization preferences saved");
      } else {
        toastError("Could not save preferences to server");
      }
    } catch (err: any) {
      toastError(err?.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    setSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 400));

    setSaving(false);
    success("Notification preferences saved");
  };

  const saveAI = async () => {
    setSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 400));

    setSaving(false);
    success("AI preferences saved");
  };

  const renderAccount = () => (
    <div className="space-y-5">
      <SectionCard
        eyebrow="Account"
        title="Profile"
        description="How your identity appears across KoraSpace."
      >
        <div className="flex flex-col gap-6 py-6 sm:flex-row sm:items-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-[#353535] bg-[#202020]">
              <User className="h-8 w-8 text-[#777]" />
            </div>

            <button
              type="button"
              className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-lg border border-[#121212] bg-[#ff0a8a] text-white shadow-lg"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-white">{name}</p>
            <p className="mt-1 text-[12px] text-[#777]">
              Your profile photo is visible to workspace members and audiences.
            </p>

            <button
              type="button"
              className="mt-3 rounded-lg border border-[#343434] bg-[#1d1d1d] px-3 py-1.5 text-[11px] font-medium text-[#ccc] transition hover:border-[#ff0a8a]/40 hover:text-white"
            >
              Change photo
            </button>
          </div>
        </div>

        <div className="grid gap-5 border-t border-[#252525] py-6 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-[11px] font-medium text-[#999]">
              Full name
            </span>

            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555]" />

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#303030] bg-[#121212] pl-10 pr-3 text-[13px] text-white outline-none transition focus:border-[#ff0a8a]/50"
              />
            </div>
          </label>

          <label>
            <span className="mb-2 block text-[11px] font-medium text-[#999]">
              Username
            </span>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#555]">
                @
              </span>

              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#303030] bg-[#121212] pl-8 pr-3 text-[13px] text-white outline-none transition focus:border-[#ff0a8a]/50"
              />
            </div>
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-[11px] font-medium text-[#999]">
              Email address
            </span>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555]" />

              <input
                value={email}
                disabled
                className="h-11 w-full rounded-xl border border-[#303030] bg-[#1b1b1b] pl-10 pr-3 text-[13px] text-[#777] outline-none"
              />
            </div>

            <p className="mt-1.5 text-[10px] text-[#555]">
              Email changes are managed through your authentication settings.
            </p>
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-[11px] font-medium text-[#999]">
              Bio
            </span>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-[#303030] bg-[#121212] p-3 text-[13px] leading-relaxed text-white outline-none transition focus:border-[#ff0a8a]/50"
            />
          </label>
        </div>

        <div className="flex justify-end border-t border-[#252525] py-4">
          <button
            onClick={saveAccount}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#ff0a8a] px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#ff2298] disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </SectionCard>

      <SectionCard
        title="Connected identity"
        description="Your KoraSpace account is authenticated with this email."
      >
        <SettingRow
          icon={Mail}
          title="Primary email"
          description={email || "No email available"}
        >
          <span className="flex items-center gap-1.5 rounded-full border border-[#214b38] bg-[#13241b] px-2.5 py-1 text-[10px] font-medium text-[#4ade80]">
            <Check className="h-3 w-3" />
            Verified
          </span>
        </SettingRow>

        <SettingRow
          icon={Lock}
          title="Password"
          description="Update the password used to sign into KoraSpace."
        >
          <button className="rounded-lg border border-[#343434] bg-[#1d1d1d] px-3 py-2 text-[11px] font-medium text-[#ccc] hover:text-white">
            Change
          </button>
        </SettingRow>
      </SectionCard>
    </div>
  );

  const renderWorkspace = () => (
    <div className="space-y-5">
      <SectionCard
        eyebrow="Workspace"
        title="Workspace settings"
        description="Manage the space where your content, brand and team live."
      >
        <div className="space-y-5 py-6">
          <label>
            <span className="mb-2 block text-[11px] font-medium text-[#999]">
              Workspace name
            </span>

            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555]" />

              <input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#303030] bg-[#121212] pl-10 pr-3 text-[13px] text-white outline-none focus:border-[#ff0a8a]/50"
              />
            </div>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#292929] bg-[#121212] p-4">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#555]">
                Workspace type
              </p>

              <p className="mt-2 text-sm font-medium text-white">
                Personal workspace
              </p>

              <p className="mt-1 text-[11px] text-[#666]">
                Your personal creator environment.
              </p>
            </div>

            <div className="rounded-xl border border-[#292929] bg-[#121212] p-4">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#555]">
                Your role
              </p>

              <p className="mt-2 text-sm font-medium text-white">
                Owner
              </p>

              <p className="mt-1 text-[11px] text-[#666]">
                Full access to workspace settings.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-[#252525] py-4">
          <button
            onClick={saveWorkspace}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#ff0a8a] px-4 py-2.5 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save workspace"}
          </button>
        </div>
      </SectionCard>

      <SectionCard
        title="Workspace access"
        description="Manage people who can access this workspace."
      >
        <SettingRow
          icon={User}
          title="Workspace members"
          description="Invite collaborators and manage their roles."
        >
          <button className="flex items-center gap-1.5 rounded-lg border border-[#343434] bg-[#1d1d1d] px-3 py-2 text-[11px] font-medium text-[#ccc]">
            Manage
            <ChevronRight className="h-3 w-3" />
          </button>
        </SettingRow>

        <SettingRow
          icon={Shield}
          title="Roles & permissions"
          description="Control what owners, admins, managers and members can access."
        >
          <button className="flex items-center gap-1.5 rounded-lg border border-[#343434] bg-[#1d1d1d] px-3 py-2 text-[11px] font-medium text-[#ccc]">
            Configure
            <ChevronRight className="h-3 w-3" />
          </button>
        </SettingRow>
      </SectionCard>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-5">
      <SectionCard
        eyebrow="Personalization"
        title="Experience & Visual Identity"
        description="Configure your analytics visualization, typography, theme, and dashboard density."
      >
        {/* Appearance Mode */}
        <SettingRow
          icon={Palette}
          title="Theme Mode"
          description="Choose between deep obsidian dark mode, crisp daylight light mode, or system sync."
        >
          <div className="flex rounded-lg border border-[#303030] bg-[#121212] p-1">
            {THEME_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setPrefThemeMode(mode.id);
                  setGlobalTheme(mode.id);
                }}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition cursor-pointer"
                style={{
                  background: prefThemeMode === mode.id ? "#292929" : "transparent",
                  color: prefThemeMode === mode.id ? "#fff" : "#888",
                }}
              >
                {mode.id === "dark" && <Moon className="h-3 w-3" />}
                {mode.id === "light" && <Sun className="h-3 w-3" />}
                {mode.id === "system" && <Monitor className="h-3 w-3" />}
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </SettingRow>

        {/* Typography / Font Family */}
        <SettingRow
          icon={Type}
          title="Typography"
          description="Choose the primary font family that powers all typography and metrics across Koraspace."
        >
          <select
            value={prefFontFamily}
            onChange={(e) => {
              const val = e.target.value as FontFamily;
              setPrefFontFamily(val);
              updatePreferences({ font_family: val });
            }}
            className="rounded-lg border border-[#303030] bg-[#121212] px-3 py-2 text-[12px] text-white outline-none cursor-pointer"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label} ({font.category})
              </option>
            ))}
          </select>
        </SettingRow>

        {/* Analytics Visualization Style */}
        <SettingRow
          icon={BarChart3}
          title="Default Analytics Chart"
          description="Choose which chart style to use when plotting growth, performance, and conversion signals."
        >
          <select
            value={prefAnalyticsStyle}
            onChange={(e) => {
              const val = e.target.value as AnalyticsStyle;
              setPrefAnalyticsStyle(val);
              updatePreferences({ analytics_style: val });
            }}
            className="rounded-lg border border-[#303030] bg-[#121212] px-3 py-2 text-[12px] text-white outline-none cursor-pointer"
          >
            {ANALYTICS_STYLES.map((style) => (
              <option key={style.id} value={style.id}>
                {style.title} — {style.subtitle}
              </option>
            ))}
          </select>
        </SettingRow>

        {/* Dashboard Density */}
        <SettingRow
          icon={Monitor}
          title="Dashboard Density"
          description="Control the spacing and compactness of cards, tables, and metrics."
        >
          <div className="flex rounded-lg border border-[#303030] bg-[#121212] p-1">
            {DASHBOARD_DENSITIES.map((dens) => (
              <button
                key={dens.id}
                type="button"
                onClick={() => {
                  setPrefDensity(dens.id);
                  updatePreferences({ dashboard_density: dens.id });
                }}
                className="rounded-md px-3 py-1.5 text-[11px] font-medium transition cursor-pointer"
                style={{
                  background: prefDensity === dens.id ? "#292929" : "transparent",
                  color: prefDensity === dens.id ? "#fff" : "#888",
                }}
              >
                {dens.label}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          icon={Globe}
          title="Language"
          description="Language used throughout your KoraSpace dashboard."
        >
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-[#303030] bg-[#121212] px-3 py-2 text-[11px] text-white outline-none"
          >
            <option>English</option>
            <option>Dutch</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </SettingRow>

        <SettingRow
          icon={Clock3}
          title="Timezone"
          description="Used for publishing, scheduling and analytics."
        >
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="max-w-[190px] rounded-lg border border-[#303030] bg-[#121212] px-3 py-2 text-[11px] text-white outline-none"
          >
            <option value="Europe/Amsterdam">Amsterdam</option>
            <option value="Europe/London">London</option>
            <option value="America/New_York">New York</option>
            <option value="America/Los_Angeles">Los Angeles</option>
            <option value="Asia/Dubai">Dubai</option>
          </select>
        </SettingRow>
      </SectionCard>

      <div className="flex justify-end">
        <button
          onClick={savePreferences}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#ff0a8a] px-4 py-2.5 text-[12px] font-semibold text-white disabled:opacity-50 cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving…" : "Save preferences"}
        </button>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-5">
      <SectionCard
        eyebrow="Notifications"
        title="Notification preferences"
        description="Choose what deserves your attention."
      >
        <SettingRow
          icon={Mail}
          title="Email notifications"
          description="Receive important KoraSpace updates by email."
        >
          <Toggle
            enabled={emailNotifications}
            onChange={setEmailNotifications}
          />
        </SettingRow>

        <SettingRow
          icon={MessageSquare}
          title="Inbox activity"
          description="New DMs, comments, mentions and audience activity."
        >
          <Toggle
            enabled={inboxNotifications}
            onChange={setInboxNotifications}
          />
        </SettingRow>

        <SettingRow
          icon={CalendarDays}
          title="Publishing"
          description="Scheduled posts, failed publishing attempts and reminders."
        >
          <Toggle
            enabled={publishingNotifications}
            onChange={setPublishingNotifications}
          />
        </SettingRow>

        <SettingRow
          icon={BarChart3}
          title="Analytics"
          description="Weekly performance reports and important growth changes."
        >
          <Toggle
            enabled={analyticsNotifications}
            onChange={setAnalyticsNotifications}
          />
        </SettingRow>

        <SettingRow
          icon={Sparkles}
          title="AI suggestions"
          description="New ideas, recommendations and AI-generated insights."
        >
          <Toggle
            enabled={aiNotifications}
            onChange={setAiNotifications}
          />
        </SettingRow>
      </SectionCard>

      <div className="flex justify-end">
        <button
          onClick={saveNotifications}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#ff0a8a] px-4 py-2.5 text-[12px] font-semibold text-white disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving…" : "Save notifications"}
        </button>
      </div>
    </div>
  );

  const renderAI = () => (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-[#3b1c34] bg-[#1a1418]">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#ff0a8a]/30 bg-[#251421]">
              <Brain className="h-5 w-5 text-[#ff0a8a]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-white">
                  Personal Brand Brain
                </h2>

                <span className="rounded-full border border-[#ff0a8a]/25 bg-[#ff0a8a]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#ff4aa8]">
                  Active
                </span>
              </div>

              <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-[#888]">
                KoraSpace learns your voice, content preferences and audience
                so AI suggestions feel like you.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSection("ai")}
            className="rounded-lg border border-[#393939] bg-[#202020] px-3 py-2 text-[11px] font-medium text-[#ccc]"
          >
            Manage brain
          </button>
        </div>
      </div>

      <SectionCard
        title="AI memory"
        description="Choose what KoraSpace can remember when creating content."
      >
        <SettingRow
          icon={KeyRound}
          title="Remember my preferences"
          description="Remember your recurring instructions, formats and creative preferences."
        >
          <Toggle
            enabled={rememberPreferences}
            onChange={setRememberPreferences}
          />
        </SettingRow>

        <SettingRow
          icon={Sparkles}
          title="Learn from my content"
          description="Use your published content to understand your style."
        >
          <Toggle
            enabled={learnFromContent}
            onChange={setLearnFromContent}
          />
        </SettingRow>

        <SettingRow
          icon={Users}
          title="Adapt to my audience"
          description="Use audience behavior and engagement patterns to improve suggestions."
        >
          <Toggle
            enabled={adaptToAudience}
            onChange={setAdaptToAudience}
          />
        </SettingRow>

        <SettingRow
          icon={MessageSquare}
          title="Use past conversations"
          description="Allow your previous KoraSpace conversations to inform AI responses."
        >
          <Toggle
            enabled={useConversations}
            onChange={setUseConversations}
          />
        </SettingRow>
      </SectionCard>

      <SectionCard
        title="AI controls"
        description="Fine-tune how the AI works with your brand."
      >
        <SettingRow
          icon={Bot}
          title="Default AI behavior"
          description="Use your Brand Brain automatically when generating content."
        >
          <span className="rounded-full border border-[#214b38] bg-[#13241b] px-2.5 py-1 text-[10px] font-medium text-[#4ade80]">
            Enabled
          </span>
        </SettingRow>

        <SettingRow
          icon={Zap}
          title="Content enhancement"
          description="Improve hooks, clarity and structure while preserving your voice."
        >
          <span className="rounded-full border border-[#303030] bg-[#1d1d1d] px-2.5 py-1 text-[10px] text-[#aaa]">
            Balanced
          </span>
        </SettingRow>
      </SectionCard>

      <div className="flex justify-end">
        <button
          onClick={saveAI}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#ff0a8a] px-4 py-2.5 text-[12px] font-semibold text-white disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving…" : "Save AI settings"}
        </button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-5">
      <SectionCard
        eyebrow="Security"
        title="Account security"
        description="Keep your KoraSpace account protected."
      >
        <SettingRow
          icon={Lock}
          title="Password"
          description="Last changed recently."
        >
          <button className="rounded-lg border border-[#343434] bg-[#1d1d1d] px-3 py-2 text-[11px] font-medium text-[#ccc]">
            Change password
          </button>
        </SettingRow>

        <SettingRow
          icon={Shield}
          title="Two-factor authentication"
          description="Add another layer of protection to your account."
        >
          <Toggle enabled={twoFactor} onChange={setTwoFactor} />
        </SettingRow>

        <SettingRow
          icon={KeyRound}
          title="Login sessions"
          description="Review the devices currently signed into your account."
        >
          <button className="flex items-center gap-1.5 rounded-lg border border-[#343434] bg-[#1d1d1d] px-3 py-2 text-[11px] font-medium text-[#ccc]">
            Review
            <ChevronRight className="h-3 w-3" />
          </button>
        </SettingRow>
      </SectionCard>

      <SectionCard
        title="Active sessions"
        description="Devices currently signed into KoraSpace."
      >
        <SettingRow
          icon={Laptop}
          title="Windows · Chrome"
          description="Current session · Netherlands"
        >
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#4ade80]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
            Current
          </span>
        </SettingRow>

        <SettingRow
          icon={Smartphone}
          title="Mobile device"
          description="Last active recently"
        >
          <button className="text-[11px] font-medium text-[#888] hover:text-white">
            Sign out
          </button>
        </SettingRow>
      </SectionCard>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 rounded-xl border border-[#343434] bg-[#1b1b1b] px-4 py-2.5 text-[12px] font-medium text-[#ccc] hover:text-white">
          <LogOut className="h-3.5 w-3.5" />
          Sign out all other sessions
        </button>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-[#343434] bg-[#171717]">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-[#ff0a8a]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff0a8a]">
                Current plan
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Premium
            </h2>

            <p className="mt-1 text-[12px] text-[#777]">
              Creator + Marketer modes, advanced AI and workspace features.
            </p>
          </div>

          <button className="rounded-xl bg-[#ff0a8a] px-4 py-2.5 text-[12px] font-semibold text-white">
            Manage plan
          </button>
        </div>

        <div className="grid border-t border-[#292929] sm:grid-cols-3">
          <div className="border-b border-[#292929] p-5 sm:border-b-0 sm:border-r">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#555]">
              AI generations
            </p>
            <p className="mt-2 text-lg font-semibold text-white">Unlimited</p>
          </div>

          <div className="border-b border-[#292929] p-5 sm:border-b-0 sm:border-r">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#555]">
              Social accounts
            </p>
            <p className="mt-2 text-lg font-semibold text-white">12</p>
          </div>

          <div className="p-5">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#555]">
              Modes
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              Creator + Marketer
            </p>
          </div>
        </div>
      </div>

      <SectionCard
        title="Billing"
        description="Manage your subscription and payment information."
      >
        <SettingRow
          icon={CreditCard}
          title="Payment method"
          description="No payment method displayed here."
        >
          <button className="rounded-lg border border-[#343434] bg-[#1d1d1d] px-3 py-2 text-[11px] font-medium text-[#ccc]">
            Manage
          </button>
        </SettingRow>

        <SettingRow
          icon={FileText}
          title="Invoices"
          description="View and download your previous invoices."
        >
          <button className="flex items-center gap-1.5 text-[11px] font-medium text-[#aaa] hover:text-white">
            View invoices
            <ChevronRight className="h-3 w-3" />
          </button>
        </SettingRow>
      </SectionCard>
    </div>
  );

  const renderDanger = () => (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#542626] bg-[#1b1515] p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#6b3030] bg-[#241919]">
            <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
          </div>

          <div>
            <h2 className="text-[15px] font-semibold text-white">
              Danger zone
            </h2>

            <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-[#888]">
              These actions can permanently affect your KoraSpace workspace
              and data. Proceed carefully.
            </p>
          </div>
        </div>
      </div>

      <SectionCard
        title="Account actions"
        description="Permanent or destructive actions."
      >
        <SettingRow
          icon={LogOut}
          title="Sign out everywhere"
          description="End all active sessions across your devices."
        >
          <button className="rounded-lg border border-[#343434] bg-[#1d1d1d] px-3 py-2 text-[11px] font-medium text-[#ccc]">
            Sign out
          </button>
        </SettingRow>

        <SettingRow
          icon={Trash2}
          title="Delete account"
          description="Permanently delete your account, workspace and associated data."
        >
          <button className="rounded-lg border border-[#6b3030] bg-[#241919] px-3 py-2 text-[11px] font-medium text-[#ef7777] hover:bg-[#2b1a1a]">
            Delete account
          </button>
        </SettingRow>
      </SectionCard>
    </div>
  );

  const content = {
    account: renderAccount(),
    workspace: renderWorkspace(),
    preferences: renderPreferences(),
    notifications: renderNotifications(),
    ai: renderAI(),
    security: renderSecurity(),
    billing: renderBilling(),
    danger: renderDanger(),
  }[section];

  const nav = [
    {
      id: "account" as Section,
      icon: User,
      label: "Account",
      description: "Profile & identity",
    },
    {
      id: "workspace" as Section,
      icon: Building2,
      label: "Workspace",
      description: "Team & permissions",
    },
    {
      id: "preferences" as Section,
      icon: Palette,
      label: "Preferences",
      description: "App experience",
    },
    {
      id: "notifications" as Section,
      icon: Bell,
      label: "Notifications",
      description: "Alerts & updates",
    },
    {
      id: "ai" as Section,
      icon: Sparkles,
      label: "AI & Brand Brain",
      description: "AI memory & behavior",
    },
    {
      id: "security" as Section,
      icon: Shield,
      label: "Security",
      description: "Password & sessions",
    },
    {
      id: "billing" as Section,
      icon: CreditCard,
      label: "Billing",
      description: "Plan & payments",
    },
    {
      id: "danger" as Section,
      icon: Trash2,
      label: "Danger zone",
      description: "Destructive actions",
      danger: true,
    },
  ];

  return (
    <div className="min-h-full bg-[#121212] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ff0a8a]">
                Workspace
              </p>

              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                Settings
              </h1>

              <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[#777]">
                Manage your KoraSpace account, workspace, AI, notifications
                and security.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#292929] bg-[#171717] px-3 py-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff0a8a] text-[11px] font-bold text-white">
                {name
                  .split(" ")
                  .map((x) => x[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="hidden sm:block">
                <p className="text-[11px] font-medium text-white">{name}</p>
                <p className="text-[9px] text-[#666]">Personal workspace</p>
              </div>
            </div>
          </div>
        </div>

<<<<<<< HEAD
          {tab === "appearance" && (
            <>
              <GlassCard className="p-6">
                <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Theme</p>
                <p className="mt-1 text-[13px] text-[var(--fg-3)]">Koraspace is designed for dark. Light is available.</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[{ id: "dark", label: "Dark", icon: Moon }, { id: "light", label: "Light", icon: Sun }, { id: "system", label: "System", icon: Monitor }].map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setTheme(o.id)}
                      className="flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors"
                      style={{ borderColor: theme === o.id ? "rgba(99,102,241,0.6)" : "var(--stroke)", background: theme === o.id ? "rgba(99,102,241,0.1)" : "var(--panel-fill)" }}
                    >
                      <o.icon className="h-5 w-5" style={{ color: theme === o.id ? "var(--sai-indigo)" : "var(--fg-3)" }} />
                      <span className="text-[13px] text-[var(--fg)]">{o.label}</span>
                    </button>
                  ))}
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Font</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {FONTS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => { setForm({ ...form, font_pref: f.id }); applyFont(f.id); }}
                      className="rounded-xl border p-4 text-left transition-colors"
                      style={{ borderColor: form.font_pref === f.id ? "rgba(99,102,241,0.6)" : "var(--stroke)", background: form.font_pref === f.id ? "rgba(99,102,241,0.1)" : "var(--panel-fill)" }}
                    >
                      <span className="block text-[15px] font-semibold text-[var(--fg)]" style={{ fontFamily: f.stack }}>{f.label}</span>
                      <span className="mt-1 block text-[12px] text-[var(--fg-4)]" style={{ fontFamily: f.stack }}>The quick brown fox</span>
                    </button>
                  ))}
                </div>
              </GlassCard>
            </>
          )}

          {/* ── AI TAB ─────────────────────────────────────────── */}
          {tab === "ai" && (
            <>
              {/* Current model display */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-[15px] font-semibold text-[var(--fg)]">AI Model</p>
                    <p className="mt-1 text-[13px] text-[var(--fg-3)]">
                      Powers all your agents — Create, Ghost Mode, Trends, Scoring
                    </p>
                  </div>
                  <a
                    href="https://openrouter.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-1.5 text-[11px] text-[var(--fg-3)] transition-colors hover:text-[var(--fg-2)]"
                  >
                    Powered by OpenRouter <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Selected model card */}
                {selectedModelInfo && (
                  <div
                    className="mt-4 rounded-xl border p-4"
                    style={{ borderColor: "rgba(99,102,241,0.5)", background: "rgba(99,102,241,0.08)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
                        >
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[var(--fg)]">{selectedModelInfo.name}</p>
                          <p className="text-[11px] text-[var(--fg-3)]">{selectedModelInfo.provider} · {selectedModelInfo.contextWindow} context</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedModelInfo.supportsVision && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                            <Eye className="h-2.5 w-2.5" /> Vision
                          </span>
                        )}
                        {selectedModelInfo.tier && <TierBadge tier={selectedModelInfo.tier} tiers={tiers} />}
                      </div>
                    </div>
                    {selectedModelInfo.pricing && (
                      <div className="mt-3 flex gap-4 border-t border-[var(--stroke)] pt-3">
                        <span className="text-[11px] text-[var(--fg-4)]">
                          Input: <span className="text-[var(--fg-2)]">{formatPrice(selectedModelInfo.pricing.prompt)}</span>
                        </span>
                        <span className="text-[11px] text-[var(--fg-4)]">
                          Output: <span className="text-[var(--fg-2)]">{formatPrice(selectedModelInfo.pricing.completion)}</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>

              {/* Recommended models */}
              <GlassCard className="p-6">
                <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Recommended Models</p>
                <p className="mt-1 text-[13px] text-[var(--fg-3)]">Curated for social media content creation. Pick one that fits your budget and quality needs.</p>

                {modelsLoading ? (
                  <div className="mt-6 flex items-center justify-center gap-2 text-[13px] text-[var(--fg-3)]">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading models…
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    {recommendedModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setForm({ ...form, ai_model: model.id })}
                        className="group flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all hover:border-[rgba(99,102,241,0.4)]"
                        style={{
                          borderColor: form.ai_model === model.id ? "rgba(99,102,241,0.6)" : "var(--stroke)",
                          background: form.ai_model === model.id ? "rgba(99,102,241,0.08)" : "var(--panel-fill)",
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[14px] font-medium text-[var(--fg)]">{model.name}</span>
                            <span className="text-[11px] text-[var(--fg-4)]">{model.provider}</span>
                            {model.tier && <TierBadge tier={model.tier} tiers={tiers} />}
                            {model.supportsVision && (
                              <span className="flex items-center gap-0.5 text-[10px] text-emerald-400">
                                <Eye className="h-2.5 w-2.5" /> Vision
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[12px] text-[var(--fg-3)] line-clamp-1">{model.description}</p>
                          <div className="mt-1.5 flex items-center gap-3">
                            <span className="text-[10px] text-[var(--fg-4)]">{model.contextWindow} context</span>
                            {model.pricing && (
                              <span className="text-[10px] text-[var(--fg-4)]">
                                {formatPrice(model.pricing.prompt)} input · {formatPrice(model.pricing.completion)} output
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 pt-1">
                          {form.ai_model === model.id && (
                            <Check className="h-4 w-4 text-[var(--sai-indigo)]" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </GlassCard>

              {/* Browse all models */}
              <GlassCard className="p-6">
                <button
                  onClick={() => setShowAllModels(!showAllModels)}
                  className="flex w-full items-center justify-between"
                >
                  <div>
                    <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Browse All Models</p>
                    <p className="mt-1 text-[13px] text-[var(--fg-3)]">
                      {allModels.length > 0 ? `${allModels.length} models available via OpenRouter` : "Expand to browse"}
                    </p>
                  </div>
                  {showAllModels
                    ? <ChevronUp className="h-5 w-5 text-[var(--fg-3)]" />
                    : <ChevronDown className="h-5 w-5 text-[var(--fg-3)]" />}
                </button>

                {showAllModels && (
                  <div className="mt-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-4)]" />
                      <input
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        placeholder="Search models… (e.g. claude, gpt, gemini)"
                        className={`${inputCls} pl-9`}
                      />
                    </div>

                    {/* Model list */}
                    <div className="mt-3 max-h-[400px] space-y-1.5 overflow-y-auto">
                      {filteredAllModels.slice(0, 50).map((model) => (
                        <button
                          key={model.id}
                          onClick={() => setForm({ ...form, ai_model: model.id })}
                          className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors hover:border-[rgba(99,102,241,0.4)]"
                          style={{
                            borderColor: form.ai_model === model.id ? "rgba(99,102,241,0.6)" : "var(--stroke)",
                            background: form.ai_model === model.id ? "rgba(99,102,241,0.08)" : "transparent",
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[13px] font-medium text-[var(--fg)]">{model.name}</span>
                              <span className="text-[10px] text-[var(--fg-4)]">{model.provider}</span>
                              {model.supportsVision && (
                                <Eye className="h-3 w-3 text-emerald-400" />
                              )}
                            </div>
                            {model.pricing && (
                              <span className="text-[10px] text-[var(--fg-4)]">
                                {formatPrice(model.pricing.prompt)} / {formatPrice(model.pricing.completion)}
                              </span>
                            )}
                          </div>
                          {form.ai_model === model.id && (
                            <Check className="h-3.5 w-3.5 flex-shrink-0 text-[var(--sai-indigo)]" />
                          )}
                        </button>
                      ))}
                      {filteredAllModels.length > 50 && (
                        <p className="py-2 text-center text-[11px] text-[var(--fg-4)]">
                          Showing 50 of {filteredAllModels.length} — refine your search
                        </p>
                      )}
                      {filteredAllModels.length === 0 && modelSearch && (
                        <p className="py-6 text-center text-[13px] text-[var(--fg-3)]">
                          No models matching &quot;{modelSearch}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Raw language mode */}
              <GlassCard className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-[var(--sai-gold)]" />
                      <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Raw language mode</p>
                    </div>
                    <p className="mt-1.5 max-w-md text-[13px] text-[var(--fg-3)]">
                      Let the agent write directly, without softening or corporate filters. Output stays lawful — you own what you post.
                    </p>
                  </div>
                  <Toggle on={form.ai_unfiltered} onChange={(v) => setForm({ ...form, ai_unfiltered: v })} />
                </div>
                {form.ai_unfiltered && (
                  <div className="mt-4 rounded-xl border border-[var(--sai-gold)]/25 bg-[var(--sai-gold)]/10 p-3 text-[12.5px] text-[var(--sai-gold)]">
                    Raw mode is on. Review drafts before publishing.
                  </div>
                )}
              </GlassCard>

              {/* Creativity slider */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Creativity</p>
                  <Pill tone="indigo">{form.ai_temperature.toFixed(1)}</Pill>
                </div>
                <input
                  type="range" min={0} max={1} step={0.1} value={form.ai_temperature}
                  onChange={(e) => setForm({ ...form, ai_temperature: Number(e.target.value) })}
                  className="mt-4 w-full accent-[var(--sai-indigo)]"
                />
                <div className="mt-1 flex justify-between text-[11px] text-[var(--fg-4)]"><span>Precise</span><span>Balanced</span><span>Wild</span></div>
              </GlassCard>
            </>
          )}

          {tab === "memory" && (
            <AIMemorySettingsTab />
          )}

          {tab === "team" && (
            <TeamSettingsTab plan={form.plan} />
          )}

          {tab === "billing" && (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Current plan</p>
                  <div className="mt-2 flex items-center gap-2"><Pill tone="violet">{form.plan}</Pill><span className="text-[13px] text-[var(--fg-3)]">14-day trial</span></div>
                </div>
                <Link href="/dashboard/billing" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-[var(--fg)]" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
                  <Sparkles className="h-4 w-4" /> Manage plan
                </Link>
=======
        {/* Main settings layout */}
        <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          {/* Navigation */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-[#292929] bg-[#171717] p-2">
              <p className="px-3 pb-2 pt-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#555]">
                Settings
              </p>

              <div className="space-y-0.5">
                {nav.map((item) => (
                  <NavItem
                    key={item.id}
                    active={section === item.id}
                    icon={item.icon}
                    label={item.label}
                    description={item.description}
                    danger={item.danger}
                    onClick={() => setSection(item.id)}
                  />
                ))}
>>>>>>> main
              </div>
            </div>

            {/* Version card */}
            <div className="mt-3 rounded-2xl border border-[#292929] bg-[#171717] p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#4ade80]" />
                <span className="text-[10px] font-medium text-[#aaa]">
                  All systems operational
                </span>
              </div>

              <p className="mt-2 text-[9px] text-[#555]">
                KoraSpace · v1.0.0
              </p>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-[11px] text-[#555]">Settings</span>
              <ChevronRight className="h-3 w-3 text-[#444]" />
              <span className="text-[11px] font-medium text-[#aaa]">
                {nav.find((n) => n.id === section)?.label}
              </span>
            </div>

            {content}
          </main>
        </div>
      </div>
    </div>
  );
}