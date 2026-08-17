export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white py-6 dark:bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-sm text-text-secondary dark:text-[var(--color-text-secondary)] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p className="font-semibold text-[var(--color-text-primary)]">FocusForge AI Study Coach</p>
        <p>Built for focused study sessions and measurable progress.</p>
      </div>
    </footer>
  );
}
