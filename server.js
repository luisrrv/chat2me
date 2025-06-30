require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// WebSocket server setup
const wss = new WebSocket.Server({ noServer: true });

let clients = new Map(); // visitorId => ws connection

wss.on('connection', (ws, request, visitorId) => {
    clients.set(visitorId, ws);
    console.log(`Visitor connected: ${visitorId}`);

    ws.on('close', () => {
        clients.delete(visitorId);
        console.log(`Visitor disconnected: ${visitorId}`);
    });
});

// Upgrade HTTP server to handle WebSocket connections
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('upgrade', (request, socket, head) => {
    // Extract visitorId from query string
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

// Add your webhook endpoints and other API routes here