export const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE = `${API_ORIGIN}/api`;
const AUTH_PATHS = new Set(['/auth/login', '/auth/refresh', '/auth/logout']);

class ApiClient {
  constructor() {
    this.accessToken = null;
    this.onUnauthorized = null;
    this._refreshing = null;
  }

  setAccessToken(token) {
    this.accessToken = token;
  }

  async request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (res.status === 401 && !AUTH_PATHS.has(path)) {
      const refreshed = await this.refresh();
      if (refreshed) {
        headers.Authorization = `Bearer ${this.accessToken}`;
        const retry = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' });
        if (!retry.ok) throw await this.parseError(retry);
        return retry.status === 204 ? null : retry.json();
      }
      this.accessToken = null;
      this.onUnauthorized?.();
    }

    if (!res.ok) throw await this.parseError(res);
    return res.status === 204 ? null : res.json();
  }

  async parseError(res) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || 'Request failed');
    err.status = res.status;
    err.code = body.code;
    return err;
  }

  async refresh() {
    if (this._refreshing) return this._refreshing;
    this._refreshing = this._doRefresh().finally(() => {
      this._refreshing = null;
    });
    return this._refreshing;
  }

  async _doRefresh() {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        this.accessToken = null;
        return false;
      }
      const data = await res.json();
      this.accessToken = data.accessToken;
      return true;
    } catch {
      this.accessToken = null;
      return false;
    }
  }

  get(path) {
    return this.request(path);
  }

  post(path, body) {
    return this.request(path, { method: 'POST', body: JSON.stringify(body) });
  }

  put(path, body) {
    return this.request(path, { method: 'PUT', body: JSON.stringify(body) });
  }

  patch(path, body) {
    return this.request(path, { method: 'PATCH', body: JSON.stringify(body) });
  }

  delete(path) {
    return this.request(path, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
