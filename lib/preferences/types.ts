export type AnalyticsStyle =
  | "auto"
  | "line"
  | "bar"
  | "area"
  | "donut"
  | "scatter"
  | "funnel"
  | "radar";

export type FontFamily =
  | "inter"
  | "geist"
  | "dm-sans"
  | "manrope"
  | "plus-jakarta"
  | "space-grotesk"
  | "ibm-plex";

export type ThemeMode = "dark" | "light" | "system";

export type DashboardDensity = "minimal" | "balanced" | "detailed";

export interface UserPreferences {
  user_id?: string;
  analytics_style: AnalyticsStyle;
  font_family: FontFamily;
  theme_mode: ThemeMode;
  dashboard_density: DashboardDensity;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  analytics_style: "auto",
  font_family: "inter",
  theme_mode: "dark",
  dashboard_density: "balanced",
};

export interface AnalyticsStyleOption {
  id: AnalyticsStyle;
  title: string;
  subtitle: string;
  bestFor: string;
  description: string;
}

export const ANALYTICS_STYLES: AnalyticsStyleOption[] = [
  {
    id: "auto",
    title: "Smart / Auto",
    subtitle: "Context-aware adaptive",
    bestFor: "Automated best fit",
    description: "Koraspace dynamically selects the ideal chart based on data distribution, periodicity, and metrics.",
  },
  {
    id: "line",
    title: "Line Chart",
    subtitle: "Growth & trajectories",
    bestFor: "Growth, reach, revenue over time",
    description: "Crisp multi-point curves tracking trends, momentum, and continuous velocity.",
  },
  {
    id: "bar",
    title: "Bar Chart",
    subtitle: "Comparative breakdown",
    bestFor: "Comparing campaigns & platforms",
    description: "Balanced vertical bars highlighting relative performance and channel comparisons.",
  },
  {
    id: "area",
    title: "Area Chart",
    subtitle: "Volume & engagement",
    bestFor: "Traffic, reach, engagement volume",
    description: "Luminous gradient-filled silhouettes emphasizing cumulative scale and audience impact.",
  },
  {
    id: "donut",
    title: "Donut Chart",
    subtitle: "Channel distribution",
    bestFor: "Channel / platform distribution",
    description: "Proportional radial breakdown displaying share of voice, spend, or engagement by source.",
  },
  {
    id: "scatter",
    title: "Scatter Plot",
    subtitle: "Correlation & efficiency",
    bestFor: "Spend vs. revenue, engagement relationships",
    description: "2D coordinate clusters unveiling hidden correlations, efficiency frontiers, and outliers.",
  },
  {
    id: "funnel",
    title: "Funnel Chart",
    subtitle: "Conversion pipeline",
    bestFor: "Lead → qualified → conversion pipeline",
    description: "Tapered sequential stages mapping user journey velocity and step-by-step drop-offs.",
  },
  {
    id: "radar",
    title: "Radar Chart",
    subtitle: "Multi-axis health",
    bestFor: "Multi-dimensional skill & channel health",
    description: "Spiderweb polygon displaying balanced performance across engagement, reach, conversion, and consistency.",
  },
];

export interface FontFamilyOption {
  id: FontFamily;
  label: string;
  category: string;
  description: string;
  preview: string;
  cssFamily: string;
}

export const FONT_FAMILIES: FontFamilyOption[] = [
  {
    id: "inter",
    label: "Inter",
    category: "Modern Neutral",
    description: "Clean, ultra-legible digital standard optimized for dense data tables.",
    preview: "The quick brown fox jumps over the lazy dog · 1,234,567",
    cssFamily: "var(--font-inter), sans-serif",
  },
  {
    id: "geist",
    label: "Geist",
    category: "Technical Precision",
    description: "Modern developer-grade typography with razor-sharp geometric alignment.",
    preview: "Autonomous agents analyzing conversion telemetry · 98.4%",
    cssFamily: "var(--font-geist-sans), sans-serif",
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    category: "Contemporary Geometric",
    description: "Approachable and friendly sans with warm proportions and open apertures.",
    preview: "Audience growth velocity across verified accounts · +24.8%",
    cssFamily: "'DM Sans', sans-serif",
  },
  {
    id: "manrope",
    label: "Manrope",
    category: "Refined Geometric",
    description: "Balanced semi-condensed modern grotesque with impeccable display clarity.",
    preview: "High-performance marketing operations & autonomous scheduling",
    cssFamily: "'Manrope', sans-serif",
  },
  {
    id: "plus-jakarta",
    label: "Plus Jakarta Sans",
    category: "Premium Executive",
    description: "Contemporary brand-forward typography blending elegance and authority.",
    preview: "Executive revenue signals and predictive intelligence · \$45,280",
    cssFamily: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    category: "Tech-Forward",
    description: "Distinctive monospace-inspired proportions with modern aesthetic character.",
    preview: "Real-time AI pipeline execution and multi-channel routing",
    cssFamily: "'Space Grotesk', sans-serif",
  },
  {
    id: "ibm-plex",
    label: "IBM Plex Sans",
    category: "Structured Editorial",
    description: "Engineered neutrality with engineered rhythmic cadence for serious operators.",
    preview: "Global distribution network with zero-trust credentials",
    cssFamily: "'IBM Plex Sans', sans-serif",
  },
];

export interface ThemeOption {
  id: ThemeMode;
  label: string;
  description: string;
}

export const THEME_MODES: ThemeOption[] = [
  {
    id: "dark",
    label: "Dark",
    description: "Deep obsidian backdrop (#0d0d10) with glowing accents and zero eye fatigue.",
  },
  {
    id: "light",
    label: "Light",
    description: "Crisp daylight clarity (#f8fafc) with executive contrast and clean blue hairline borders.",
  },
  {
    id: "system",
    label: "System",
    description: "Seamlessly adapts to your operating system's active appearance mode.",
  },
];

export interface DensityOption {
  id: DashboardDensity;
  label: string;
  badge: string;
  description: string;
}

export const DASHBOARD_DENSITIES: DensityOption[] = [
  {
    id: "minimal",
    label: "Minimal",
    badge: "Spacious",
    description: "Roomy card margins and simplified view focusing solely on high-impact signals.",
  },
  {
    id: "balanced",
    label: "Balanced",
    badge: "Recommended",
    description: "The ideal equilibrium between information density and visual breathing room.",
  },
  {
    id: "detailed",
    label: "Detailed",
    badge: "High Density",
    description: "Tightened metrics grids and data-dense tables designed for analytical deep-dives.",
  },
];
