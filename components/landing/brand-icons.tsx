/**
 * Brand marks rendered as inline SVG from simple-icons' official path data.
 *
 * Why not lucide: lucide-react@1.17 removed all brand icons. Why not the PNGs
 * in public/integrations/: they're ~50px sources, already soft at 2x and
 * unusable scaled up.
 *
 * Colour comes from `currentColor` and size from the className, so these sit
 * on the dark glass panels as consistent monochrome silhouettes.
 */

export type BrandMark = { title: string; path: string };

export function BrandIcon({
  icon,
  className = "",
}: {
  icon: BrandMark;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d={icon.path} />
    </svg>
  );
}

/**
 * LinkedIn isn't in simple-icons (removed at LinkedIn's request), and the
 * project's PNG is a blue badge — whitening it to match the other marks
 * flattened it into a featureless blob. So it's drawn here as the bare "in"
 * letterform, which is how monochrome icon sets render it and keeps the row
 * visually consistent.
 */
export function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <circle cx="4.2" cy="4.2" r="2.4" />
      <rect x="2" y="8.6" width="4.4" height="13.4" rx="0.4" />
      <path d="M9.6 8.6h4.2v1.9a4.7 4.7 0 0 1 4.1-2.1c3.2 0 5.1 2 5.1 5.7V22h-4.4v-7.2c0-1.9-.7-3-2.4-3-1.5 0-2.3 1-2.3 3V22H9.6Z" />
    </svg>
  );
}
