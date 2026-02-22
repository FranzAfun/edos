import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * useModuleQuery
 * Standardizes module data fetching using normalized service responses:
 *   { success, data, error }
 *
 * Returns a stable contract:
 *  - status: "idle" | "loading" | "success" | "empty" | "error"
 *  - data
 *  - error
 *  - reload()
 */
export default function useModuleQuery(serviceFn, options = {}) {
  const {
    params = undefined,
    enabled = true,
    initialData = null,
    isEmpty = defaultIsEmpty,
  } = options;

  const [status, setStatus] = useState(enabled ? "loading" : "idle");
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);

  const run = useCallback(async () => {
    if (!enabled || typeof serviceFn !== "function") return;

    setStatus("loading");
    setError(null);

    try {
      const res = await serviceFn(params);

      if (!mountedRef.current) return;

      if (!res || res.success !== true) {
        setStatus("error");
        setError(res?.error ?? res ?? new Error("Request failed"));
        return;
      }

      const nextData = res.data ?? null;
      setData(nextData);

      if (isEmpty(nextData)) {
        setStatus("empty");
      } else {
        setStatus("success");
      }
    } catch (e) {
      if (!mountedRef.current) return;
      setStatus("error");
      setError(e);
    }
  }, [enabled, serviceFn, params, isEmpty]);

  // Initial + param changes
  useEffect(() => {
    mountedRef.current = true;
    if (enabled) run();
    return () => {
      mountedRef.current = false;
    };
  }, [enabled, run]);

  const api = useMemo(
    () => ({
      status,
      data,
      error,
      reload: run,
      isLoading: status === "loading",
      isEmpty: status === "empty",
      isError: status === "error",
      isSuccess: status === "success",
    }),
    [status, data, error, run]
  );

  return api;
}

function defaultIsEmpty(value) {
  if (value == null) return true;

  // Array
  if (Array.isArray(value)) return value.length === 0;

  // Object
  if (typeof value === "object") return Object.keys(value).length === 0;

  // Primitive: treat empty string as empty
  if (typeof value === "string") return value.trim().length === 0;

  return false;
}
