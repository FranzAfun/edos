import React from "react";
import Card from "../../components/ui/Card";

/**
 * ModuleBoundary
 * Enforces the standard module UI states:
 * - loading
 * - empty
 * - error
 * - success (renders children)
 *
 * Props:
 * - query: result from useModuleQuery()
 * - title: string (optional)
 * - loadingText: string (optional)
 * - emptyText: string (optional)
 * - errorText: string (optional)
 * - children: ReactNode
 */
export default function ModuleBoundary({
  query,
  title,
  loadingText = "Loading…",
  emptyText = "Nothing to show yet.",
  errorText = "Something went wrong.",
  children,
}) {
  if (!query) {
    return (
      <Card>
        <Header title={title} />
        <p className="text-sm opacity-80">ModuleBoundary: missing query prop.</p>
      </Card>
    );
  }

  if (query.isLoading) {
    return (
      <Card>
        <Header title={title} />
        <p className="text-sm opacity-80">{loadingText}</p>
      </Card>
    );
  }

  if (query.isError) {
    const detail =
      typeof query.error === "string"
        ? query.error
        : query.error?.message || "";

    return (
      <Card>
        <Header title={title} />
        <p className="text-sm">{errorText}</p>
        {detail ? (
          <p className="text-xs opacity-70 mt-2 whitespace-pre-wrap">{detail}</p>
        ) : null}
        <div className="mt-4">
          <button
            type="button"
            onClick={query.reload}
            className="px-3 py-2 rounded-md border text-sm"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  if (query.isEmpty) {
    return (
      <Card>
        <Header title={title} />
        <p className="text-sm opacity-80">{emptyText}</p>
      </Card>
    );
  }

  return <>{children}</>;
}

function Header({ title }) {
  if (!title) return null;
  return <h2 className="text-base font-semibold mb-3">{title}</h2>;
}
