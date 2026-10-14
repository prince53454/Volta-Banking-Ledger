const BASE_URL = "/api";

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    ...options,
  };

  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const contentType = response.headers.get("content-type") || "";
  const responseBody = await response.text();
  let data;

  if (responseBody && contentType.includes("json")) {
    try {
      data = JSON.parse(responseBody);
    } catch {
      throw new Error("The API returned invalid JSON. Please try again later.");
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `The API request failed (${response.status}). Check Vercel routing and environment variables.`
    );
  }

  if (!contentType.includes("json")) {
    throw new Error("The API returned a non-JSON response. Check Vercel API routing.");
  }

  return data;
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) =>
    request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
