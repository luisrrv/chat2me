# Chat2Me

# 💬 Public Web Chat → LINE Messaging API with Real-Time Replies

## 📌 Project Overview

This project enables a **public-facing web chat** where anonymous visitors can send me messages. These messages are:

- 🔁 Forwarded to my **LINE account** using the LINE Messaging API
- 🚨 Trigger a LINE Notify alert so I never miss a message
- 💬 When I reply from LINE, my reply is routed back in **real-time** to the correct visitor via WebSocket

All this happens while keeping my LINE private, maintaining user anonymity, and preventing spam.

---

## ✅ Features

- Public chat widget for anonymous visitors (no LINE login required)
- Messages are pushed to my personal LINE via Messaging API
- Replies from my LINE app are pushed back to the visitor’s browser
- LINE Notify alerts me of new messages instantly
- Real-time WebSocket communication (no polling)
- Minimal in-memory message storage: only the **last 10 messages per visitor**
- Modern lightweight frontend UI with Tailwind CSS (iOS/macOS look)
- Fully private and unidirectional LINE connection (visitors can't see my LINE)

---

## 🔐 Anti-Spam Protections

| Protection               | Description                                 |
| ------------------------ | ------------------------------------------- |
| ⏳ Rate Limiting          | One message per visitor every **5 seconds** |
| 🔯 Message Length Cap    | Messages limited to 300 characters max      |
| 🧜‍♂️ Input Sanitization | Basic sanitization to remove harmful input  |
| ❌ Frontend Cooldown      | UI prevents spamming with visible lockout   |

---

## 🧱 Architecture

```
[ Visitor Browser ] <-- WebSocket -->
[ Node.js Backend ]
        |             ↑
        |             | Webhook
        ↓             |
[ LINE Messaging API ] ← LINE Replies
        |
        ↓
[ My LINE Account ]

[ LINE Notify API ] ← Alerts on new visitor messages
```

---

## 🤩 Components

### 🔸 Frontend

- Lightweight HTML + JS + Tailwind CSS
- WebSocket connection for sending/receiving messages
- Message input box with live cooldown feedback

### 🔸 Backend (Node.js)

- WebSocket server managing active visitor connections
- In-memory store for last 10 messages per visitor
- LINE Messaging API integration (push messages)
- LINE webhook endpoint (handle replies)
- LINE Notify integration for alerting
- Rate limiting and validation logic
- All LINE tokens and secrets are stored in environment variables for privacy (not committed to GitHub)

### 🔸 LINE APIs Used

- **Messaging API** — Sends messages to my LINE account; receives replies via webhook
- **Notify API** — Sends me LINE alerts on message receipt

---

## ↻ Visitor Message Flow

1. **Visitor opens chat** → assigned a random `visitor-xxxx` ID in browser
2. **Visitor sends message** → tagged and pushed to my LINE account:
   ```
   @visitor-5ec1: Hello Luis!
   ```
3. **I reply on LINE**, starting with the same visitor ID:
   ```
   @visitor-5ec1 Thanks for your message!
   ```
4. **LINE webhook** receives reply → backend extracts visitor ID → sends it over WebSocket to the correct browser session

---

## 🛡️ Privacy and Safety

- Visitors are anonymous, identified only by random visitor IDs
- Messages are never stored permanently (in-memory buffer only)
- Replies are only routed to intended recipients using visitor ID tagging
- No LINE accounts are exposed publicly
- All LINE credentials are kept in private `.env` files and never committed to version control

---

## 🛠️ Setup Instructions (Coming Soon)

This section will include:

- Instructions to run the WebSocket + webhook backend
- LINE channel setup (Messaging API + Notify)
- Environment variable configuration
- Deployment and security tips

---

## 📦 TODO

-
