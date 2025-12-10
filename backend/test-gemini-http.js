const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ No API Key found');
    process.exit(1);
}

console.log('Testing with Key ending in:', apiKey.slice(-5));

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        try {
            const json = JSON.parse(data);
            if (res.statusCode === 200) {
                console.log('✅ Success! Available Models:');
                // Filter for just gemini models to keep output clean
                const models = json.models.filter(m => m.name.includes('gemini'));
                models.forEach(m => console.log(` - ${m.name}`));
            } else {
                console.error('❌ API Error Response:', JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error('Failed to parse response:', data);
        }
    });
}).on('error', err => {
    console.error('Request Error:', err.message);
});
