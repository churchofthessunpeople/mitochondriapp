/** Sitewide educational / medical disclaimer — shown on every page. */
export function SiteDisclaimer() {
  return (
    <aside
      className="site-disclaimer fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-[var(--header-bg)]/95 px-3 py-2 text-center text-[10px] leading-snug text-muted backdrop-blur-sm sm:text-[11px] sm:leading-relaxed"
      role="note"
      aria-label="Medical disclaimer"
    >
      <p className="mx-auto max-w-3xl">
        This app is for educational purposes only. This is not medical
        advice. Mitochondriapp presents Dr. Jack Kruse&apos;s theories. It does not test or
        endorse them. Don&apos;t trust, verify: read the sources and do your own
        research. In places with poor light, water, or magnetism, the
        activities may not be effective.
        Not affiliated with or endorsed by Dr. Jack Kruse.
      </p>
    </aside>
  );
}
