import React from "react";

/**
 * Switches the --ks-* token scope for everything inside it.
 *
 * This is how a dark product panel sits on a light section: the section opts
 * into `.kora-light`, then the panel is wrapped here in `.kora-dark`, and every
 * tokenised component underneath resolves to dark values again. One panel
 * implementation, either ground — rather than a light and a dark copy of each.
 *
 * It deliberately paints no background. A panel already paints its own surface,
 * and a section ground belongs to Scene; a wrapper doing either as well is how
 * you end up with a rectangle you cannot see but keep colliding with.
 */
export function Surface({
  theme,
  className = "",
  children,
}: {
  theme: "dark" | "light";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`kora-${theme} ${className}`}>{children}</div>
  );
}

export default Surface;
