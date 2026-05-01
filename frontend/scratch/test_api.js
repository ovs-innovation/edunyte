async function testApi() {
    const API_BASE_URL = 'https://edunyte.vastoratech.com/api';
    const endpoints = [
        '/public/courses/teachers',
        '/public/all-instructors',
        '/public/instructor-profiles',
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`Success ${endpoint}:`, JSON.stringify(data).substring(0, 200));
            } else {
                console.log(`Failed ${endpoint}:`, response.status);
            }
        } catch (e) {
            console.log(`Error ${endpoint}:`, e.message);
        }
    }
}

testApi();
