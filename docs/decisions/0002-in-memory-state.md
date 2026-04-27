# ADR-0002: In-memory connection state, no Redis/DB

**Status:** Accepted · 2025-06

## Context

The server needs to map `visitorId → WebSocket connection` to route LINE replies back to the correct browser session. Options:

1. **In-memory `Map`** in the Node process.
2. **Redis** as a shared pub/sub layer + connection-affinity store.
3. **Database** with polling or change streams.

## Decision

In-memory `Map<visitorId, WebSocket>`. No external state.

## Why

- Messages are transient by design — there is no user-facing requirement for history, replay, or cross-instance delivery.
- Single-process deployment is sufficient for the link's actual audience (private share, low concurrency).
- Avoiding Redis removes a dependency, a deploy step, a failure mode, and a recurring cost.
- A WebSocket is inherently process-bound anyway — even with Redis, the actual socket lives in one process. Redis would become a routing layer, not a persistence layer.

## Tradeoffs accepted

- **No horizontal scaling.** A second instance cannot route a reply to a visitor connected to the first instance.
- **Restart drops conversations.** Clients receive `close` and must reconnect; in-flight messages are lost.
- **No history.** Visitors cannot scroll back across sessions.

## Revisit when

Concurrent visitors approach the single-process limit, *or* the product calls for chat history. The migration path is:

1. Add Redis pub/sub: each instance publishes to a `replies:{visitorId}` channel; each instance subscribes to channels for its connected visitors.
2. Add sticky sessions at the load balancer (visitor ID hashed to instance) to keep the WS pinned.
3. Optionally add a TTL'd Redis list for the last N messages per visitor for reconnection resume.