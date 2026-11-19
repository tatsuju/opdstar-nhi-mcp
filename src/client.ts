/**
 * HTTP client for opdstar.com MCP proxy endpoints.
 *
 * Every request:
 *   - routes through OPDSTAR_API_BASE (default https://www.opdstar.com/api/mcp)
 *   - sends User-Agent `@opdstar/nhi-mcp/<version>` for usage visibility
 *   - returns the parsed JSON body (proxy normalizes errors into JSON)
 *
 * Override endpoint via env `OPDSTAR_API_BASE` (useful for staging / dev).
 */

import { VERSION, USER_AGENT } from './version.js';

// The bare domain answers with a redirect; pointing at www saves that hop on every call.
export const DEFAULT_API_BASE = 'https://www.opdstar.com/api/mcp';

export interface ClientOptions {
  apiBase?: string;
  timeoutMs?: number;
}

export class OpdstarClient {
  private apiBase: string;
  private timeoutMs: number;

  constructor(opts: ClientOptions = {}) {
    this.apiBase = (opts.apiBase ?? process.env.OPDSTAR_API_BASE ?? DEFAULT_API_BASE).replace(/\/+$/, '');
    this.timeoutMs = opts.timeoutMs ?? 15_000;
  }

  async get(path: string, params: Record<string, string | number | undefined> = {}): Promise<unknown> {
    const url = new URL(this.apiBase + path);
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === '') continue;
      url.searchParams.set(k, String(v));
    }
    return this.fetchJson(url.toString(), { method: 'GET' });
  }

  async post(path: string, body: unknown): Promise<unknown> {
    return this.fetchJson(this.apiBase + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  private async fetchJson(url: string, init: RequestInit): Promise<unknown> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      let res: Response;
      try {
        res = await fetch(url, {
          ...init,
          headers: {
            ...(init.headers ?? {}),
            'User-Agent': USER_AGENT,
            'Accept': 'application/json',
          },
          signal: ctrl.signal,
        });
      } catch {
        // Transport errors carry the upstream URL in their text; keep it out.
        throw new Error(
          ctrl.signal.aborted
            ? 'OPDSTAR API error: request timed out'
            : 'OPDSTAR API error: service unreachable'
        );
      }

      const text = await res.text();
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        // The upstream URL and body are not the caller's business: a platform
        // error page would otherwise be echoed back verbatim.
        throw new Error(`OPDSTAR API error: HTTP ${res.status}`);
      }

      if (!res.ok) {
        // Only 4xx text is the endpoint's own validation wording. A 5xx body can
        // come from anywhere along the path, so it is reduced to its status.
        const body = data as { error?: string; message?: string } | null;
        const errMsg =
          res.status < 500
            ? (body?.error ?? body?.message ?? `HTTP ${res.status}`)
            : `HTTP ${res.status}`;
        throw new Error(`OPDSTAR API error: ${errMsg}`);
      }

      return data;
    } finally {
      clearTimeout(timer);
    }
  }
}

export { VERSION };
