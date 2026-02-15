// Netlify Function: DLTV CORS Proxy
// Path: netlify/functions/dltv-proxy.js
// This function acts as a proxy to fetch DLTV content and bypass CORS restrictions

const https = require('https');
const http = require('http');

exports.handler = async function (event, context) {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Get the target URL from query parameter
    const targetUrl = event.queryStringParameters?.url;

    if (!targetUrl) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing url parameter' })
        };
    }

    // Validate that the URL is from DLTV domain (security measure)
    const allowedDomains = [
        'dltv.ac.th',
        'www.dltv.ac.th',
        'cdn.dltv.ac.th',
        'video.dltv.ac.th',
        'stream.dltv.ac.th'
    ];

    try {
        const url = new URL(targetUrl);
        const hostname = url.hostname.toLowerCase();

        const isAllowed = allowedDomains.some(domain =>
            hostname === domain || hostname.endsWith('.' + domain)
        );

        if (!isAllowed) {
            return {
                statusCode: 403,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: 'Domain not allowed',
                    message: 'Only DLTV domains are permitted'
                })
            };
        }

        // Fetch the content from DLTV
        const response = await fetchUrl(targetUrl);

        return {
            statusCode: response.statusCode,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': response.contentType || 'application/octet-stream',
                'Cache-Control': 'public, max-age=3600'
            },
            body: response.body,
            isBase64Encoded: response.isBase64
        };

    } catch (error) {
        console.error('Proxy error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: 'Proxy fetch failed',
                message: error.message
            })
        };
    }
};

function fetchUrl(targetUrl) {
    return new Promise((resolve, reject) => {
        const url = new URL(targetUrl);
        const protocol = url.protocol === 'https:' ? https : http;

        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*',
                'Referer': 'https://www.dltv.ac.th/'
            }
        };

        const req = protocol.request(options, (res) => {
            const chunks = [];

            res.on('data', (chunk) => chunks.push(chunk));

            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const contentType = res.headers['content-type'] || 'application/octet-stream';

                // Check if content should be base64 encoded (binary content)
                const isBinary = !contentType.includes('text') &&
                    !contentType.includes('json') &&
                    !contentType.includes('xml') &&
                    !contentType.includes('javascript');

                resolve({
                    statusCode: res.statusCode,
                    contentType: contentType,
                    body: isBinary ? buffer.toString('base64') : buffer.toString('utf-8'),
                    isBase64: isBinary
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}
