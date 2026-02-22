/**
 * createModuleService
 *
 * Wraps an async function and guarantees normalized output:
 *   { success: boolean, data: any, error: any }
 *
 * Ensures no service ever returns raw axios/fetch responses.
 */
export default function createModuleService(asyncFn) {
  return async function (...args) {
    try {
      const result = await asyncFn(...args);

      // If already normalized, return as-is
      if (
        result &&
        typeof result === "object" &&
        "success" in result &&
        "data" in result
      ) {
        return result;
      }

      // Otherwise assume raw data
      return {
        success: true,
        data: result ?? null,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error?.message || error || "Service error",
      };
    }
  };
}
