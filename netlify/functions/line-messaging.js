// Netlify Function: LINE Messaging API Proxy
// Path: netlify/functions/line-messaging.js
// Proxies push messages to LINE Messaging API

const https = require('https');

exports.handler = async function (event, context) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS, POST'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const payload = JSON.parse(event.body);
        const { message, channelToken, targetId } = payload;

        if (!message || !channelToken || !targetId) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Missing message, channelToken, or targetId' })
            };
        }

        const responseData = await sendLinePushMessage(message, channelToken, targetId);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(responseData)
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message })
        };
    }
};

function sendLinePushMessage(message, token, targetId) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            "to": targetId,
            "messages": [
                {
                    "type": "text",
                    "text": message
                }
            ]
        });

        const options = {
            hostname: 'api.line.me',
            port: 443,
            path: '/v2/bot/message/push',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    // LINE API returns an empty JSON object {} on success (200 OK)
                    // If it's empty and 200, it's successful.
                    if (res.statusCode === 200 && !body) {
                        resolve({ success: true, message: "Push message sent successfully" });
                    } else if (body) {
                        resolve(JSON.parse(body));
                    } else {
                        resolve({ status: res.statusCode, message: body });
                    }
                } catch (e) {
                    resolve({ status: res.statusCode, message: body });
                }
            });
        });

        req.on('error', reject);

        // Handle timeout
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.write(postData);
        req.end();
    });
}
