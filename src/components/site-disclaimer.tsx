/** Sitewide educational / medical disclaimer — shown on every page. */
export function SiteDisclaimer() {
  return (
    <aside
      className="site-disclaimer fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-[var(--header-bg)]/95 px-3 py-2 text-center text-[10px] leading-snug text-muted backdrop-blur-sm sm:text-[11px] sm:leading-relaxed"
      role="note"
      aria-label="Medical disclaimer"
    >
      <p className="mx-auto max-w-3xl">
        Mitochondriapp is for educational lifestyle tracking only — not medical
        advice, diagnosis, or treatment. Protocols, scores, and Mitoversity
        content are informational. Consult a qualified healthcare professional
        before changing your health routine or stopping prescribed care.
      </p>
    </aside>
  );
}
