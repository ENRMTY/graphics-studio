const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json = await res
    .json()
    .catch(() => ({ message: "Invalid JSON response" }));

  if (!res.ok) {
    throw new ApiError(res.status, json.message ?? `HTTP ${res.status}`);
  }

  return json;
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),

  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: "POST", body: form }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),

  patchForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: "PATCH", body: form }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
