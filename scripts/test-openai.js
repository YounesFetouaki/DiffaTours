const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env.local
const envPath = path.join(__dirname, '../.env.local');
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    // Simple parsing of .env file
    const lines = envContent.split('\n');
    let apiKey = '';
    for (const line of lines) {
        if (line.trim().startsWith('OPENAI_API_KEY=')) {
            apiKey = line.split('=')[1].trim();
            // Remove quotes if present
            if ((apiKey.startsWith('"') && apiKey.endsWith('"')) || (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
                apiKey = apiKey.slice(1, -1);
            }
            break;
        }
    }

    if (!apiKey) {
        console.error("OPENAI_API_KEY not found in .env.local");
        process.exit(1);
    }

    console.log("API Key found (starts with: " + apiKey.substring(0, 3) + "..., length: " + apiKey.length + ")");

    const data = JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 5
    });

    const req = https.request({
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }
    }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            console.log("Status:", res.statusCode);
            if (res.statusCode !== 200) {
                console.log("Error Body:", body);
            } else {
                console.log("Success! API is working.");
                // console.log("Response:", body); 
            }
        });
    });

    req.on('error', (e) => {
        console.error("Request error:", e);
    });

    req.write(data);
    req.end();

} catch (err) {
    console.error("Error reading .env.local:", err);
}
