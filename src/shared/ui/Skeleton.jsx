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
      className={`animate-pulse bg-gray-200 ${rounded ? "rounded-full" : "rounded"} ${className}`}
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
          className={`animate-pulse bg-gray-200 rounded h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-white rounded-md shadow-sm p-6 ${className}`} role="status" aria-label="Loading card">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = "" }) {
  return (
    <div className={`bg-white rounded-md shadow-sm overflow-hidden ${className}`} role="status" aria-label="Loading table">
      <div className="animate-pulse">
        <div className="flex gap-4 p-4 border-b bg-gray-50">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 p-4 border-b last:border-0">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 bg-gray-200 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
