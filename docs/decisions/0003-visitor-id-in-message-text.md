# ADR-0003: Embed visitor ID in LINE message text

**Status:** Accepted · 2025-06

## Context

When I reply to a forwarded message from LINE, the server receives the reply via webhook with no inherent reference to which visitor it's for. LINE webhooks are stateless from the server's perspective: just a text event from my user ID. The server needs a routing key.

Options:

1. **Embed `@visitor-xxxx` in the message body** and parse it on reply.
2. **Server-side correlation** — track "the most recent forwarded message" or "currently active conversation" and route replies to that visitor.
3. **One LINE chat per visitor** via the LINE Messaging API's group/room features (not directly supported for 1:1 OA bots).

## Decision

Embed the `@visitor-xxxx` prefix in both the forwarded-to-LINE message and the required reply format.

## Why

- **Explicit beats implicit.** When debugging, the routing key is visible in the LINE thread itself. No "why did that reply go to the wrong visitor" mysteries.
- **Stateless on the server.** No "active conversation" tracking, no last-message heuristic, no race conditions when two visitors message simultaneously.
- **Trivially debuggable.** Webhook payload + server logs tell the full story without needing application state to interpret them.

Option 2 was tempting (cleaner UX) but failure modes are subtle: which visitor is "active" if I haven't replied in 5 minutes? What if I reply to an older message in the LINE thread? What if visitors A and B message within seconds of each other?

## Tradeoffs accepted

- **UX cost on my side:** I have to type `@visitor-xxxx` as a prefix when replying.
- **Fragile to typos:** if I drop the prefix, the message either errors or routes incorrectly (currently the latter — see Limitations in main README).
- **Visible to the visitor:** the prefix shows up in their incoming message. The frontend strips it before display, but it's still in the wire format.

## Revisit when

The replies become high-frequency enough that typing the prefix is a real pain point. The ergonomic upgrade would be a small LIFF tool or LINE OA rich menu that lets me tap a visitor in a list and pre-fills the prefix on the keyboard side.