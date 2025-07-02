const visitorId = 'visitor-' + Math.random().toString(36).slice(2, 6);
let socket;

const statusEl = document.getElementById('status');
const chatLogEl = document.getElementById('chatLog');
const msgInputEl = document.getElementById('msgInput');

function appendMessage(text, senderId, isSelf = false) {
    const li = document.createElement('li');
    li.className = isSelf
        ? "self-end max-w-[80%] ml-auto flex flex-col items-end"
        : "max-w-[80%] flex flex-col items-start";

    const bubble = document.createElement('div');
    bubble.textContent = text;
    bubble.className = isSelf
        ? "bubble bubble-self text-white px-4 py-2 rounded-xl shadow-md"
        : "bubble bubble-luis text-white px-4 py-2 rounded-xl shadow-sm border border-white/10";

    li.appendChild(bubble);

    const labelWrapper = document.createElement('div');
    labelWrapper.className = 'label-wrapper';

    if (!isSelf) {
        const icon = document.createElement('div');
        icon.className = 'luis-icon';
        labelWrapper.appendChild(icon);
    }

    const label = document.createElement('div');
    label.textContent = isSelf ? `You (${senderId})` : senderId;
    label.className = "label text-xs text-gray-400 select-none";
    labelWrapper.appendChild(label);

    li.appendChild(labelWrapper);

    chatLogEl.appendChild(li);
    chatLogEl.scrollTop = chatLogEl.scrollHeight;
}

function connectWithRetry(retries = 5, delay = 3000) {
    socket = new WebSocket(`wss://chat2me-backend.onrender.com?visitorId=${visitorId}`);
    statusEl.textContent = "Connecting to server...";

    socket.onopen = () => {
        statusEl.textContent = "Connected to server";
    };

    socket.onmessage = (event) => {
        const data = event.data;
        const splitIndex = data.indexOf(':');
        if (splitIndex !== -1) {
            const senderId = data.slice(0, splitIndex).trim();
            const messageText = data.slice(splitIndex + 1).trim();
            const isSelf = senderId === visitorId;
            appendMessage(messageText, senderId, isSelf);
        } else {
            appendMessage(data, 'Unknown', false);
        }
    };

    socket.onerror = () => {
        if (retries > 0) {
            statusEl.textContent = `Connection error. Retrying in ${delay / 1000}s...`;
            setTimeout(() => connectWithRetry(retries - 1, delay * 2), delay);
        } else {
            statusEl.textContent = "Server unavailable. Please try again later.";
        }
    };

    socket.onclose = () => {
        console.log("WebSocket closed.");
        statusEl.textContent = "Connection lost. Refresh the page to reconnect.";
    };
}

connectWithRetry();

function sendMessage() {
    const msg = msgInputEl.value.trim();
    if (msg && socket.readyState === WebSocket.OPEN) {
        socket.send(msg);
        appendMessage(msg, visitorId, true);
        msgInputEl.value = '';
    }
}
