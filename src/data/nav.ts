export type NavItem = {
  /** Silkscreen-style reference designator shown before the label. */
  ref: string;
  label: string;
  href: string;
};

/** Absolute hrefs so the header works from every route. */
export const homeNav: NavItem = { ref: "00", label: "Home", href: "/" };

export const primaryNav: NavItem[] = [
  { ref: "U1", label: "Signal path", href: "/#signal-path" },
  { ref: "J1", label: "Hardware", href: "/#hardware" },
  { ref: "X1", label: "Engineers", href: "/#engineers" },
  { ref: "RF", label: "Retrofit", href: "/retrofit" },
  { ref: "TP", label: "Contact", href: "/#contact" },
];
