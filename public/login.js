document.getElementById('login-form').addEventListener('submit', async function(e) {
    // Prevent the default browser page reload behavior on form submission
    e.preventDefault();

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const errorBox = document.getElementById('error-message');
    const submitBtn = document.getElementById('submit-btn');

    // Reset error box state on new attempt
    errorBox.classList.add('hidden');
    errorBox.innerText = '';
    submitBtn.innerText = 'Authenticating...';
    submitBtn.disabled = true;

    // Pull our live production API base path
    const API_URL = window.ENV ? window.ENV.API_URL : "https://api.artdance.mishu-soft.org/";

    try {
        // Execute the POST request against your Django TokenObtainPairView endpoint
        const response = await fetch(`${API_URL}login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle common 401 Unauthorized errors from SimpleJWT gracefully
            throw new Error(data.detail || 'Invalid username or password. Please try again.');
        }

        // Save tokens safely into browser storage for cross-page auth-checks
        localStorage.setItem('token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        console.log('Authentication successful! Token saved.');

        // Securely pass the workspace gatekeeper and enter the main application space
        window.location.href = '/index.html';

    } catch (error) {
        console.error('Login process failed:', error);
        
        // Expose the error message directly to the trainees' UI container
        errorBox.innerText = error.message;
        errorBox.classList.remove('hidden');
        
        // Restore button state
        submitBtn.innerText = 'Sign In';
        submitBtn.disabled = false;
    }
});