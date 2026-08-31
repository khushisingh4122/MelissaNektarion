const DEFAULT_BASE_URL = "";

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
    return fetch(url, init);
  }
};

