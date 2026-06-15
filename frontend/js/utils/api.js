const API_BASE_URL = 'http://localhost:3001';

export async function apiFetch(endpoint, options = {}) {
    let session = null;
    try {
        const stored = localStorage.getItem('user_session');
        if (stored && stored !== 'undefined') {
            session = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Invalid session JSON");
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (session && session.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        throw error;
    }
}
