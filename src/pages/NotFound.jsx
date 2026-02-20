import useDocumentTitle from "../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Page Not Found");

  return (
    <div className="flex min-h-[60vh] items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">404 - Resource Not Found</h1>
        <p className="mt-2 text-sm font-medium text-[var(--color-text-muted)]">
          The page you requested does not exist.
        </p>
      </div>
    </div>
  );
}

