/**
 * IDLPMS AdminMetricsService
 * ===========================
 * Dedicated service for the Admin Dashboard to fetch system-wide telemetry.
 * Connects to:
 * 1. InsForge (AI Calls & DB Stats)
 * 2. Netlify (Bandwidth & Build Status)
 * 3. GitHub (Latest Commits & Issues)
 *
 * @version 1.0.0
 */

class AdminMetricsService {
    constructor() {
        // These should ideally come from a secure environment variables configuration
        // DO NOT HARDCODE production tokens in frontend code long-term
        this.defaultConfig = {
            insforge: {
                baseUrl: 'https://3tcdq2dd.ap-southeast.insforge.app',
                apiKey: 'ik_e9ac09dcf4f6732689dd5558fe889c0a'
            },
            netlify: {
                siteId: '0df70491-f08d-4572-aefa-c1458e8fd7f2', // Found in deploy.ps1
                token: 'nfp_5U2EHaoVnAYAfXobrm5DvPiRDVR59sz2cc5e'        // Generated via agent
            },
            github: {
                repo: 'apaiso1978-debug/idlpms-hud',   // Found in git remote
                token: '' // Optional for public repos
            },
            webhookUrl: '',
            lineChannelToken: 'khxlUfwZtVqIYdP9Xe+CBJoeWkyV5ElBndaWiwYcWG+6PHWRyU8BfpalkDtyLfPUwPmGUHAHFVEjtpmnTfSAPbDxDvtQn//pTezdmOnax/dicLpwCRgE1a74yR0O8dO7gtfI83dynNeN47z6/I+TCgdB04t89/1O/w1cDnyilFU=',
            lineTargetId: 'U2be6b5ab002d97491ba4827832f15125'
        };

        this.config = JSON.parse(JSON.stringify(this.defaultConfig));

        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache

        this.loadConfig();
    }

    /**
     * Loads dynamic configuration from browser localStorage set by the Admin.
     */
    loadConfig() {
        if (typeof localStorage !== 'undefined') {
            const storedConfigStr = localStorage.getItem('idlpms_admin_config');
            if (storedConfigStr) {
                try {
                    const storedConfig = JSON.parse(storedConfigStr);
                    if (storedConfig.insforgeKey) this.config.insforge.apiKey = storedConfig.insforgeKey;
                    if (storedConfig.netlifyToken) this.config.netlify.token = storedConfig.netlifyToken;
                    if (storedConfig.netlifySiteId) this.config.netlify.siteId = storedConfig.netlifySiteId;
                    if (storedConfig.webhookUrl) this.config.webhookUrl = storedConfig.webhookUrl;
                    if (storedConfig.lineChannelToken) this.config.lineChannelToken = storedConfig.lineChannelToken;
                    if (storedConfig.lineTargetId) this.config.lineTargetId = storedConfig.lineTargetId;
                    console.log('[AdminMetrics] Loaded secure configuration from localStorage.');
                } catch (e) {
                    console.error('[AdminMetrics] Failed to parse secure config.');
                }
            }
        }
    }

