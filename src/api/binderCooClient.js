/**
 * BinderCooClient — thin WebSocket adapter for the Binder COO chat gateway.
 *
 * Spec: Binder-Web-integration.pdf (v2.0). See backend endpoint
 * /api/auth/me/coo-chat-config/ for the source of `gatewayUrl`, `authToken`,
 * `userId` and `tenantId`. Never hard-code those — always fetch them after the
 * user has logged into Binder so the COO authToken stays a server-side secret.
 *
 * Wire protocol (recap):
 *   1. open WebSocket (no creds in URL)
 *   2. first frame: { type:'req', id:'auth-1', method:'auth',
 *                     params:{ token, user } }
 *   3. server responds with res(ok) + event:proxy.ready
 *   4. client sends chat.send with a unique idempotencyKey
 *   5. server streams event:chat (state=delta cumulative text, then final)
 *
 * sessionKey is derived server-side from users.id — different users get fully
 * isolated histories; the same user gets persistent memory across reloads.
 */

export class BinderCooClient {
  constructor({ gatewayUrl, authToken, userId, autoReconnect = true }) {
    if (!gatewayUrl || !authToken || !userId) {
      throw new Error('BinderCooClient: gatewayUrl, authToken and userId are required');
    }
    this.cfg = { gatewayUrl, authToken, userId, autoReconnect };
    this.handlers = new Map();
    this.state = 'idle';
    this.attempt = 0;
    this.activeRunId = null;
    this.ws = null;
    this._reconnectTimer = null;
  }

  on(event, fn) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event).add(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    this.handlers.get(event)?.delete(fn);
  }

  _emit(event, payload) {
    this.handlers.get(event)?.forEach((fn) => {
      try { fn(payload); } catch (e) { console.error('[BinderCoo] handler error', e); }
    });
  }

  _setState(s) {
    if (this.state === s) return;
    this.state = s;
    this._emit('state', s);
  }

  connect() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
    if (this.ws && this.ws.readyState <= 1) {
      try { this.ws.close(); } catch { /* ignore */ }
    }
    this._setState('connecting');

    let ws;
    try {
      ws = new WebSocket(this.cfg.gatewayUrl);
    } catch (e) {
      this._setState('disconnected');
      this._emit('error', { code: 'invalid-url', message: e?.message || String(e) });
      if (this.cfg.autoReconnect) this._scheduleReconnect();
      return;
    }
    this.ws = ws;

    ws.onopen = () => {
      this._setState('authenticating');
      ws.send(JSON.stringify({
        type: 'req',
        id: 'auth-1',
        method: 'auth',
        params: { token: this.cfg.authToken, user: this.cfg.userId },
      }));
    };

    ws.onmessage = (ev) => {
      let m;
      try { m = JSON.parse(ev.data); } catch { return; }

      if (m.type === 'res' && m.id === 'auth-1') {
        if (!m.ok) {
          this._setState('auth-failed');
          this._emit('error', {
            code: m.error?.code ?? 'unauthorized',
            message: m.error?.message,
          });
          return;
        }
        this._emit('identity', m.payload?.identity);
        return;
      }

      if (m.type === 'event' && m.event === 'proxy.ready') {
        this.attempt = 0;
        this._setState('ready');
        return;
      }

      if (m.type === 'event' && m.event === 'chat') {
        const p = m.payload || {};
        if (p.runId && this.activeRunId && p.runId !== this.activeRunId) return;
        const text = p.message?.content?.[0]?.text ?? '';
        if (p.state === 'delta') {
          this._emit('delta', text);
        } else if (p.state === 'final') {
          this._emit('final', text);
          this.activeRunId = null;
        } else if (p.state === 'aborted' || p.state === 'error') {
          this._emit('error', { code: p.state, message: p.errorMessage });
          this.activeRunId = null;
        }
        return;
      }

      if (m.type === 'event' && m.event === 'agent' && m.payload?.data?.kind === 'tool') {
        this._emit('tool', m.payload.data);
        return;
      }
      // tick / health / anything else: ignore.
    };

    ws.onclose = (ev) => {
      // Terminal close codes — don't retry on credential / shape failures
      if (ev.code === 4001 || ev.code === 4000 || ev.code === 4002) {
        this._setState('auth-failed');
        this._emit('error', { code: ev.reason || 'unauthorized', closeCode: ev.code });
        return;
      }
      this._setState('disconnected');
      if (this.cfg.autoReconnect) this._scheduleReconnect();
    };

    ws.onerror = () => {
      // Browsers fire onerror with no useful info; onclose follows with the real code.
    };
  }

  _scheduleReconnect() {
    const delayMs = Math.min(1000 * Math.pow(2, this.attempt), 30_000);
    this.attempt++;
    this._setState('retrying');
    this._emit('retry', { in: delayMs });
    this._reconnectTimer = setTimeout(() => this.connect(), delayMs);
  }

  send(message) {
    if (this.state !== 'ready') {
      throw new Error(`BinderCooClient: cannot send while state=${this.state}`);
    }
    const idempotencyKey = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.activeRunId = idempotencyKey;
    this.ws.send(JSON.stringify({
      type: 'req',
      id: `r-${Date.now()}`,
      method: 'chat.send',
      params: { message, idempotencyKey },
    }));
    return idempotencyKey;
  }

  abort() {
    if (!this.activeRunId || !this.ws || this.ws.readyState !== 1) return;
    this.ws.send(JSON.stringify({
      type: 'req',
      id: `a-${Date.now()}`,
      method: 'chat.abort',
      params: { runId: this.activeRunId },
    }));
  }

  close() {
    this.cfg.autoReconnect = false;
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
    try { this.ws?.close(); } catch { /* ignore */ }
  }
}

export default BinderCooClient;
