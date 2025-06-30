const axios = require('axios');

async function sendToLine(visitorId, messageText) {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const userId = process.env.LINE_USER_ID;

    const fullMessage = `@${visitorId}: ${messageText}`;

    try {
        await axios.post('https://api.line.me/v2/bot/message/push', {
            to: userId,
            messages: [
                {
                    type: 'text',
                    text: fullMessage,
                },
            ],
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log(`✅ Sent to LINE: ${fullMessage}`);
    } catch (err) {
        console.error('❌ Error sending to LINE:', err.response?.data || err.message);
    }
}

module.exports = { sendToLine };