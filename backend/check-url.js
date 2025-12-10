const https = require('https');

const url = 'https://res.cloudinary.com/dyyblxf7p/video/upload/v1765003174/lms-videos/wgyxonejudi9xli3dtkv.mp4';

console.log(`Checking URL: ${url}`);

const req = https.request(url, { method: 'HEAD' }, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    if (res.statusCode === 200) {
        console.log('URL is accessible.');
    } else {
        console.log('URL is NOT accessible.');
    }
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
