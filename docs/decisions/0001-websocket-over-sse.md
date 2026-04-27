# ADR-0001: WebSocket over SSE / long-polling

**Status:** Accepted · 2025-06

## Context

Visitor must both *send* messages to the server (forward to LINE) and *receive* messages from the server (replies pushed from LINE webhook). Three transport options:

1. **WebSocket** — one full-duplex connection, both directions over the same socket.
2. **SSE + POST** — Server-Sent Events for server→client, separate `fetch` POST for client→server.
3. **Long-polling** — repeated GET requests waiting on server.

## Decision

WebSocket via the `ws` library on Node.

## Why

- Bi-directional naturally; one connection, one auth boundary, one state map keyed by `visitorId`.
- SSE would require maintaining two parallel state surfaces (an EventSource and a POST-handler correlation), splitting the routing logic.
- Long-polling adds latency on the reply path and is less efficient under any load.
- `ws` is small (~50KB), has no protocol-fallback machinery, and doesn't require a client SDK — a few lines of native browser `WebSocket` API are enough.

## Tradeoffs accepted

- More state to manage on the server (connection lifecycle, reconnection).
- Some corporate proxies and older middleboxes are hostile to WS upgrades.
- Reconnection logic must live on the client (no built-in helpers like `socket.io` provides).

## Revisit when

- The use case stops requiring client→server messages (e.g., read-only notifications). SSE would then be simpler.
- Proxies become a real-world support issue.