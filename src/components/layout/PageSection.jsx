export default function PageSection({
  title,
  subtitle,
  children
}) {
  return (
    <div className="mb-10">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] font-[var(--font-heading)]">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm font-medium text-[var(--color-text-muted)]">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div>
        {children}
      </div>
    </div>
  );
}
