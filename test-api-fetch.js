
const testFetch = async () => {
    try {
        // Mock token for testing purposes, or use SecureStore in actual environment
        // const token = await SecureStore.getItemAsync('access_token');
        const token = 'YOUR_ACTUAL_TOKEN_HERE'; 
        
        console.log('Fetching from: https://admin.datxedulich.vip/api/customer/bookings/history');
        
        const response = await fetch('https://admin.datxedulich.vip/api/customer/bookings/history', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Response:', text);
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

testFetch();
