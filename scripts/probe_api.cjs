const CONFIG = {
    baseUrl: 'https://3tcdq2dd.ap-southeast.insforge.app',
    apiKey: 'ik_e9ac09dcf4f6732689dd5558fe889c0a'
};

const headers = {
    'Authorization': `Bearer ${CONFIG.apiKey}`,
    'Content-Type': 'application/json'
};

async function probe() {
    const endpoints = [
        '/api/database/tables/persons/records',
        '/api/v1/persons',
        '/api/persons',
        '/persons'
    ];

    for (const ep of endpoints) {
        try {
            console.log(`Probing ${ep}...`);
            const response = await fetch(`${CONFIG.baseUrl}${ep}`, {
                method: 'GET',
                headers
            });
            console.log(`Status: ${response.status}`);
            const text = await response.text();
            console.log(`Response start: ${text.substring(0, 100)}`);
            if (response.ok) {
                console.log(`SUCCESS on ${ep}`);
                break;
            }
        } catch (e) {
            console.error(`Error on ${ep}: ${e.message}`);
        }
    }
}

probe();
