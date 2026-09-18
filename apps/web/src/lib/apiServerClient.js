const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

function joinUrl(base, path) {
  if (!base) return path;
  if (!path) return base;
  return `${String(base).replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;
}

export const apiServerClient = {
  fetch(path, init) {
    const baseUrl =
      (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
      DEFAULT_BASE_URL;
    const url = joinUrl(baseUrl, path);
    const token =
      localStorage.getItem("agri_access_token") ||
      sessionStorage.getItem("agri_access_token");
    const headers = new Headers(init?.headers || {});

    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(url, { ...init, headers });
  }
};

