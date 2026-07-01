(async function enforceSecurityGateway() {
    // 1. SAFEGUARD: If the trainee is already on the login page, stop the check
    // This prevents an infinite redirection loop!
    if (window.location.pathname.endsWith('login.html')) {
        return;
    }

    // 2. Fetch the API configuration and look for the token
    const API_URL = window.ENV ? window.ENV.API_URL : "https://api.artdance.mishu-soft.org/";
    const token = localStorage.getItem('token');

    // 3. If there is no token at all, instantly redirect to login
    if (!token) {
        console.warn("No token found. Redirecting to login space...");
        window.location.href = '/login.html';
        return;
    }

    try {
        // 4. Ping the backend with the token attached to the Authorization header
        const response = await fetch(`${API_URL}auth/check/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // If the backend responds with a 401 or 403 status code
        if (!response.ok) {
            throw new Error("Session expired or token modified.");
        }

        const userData = await response.json();
        console.log(`Authenticated successfully as: ${userData.username}`);
        
        // Optional: Save user details globally so trainees can display them in templates
        window.currentUser = userData;

    } catch (error) {
        console.error("Security authorization rejected:", error);
        
        // Clear out the corrupted or expired token from the browser storage
        localStorage.removeItem('token');
        
        // Boot them out
        window.location.href = '/login.html';
    }
})();