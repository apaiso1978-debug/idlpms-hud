/**
 * DLTV Video Helper
 * ==================
 * Helper module for loading DLTV videos through the Netlify proxy
 * to bypass CORS restrictions without affecting YouTube playback.
 * 
 * Usage:
 *   import { getDltvProxyUrl, loadDltvVideo } from './dltv-helper.js';
 *   
 *   // Get proxied URL
 *   const proxyUrl = getDltvProxyUrl('https://video.dltv.ac.th/path/to/video.mp4');
 *   
 *   // Or load directly into a video element
 *   loadDltvVideo(videoElement, 'https://video.dltv.ac.th/path/to/video.mp4');
 */

// Detect environment
const isDevelopment = window.location.protocol === 'file:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

// Proxy endpoint paths
const PROXY_ENDPOINTS = {
    // Production (Netlify)
    production: '/api/dltv-proxy',
    // Development (local Netlify Dev or fallback)
    development: '/.netlify/functions/dltv-proxy',
    // Fallback: Direct URL (requires CORS extension)
    fallback: null
};

/**
 * Get the proxy URL for a DLTV video
 * @param {string} originalUrl - The original DLTV URL
 * @param {boolean} forceFallback - If true, returns original URL without proxy
 * @returns {string} The proxied URL or original URL
 */
export function getDltvProxyUrl(originalUrl, forceFallback = false) {
    // Validate URL is from DLTV
    if (!isDltvUrl(originalUrl)) {
        console.warn('[DLTV Helper] URL is not from DLTV domain:', originalUrl);
        return originalUrl;
    }

    // If forced fallback or development without Netlify Dev
    if (forceFallback || (isDevelopment && !isNetlifyDevRunning())) {
        console.info('[DLTV Helper] Using direct URL (CORS extension may be required)');
        return originalUrl;
    }

    // Build proxy URL
    const proxyBase = isDevelopment ? PROXY_ENDPOINTS.development : PROXY_ENDPOINTS.production;
    const encodedUrl = encodeURIComponent(originalUrl);

    return `${proxyBase}?url=${encodedUrl}`;
}

/**
 * Check if URL is from DLTV domain
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export function isDltvUrl(url) {
    try {
        const hostname = new URL(url).hostname.toLowerCase();
        return hostname.includes('dltv.ac.th');
    } catch {
        return false;
    }
}

/**
 * Check if URL is from YouTube
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export function isYoutubeUrl(url) {
    try {
        const hostname = new URL(url).hostname.toLowerCase();
        return hostname.includes('youtube.com') || hostname.includes('youtu.be');
    } catch {
        return false;
    }
}

/**
 * Get the appropriate video URL based on source
 * This function automatically routes DLTV through proxy and leaves YouTube untouched
 * @param {string} url - Original video URL
 * @returns {string} The correct URL to use
 */
export function getSmartVideoUrl(url) {
    if (isYoutubeUrl(url)) {
        // YouTube: Use as-is (embed URLs work without CORS issues)
        return url;
    } else if (isDltvUrl(url)) {
        // DLTV: Route through proxy
        return getDltvProxyUrl(url);
    } else {
        // Other sources: Use as-is
        return url;
    }
}

/**
 * Load DLTV video into a video element
 * @param {HTMLVideoElement} videoElement - The video element to load into
 * @param {string} dltvUrl - The DLTV video URL
 * @param {Object} options - Additional options
 */
export async function loadDltvVideo(videoElement, dltvUrl, options = {}) {
    const {
        autoplay = false,
        muted = false,
        onLoad = null,
        onError = null
    } = options;

    try {
        const proxyUrl = getDltvProxyUrl(dltvUrl);

        videoElement.src = proxyUrl;
        videoElement.autoplay = autoplay;
        videoElement.muted = muted;

        if (onLoad) {
            videoElement.onloadeddata = onLoad;
        }

        if (onError) {
            videoElement.onerror = (e) => {
                console.error('[DLTV Helper] Video load error:', e);
                onError(e);
            };
        }

        await videoElement.load();

        console.info('[DLTV Helper] Video loaded successfully');
        return true;

    } catch (error) {
        console.error('[DLTV Helper] Failed to load video:', error);
        if (onError) onError(error);
        return false;
    }
}

/**
 * Check if Netlify Dev server is running (for local development)
 * @returns {boolean}
 */
function isNetlifyDevRunning() {
    // Netlify Dev typically runs on port 8888
    return window.location.port === '8888';
}

/**
 * Test proxy connectivity
 * @returns {Promise<boolean>}
 */
export async function testProxyConnectivity() {
    try {
        const testUrl = 'https://www.dltv.ac.th/';
        const proxyUrl = getDltvProxyUrl(testUrl);

        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: { 'Accept': 'text/html' }
        });

        return response.ok;
    } catch (error) {
        console.warn('[DLTV Helper] Proxy connectivity test failed:', error);
        return false;
    }
}

// Export default configuration
export default {
    getDltvProxyUrl,
    getSmartVideoUrl,
    loadDltvVideo,
    isDltvUrl,
    isYoutubeUrl,
    testProxyConnectivity
};
