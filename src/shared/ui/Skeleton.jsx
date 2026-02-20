/**
 * Skeleton - Shimmer loading placeholder (F34)
 * Replaces all "Loading..." text with accessible shimmer animations.
 */
export default function Skeleton({ className = "", width, height, rounded = false }) {
  const style = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-pulse bg-[var(--color-surface-hover)] ${rounded ? "rounded-full" : "rounded"} ${className}`}
      style={style}
    />
  );
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 animate-pulse rounded bg-[var(--color-surface-hover)] ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm ${className}`} role="status" aria-label="Loading card">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-1/3 rounded bg-[var(--color-surface-hover)]" />
        <div className="h-8 w-1/2 rounded bg-[var(--color-surface-hover)]" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-[var(--color-surface-hover)]" />
          <div className="h-3 w-5/6 rounded bg-[var(--color-surface-hover)]" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm ${className}`} role="status" aria-label="Loading table">
      <div className="animate-pulse">
        <div className="flex gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)] p-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 flex-1 rounded bg-[var(--color-surface-hover)]" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 border-b border-[var(--color-border)] p-4 last:border-0">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 flex-1 rounded bg-[var(--color-surface-hover)]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
