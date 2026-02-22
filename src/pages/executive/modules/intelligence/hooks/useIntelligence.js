import { useEffect, useState } from "react";
import { fetchIntelligenceOverview } from "../services/intelligenceService";

export function useIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetchIntelligenceOverview();

      if (response.success) {
        setData(response.data);
      } else {
        setData(null);
      }

      setLoading(false);
    }

    load();
  }, []);

  return { data, loading };
}
