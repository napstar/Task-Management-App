const https = require('https');

const options = {
    hostname: 'localhost',
    port: 7197,
    path: '/api/tasks',
    method: 'GET',
    rejectUnauthorized: false // Ignore self-signed certs
};

const req = https.request(options, res => {
    let data = '';

    res.on('data', chunk => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        try {
            const json = JSON.parse(data);
            console.log('First Item Keys:', Object.keys(json[0]));
            console.log('First Item:', JSON.stringify(json[0], null, 2));
        } catch (e) {
            console.log('Raw Data (first 500 chars):', data.substring(0, 500));
        }
    });
});

req.on('error', error => {
    console.error(error);
});

req.end();
