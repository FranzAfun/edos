/**
 * DataTable - Paginated, sortable, filterable table (F37)
 * Fully accessible with keyboard navigation.
 *
 * Props:
 * - columns: [{ key, label, sortable?, render? }]
 * - data: array of objects
 * - pageSize?: number (default 10)
 * - searchable?: boolean
 * - searchKeys?: string[] (keys to search in)
 * - emptyText?: string
 */
import { useState, useMemo, useCallback } from "react";

export default function DataTable({
  columns = [],
  data = [],
  pageSize = 10,
  searchable = true,
  searchKeys,
  emptyText = "No data available.",
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(0);

  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
      setPage(0);
    },
    [sortKey]
  );

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    const keys = searchKeys || columns.map((c) => c.key);
    return data.filter((row) =>
      keys.some((k) => {
        const val = row[k];
        return val != null && String(val).toLowerCase().includes(term);
      })
    );
  }, [data, search, searchKeys, columns]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pagedData = sortedData.slice(safePage * pageSize, (safePage + 1) * pageSize);

  return (
    <div>
      {searchable && (
        <div className="mb-4">
          <input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            aria-label="Search table"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="min-w-full text-sm" role="grid">
          <thead>
            <tr className="bg-gray-50 border-b">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 ${col.sortable !== false ? "cursor-pointer select-none hover:text-gray-800" : ""}`}
                  onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                  aria-sort={sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <span aria-hidden="true">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              pagedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-between mt-4" aria-label="Table pagination">
          <p className="text-xs text-gray-500">
            Showing {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sortedData.length)} of {sortedData.length}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
              aria-label="Previous page"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(0, Math.min(safePage - 2, totalPages - 5));
              const p = start + i;
              if (p >= totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 text-xs rounded border ${p === safePage ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]" : "border-gray-300 hover:bg-gray-50"}`}
                  aria-label={`Page ${p + 1}`}
                  aria-current={p === safePage ? "page" : undefined}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