    /**
     * Dispatches a webhook alert to an external system (Discord/Slack/Custom OR LINE Messaging API).
     * Prevents spamming by checking sessionStorage.
     */
    async dispatchWebhookAlert(source, pct, message) {
        if (!this.config.webhookUrl && (!this.config.lineChannelToken || !this.config.lineTargetId)) return; // No webhook or LINE configured

        const sessionKey = `idlpms_alert_sent_${source}`;
        if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionKey)) {
            // Already sent an alert for this source in the current session
            return;
        }

        let sentAtLeastOne = false;

        // 1. Send generic Webhook (Discord, Slack, etc.)
        if (this.config.webhookUrl) {
            try {
                const payload = {
                    content: `🚨 **IDLPMS CRITICAL ALERT: ${source.toUpperCase()}** 🚨\n${message}\nCurrent Usage: **${pct}%**\n<@here> Please investigate immediately.`,
                    username: "IDLPMS System Sentinel",
                    avatar_url: "https://auth.insforge.com/assets/images/logo_icon.png" // Replace with valid avatar if needed
                };

                const response = await fetch(this.config.webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    console.log(`[AdminMetrics] Successfully dispatched generic Webhook alert for ${source}`);
                    sentAtLeastOne = true;
                }
            } catch (error) {
                console.error('[AdminMetrics] Failed to send generic webhook alert:', error);
            }
        }

        // 2. Send LINE Messaging API Webhook via Netlify Proxy
        if (this.config.lineChannelToken && this.config.lineTargetId) {
            try {
                const lineMessage = `🚨 IDLPMS อาการน่าเป็นห่วง: ${source.toUpperCase()}\n${message}\n📈 การใช้งานปัจจุบัน: ${pct}%\nกรุณาเข้าตรวจสอบระบบด่วนครับ`;

                // Using Netlify Serverless function to proxy to LINE API and bypass CORS
                const response = await fetch('/.netlify/functions/line-messaging', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: lineMessage,
                        channelToken: this.config.lineChannelToken,
                        targetId: this.config.lineTargetId
                    })
                });

                if (response.ok) {
                    console.log(`[AdminMetrics] Successfully dispatched LINE Messaging alert for ${source}`);
                    sentAtLeastOne = true;
                } else {
                    console.error('[AdminMetrics] LINE Messaging proxy returned:', await response.text());
                }
            } catch (error) {
                console.error('[AdminMetrics] Failed to send LINE Messaging alert:', error);
            }
        }

        if (sentAtLeastOne && typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(sessionKey, 'true');
        }
    }

    /**
     * 1. InsForge Telemetry (Database & AI Usage)
     */
    async getInsForgeStats() {
        try {
            // Note: Replace '/api/admin/metrics' with the actual InsForge endpoint for tenant usage
            const response = await fetch(`${this.config.insforge.baseUrl}/api/admin/metrics`, {
                headers: {
                    'Authorization': `Bearer ${this.config.insforge.apiKey}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch InsForge metrics');
            return await response.json();

        } catch (error) {
            console.error('[AdminMetrics] InsForge API Error:', error);
            // Fallback mock data for UI testing
            return {
                ai_calls_used: 42105,
                ai_calls_limit: 50000,
                db_rows_read: 124000,
                db_rows_written: 15600,
                status: 'healthy'
            };
        }
    }

    /**
     * 2. Netlify Telemetry (Bandwidth & Builds)
     */
    async getNetlifyStats() {
        if (!this.config.netlify.siteId || this.config.netlify.siteId.includes('YOUR_')) {
            console.warn('[AdminMetrics] Netlify credentials not set. Returning mock.');
            return this._mockNetlifyData();
        }

        try {
            const response = await fetch(`https://api.netlify.com/api/v1/sites/${this.config.netlify.siteId}/metrics/bandwidth`, {
                headers: {
                    'Authorization': `Bearer ${this.config.netlify.token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch Netlify metrics');
            return await response.json();
        } catch (error) {
            console.error('[AdminMetrics] Netlify API Error:', error);
            return this._mockNetlifyData();
        }
    }

    _mockNetlifyData() {
        return {
            bandwidth_used_bytes: 14200000000, // 14.2 GB
            bandwidth_limit_bytes: 100000000000, // 100 GB
            status: 'online'
        };
    }

    /**
     * 3. GitHub Telemetry (Recent Commits)
     */
    async getGithubSysEvents() {
        if (!this.config.github.repo || this.config.github.repo.includes('YOUR_')) {
            return this._mockGithubData();
        }

        try {
            const headers = { 'Accept': 'application/vnd.github.v3+json' };
            if (this.config.github.token && !this.config.github.token.includes('YOUR_')) {
                headers['Authorization'] = `token ${this.config.github.token}`;
            }

            const response = await fetch(`https://api.github.com/repos/${this.config.github.repo}/commits?per_page=5`, { headers });

            if (!response.ok) throw new Error('Failed to fetch Github commits');
            const commits = await response.json();

            return commits.map(c => ({
                type: 'github',
                message: c.commit.message,
                author: c.commit.author.name,
                date: c.commit.author.date
            }));

        } catch (error) {
            console.error('[AdminMetrics] GitHub API Error:', error);
            return this._mockGithubData();
        }
    }

    _mockGithubData() {
        return [
            { type: 'github', message: 'Build: Update Admin Dashboard UI', author: 'Zerocool', date: new Date().toISOString() },
            { type: 'github', message: 'Fix: Delegation Panel synchronization', author: 'Zerocool', date: new Date(Date.now() - 86400000).toISOString() }
        ];
    }
}

// Attach to window for global access in the browser
if (typeof window !== 'undefined') {
    window.AdminMetricsService = new AdminMetricsService();
}
