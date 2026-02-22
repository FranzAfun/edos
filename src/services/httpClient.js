function normalizeResponse(success, data = null, error = null) {
  return {
    success,
    data,
    error
  };
}

export async function httpGet(url) {
  try {
    void url;
    // Mock data for now
    return normalizeResponse(true, []);
  } catch (err) {
    void err;
    return normalizeResponse(false, null, "Request failed");
  }
}

export async function httpPost(url, payload) {
  try {
    void url;
    return normalizeResponse(true, payload);
  } catch (err) {
    void err;
    return normalizeResponse(false, null, "Request failed");
  }
}
