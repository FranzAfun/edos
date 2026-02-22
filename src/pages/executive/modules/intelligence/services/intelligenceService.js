import { httpGet } from "../../../../../services/httpClient";

export async function fetchIntelligenceOverview() {
  return httpGet("/executive/intelligence");
}
