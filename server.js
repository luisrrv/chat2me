require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

const { sendToLine } = require('./lib/line');

// Serve static files from the /public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// In-memory visitor connections
const clients = new Map(); // visitorId => WebSocket

// Setup WebSocket server
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, request, visitorId) => {
    clients.set(visitorId, ws);
    console.log(`✅ Connected: ${visitorId}`);

    ws.on('message', async (msg) => {
        const messageText = msg.toString();
        console.log(`📩 Message from ${visitorId}: ${messageText}`);

        await sendToLine(visitorId, messageText);
    });

    ws.on('close', () => {
        clients.delete(visitorId);
        console.log(`❌ Disconnected: ${visitorId}`);
    });
});

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const visitorId = url.searchParams.get('visitorId');

    if (!visitorId) {
        socket.destroy();
        return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, visitorId);
    });
});

// Start HTTP server
server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});

// Webhook endpoint for LINE messages
app.post('/webhook', async (req, res) => {
    const events = req.body.events;

    if (!Array.isArray(events)) {
        return res.sendStatus(400);
    }

    for (const event of events) {
        // Only handle text messages
        if (event.type === 'message' && event.message.type === 'text') {
            const replyText = event.message.text.trim();

            // Extract visitor ID from message (e.g., @visitor-1234 ...)
            const match = replyText.match(/^@visitor-([a-z0-9]+)\s+(.*)/i);
            if (match) {
                const visitorId = `visitor-${match[1]}`;
                const messageToSend = match[2];

                const visitorSocket = clients.get(visitorId);
                if (visitorSocket && visitorSocket.readyState === 1) {
                    visitorSocket.send(`Luis: @${visitorId} ${messageToSend}`);
                    console.log(`🔁 Replied to ${visitorId}: ${messageToSend}`);
                } else {
                    console.warn(`⚠️ Visitor ${visitorId} not connected.`);
                }
            }
        }
    }

    res.sendStatus(200);
});