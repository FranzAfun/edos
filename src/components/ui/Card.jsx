export default function Card({
  children,
  className = ""
}) {
  return (
    <div
      className={`card rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-[var(--color-text-primary)] shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
