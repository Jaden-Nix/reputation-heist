// Removed require('node-fetch'); using native fetch in Node 24

async function testJudge() {
    console.log("Testing Judge API...");
    try {
        const response = await fetch('http://localhost:3000/api/judge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                heistId: '1',
                proofUrl: 'https://twitter.com/vitalik/status/123456789' // Potentially good proof
            })
        });
        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

testJudge();
