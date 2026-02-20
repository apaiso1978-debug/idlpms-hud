// node natively supports fetch

const config = {
    insforge: {
        baseUrl: 'https://3tcdq2dd.ap-southeast.insforge.app',
        apiKey: 'ik_e9ac09dcf4f6732689dd5558fe889c0a'
    }
};

async function testFetch() {
    try {
        console.log('Fetching...');
        const response = await fetch(`${config.insforge.baseUrl}/api/admin/metrics`, {
            headers: {
                'Authorization': `Bearer ${config.insforge.apiKey}`
            }
        });

        console.log('Status:', response.status);
        if (!response.ok) {
            console.log('Text:', await response.text());
            throw new Error('Failed to fetch InsForge metrics');
        }

        const data = await response.json();
        console.log('Data:', data);
    } catch (error) {
        console.error('Error:', error.message);
        console.log('Fallback mock data:');
        console.log({
            ai_calls_used: 42105,
            ai_calls_limit: 50000,
            db_rows_read: 124000,
            db_rows_written: 15600,
            status: 'healthy'
        });
    }
}

testFetch();
