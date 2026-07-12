/** Lightweight skeleton shown while a tab's RSC payload loads. */
export function TabLoading() {
  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <div className="h-14 border-b border-border sm:h-16" />
      <main className="mx-auto max-w-2xl animate-pulse space-y-4 px-4 py-6 sm:px-6">
        <div className="h-3 w-24 rounded-full bg-foreground/10" />
        <div className="h-8 w-48 rounded-2xl bg-foreground/10" />
        <div className="h-16 rounded-2xl bg-foreground/8" />
        <div className="h-14 rounded-2xl bg-foreground/8" />
        <div className="h-14 rounded-2xl bg-foreground/8" />
        <div className="h-14 rounded-2xl bg-foreground/8" />
      </main>
    </div>
  );
}
