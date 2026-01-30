async function testLogin() {
    try {
        console.log('Testing connection to local backend...');

        // Test root endpoint
        try {
            const rootRes = await fetch('http://localhost:5000/');
            console.log('Root endpoint status:', rootRes.status);
            console.log('Root endpoint text:', await rootRes.text());
        } catch (e) {
            console.error('Root endpoint failed:', e.message);
        }

        console.log('\nTesting Login with mocked Origin...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5173'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password'
            })
        });

        console.log('Login Response Status:', loginRes.status);
        console.log('Login Headers:', [...loginRes.headers.entries()]);
        const text = await loginRes.text();
        console.log('Login Response Body:', text.substring(0, 200)); // Show first 200 chars

    } catch (error) {
        console.error('Fetch Error:', error.message);
    }
}

testLogin();
