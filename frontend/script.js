// API Configuration
const API_URL = 'http://localhost:3000';

// OAuth Configuration
const OAUTH_CONFIG = {
    google: {
        clientId: '285575307486-ci12cjrb35br6khiukrhvn56v2l8mlo0.apps.googleusercontent.com',
        redirectUri: `${API_URL}/auth/oauth/google/callback`,
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        scope: 'openid email profile'
    },
    github: {
        clientId: 'YOUR_GITHUB_CLIENT_ID', // Replace with your actual GitHub Client ID
        redirectUri: `${window.location.origin}/oauth-callback.html`,
        authUrl: 'https://github.com/login/oauth/authorize',
        scope: 'read:user user:email'
    }
};

// State management
let currentUser = null;
let authToken = null;

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    
    // Check for OAuth error in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('error')) {
        showStatus(`❌ OAuth Error: ${urlParams.get('error')}`, 'error');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Listen for OAuth callback messages
    window.addEventListener('message', handleOAuthCallback);
});

// Check if user is already logged in
function checkAuthStatus() {
    authToken = localStorage.getItem('authToken');
    currentUser = localStorage.getItem('currentUser');
    
    if (authToken && currentUser) {
        currentUser = JSON.parse(currentUser);
        showUserInfo();
    }
}

// Traditional Sign Up
async function handleSignUp(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const phoneNumber = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    
    showStatus('Creating account...', 'info');
    
    try {
        const response = await fetch(`${API_URL}/auth/sign-up`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, phoneNumber, password })
        });
        
        const data = await response.json();
        displayResponse(data);
        
        if (response.ok) {
            showStatus('✅ Account created successfully!', 'success');
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showUserInfo();
            document.getElementById('signup-form').reset();
        } else {
            showStatus(`❌ Error: ${data.message || 'Sign up failed'}`, 'error');
        }
    } catch (error) {
        console.error('Sign up error:', error);
        showStatus(`❌ Network error: ${error.message}`, 'error');
        displayResponse({ error: error.message });
    }
}

// Traditional Sign In
async function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    
    showStatus('Signing in...', 'info');
    
    try {
        const response = await fetch(`${API_URL}/auth/sign-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        displayResponse(data);
        
        if (response.ok) {
            showStatus('✅ Signed in successfully!', 'success');
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showUserInfo();
            document.getElementById('signin-form').reset();
        } else {
            showStatus(`❌ Error: ${data.message || 'Sign in failed'}`, 'error');
        }
    } catch (error) {
        console.error('Sign in error:', error);
        showStatus(`❌ Network error: ${error.message}`, 'error');
        displayResponse({ error: error.message });
    }
}

// OAuth Login - Google
function loginWithGoogle() {
    const { clientId, redirectUri, authUrl, scope } = OAUTH_CONFIG.google;
    
    if (clientId === 'YOUR_GOOGLE_CLIENT_ID') {
        alert('⚠️ Please configure your Google OAuth Client ID in script.js\n\n' +
              'Get your credentials at: https://console.cloud.google.com/');
        return;
    }
    
    const state = generateRandomState();
    localStorage.setItem('oauth_state', state);
    localStorage.setItem('oauth_provider', 'google');
    
    const authParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scope,
        state: state,
        access_type: 'offline',
        prompt: 'consent'
    });
    
    const popup = window.open(
        `${authUrl}?${authParams.toString()}`,
        'OAuth Login',
        'width=500,height=600'
    );
}

// OAuth Login - GitHub
function loginWithGitHub() {
    const { clientId, redirectUri, authUrl, scope } = OAUTH_CONFIG.github;
    
    if (clientId === 'YOUR_GITHUB_CLIENT_ID') {
        alert('⚠️ Please configure your GitHub OAuth Client ID in script.js\n\n' +
              'Get your credentials at: https://github.com/settings/developers');
        return;
    }
    
    const state = generateRandomState();
    localStorage.setItem('oauth_state', state);
    localStorage.setItem('oauth_provider', 'github');
    
    const authParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scope,
        state: state
    });
    
    const popup = window.open(
        `${authUrl}?${authParams.toString()}`,
        'OAuth Login',
        'width=500,height=600'
    );
}

// OAuth Login - Apple (simplified - requires server-side setup)
function loginWithApple() {
    alert('🍎 Apple Sign In requires additional server-side configuration.\n\n' +
          'For testing, use the mock endpoint or configure Apple Sign In at:\n' +
          'https://developer.apple.com/');
}

// OAuth Login - Facebook (simplified)
function loginWithFacebook() {
    alert('📘 Facebook Login requires additional configuration.\n\n' +
          'For testing, use the mock endpoint or configure at:\n' +
          'https://developers.facebook.com/');
}

// Handle OAuth callback from popup
function handleOAuthCallback(event) {
    if (event.data.type === 'oauth-success') {
        const { code, state } = event.data;
        const savedState = localStorage.getItem('oauth_state');
        const provider = localStorage.getItem('oauth_provider');
        
        if (state !== savedState) {
            showStatus('❌ Invalid state parameter (CSRF check failed)', 'error');
            return;
        }
        
        // Exchange code for token with backend
        exchangeOAuthCode(provider, code);
        
        // Cleanup
        localStorage.removeItem('oauth_state');
        localStorage.removeItem('oauth_provider');
    }
}

// Exchange OAuth code for access token
async function exchangeOAuthCode(provider, code) {
    showStatus(`Authenticating with ${provider}...`, 'info');
    
    try {
        const response = await fetch(`${API_URL}/auth/oauth/${provider}/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                redirectUri: OAUTH_CONFIG[provider].redirectUri
            })
        });
        
        const data = await response.json();
        displayResponse(data);
        
        if (response.ok) {
            showStatus(`✅ Logged in with ${provider}!`, 'success');
            authToken = data.accessToken;
            currentUser = {
                id: data.userId,
                email: data.email,
                isNewUser: data.isNewUser
            };
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showUserInfo();
        } else {
            showStatus(`❌ OAuth Error: ${data.message || 'Authentication failed'}`, 'error');
        }
    } catch (error) {
        console.error('OAuth exchange error:', error);
        showStatus(`❌ Network error: ${error.message}`, 'error');
        displayResponse({ error: error.message });
    }
}

// Logout
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    document.getElementById('user-info').classList.add('hidden');
    document.getElementById('auth-forms').classList.remove('hidden');
    
    showStatus('👋 Logged out successfully', 'success');
    displayResponse({ message: 'User logged out' });
}

// Show user info
function showUserInfo() {
    const userInfoDiv = document.getElementById('user-info');
    const userDetailsDiv = document.getElementById('user-details');
    const authFormsDiv = document.getElementById('auth-forms');
    
    userDetailsDiv.innerHTML = `
        <div><strong>Token:</strong> ${authToken.substring(0, 30)}...</div>
        ${currentUser.id ? `<div><strong>User ID:</strong> ${currentUser.id}</div>` : ''}
        ${currentUser.email ? `<div><strong>Email:</strong> ${currentUser.email}</div>` : ''}
        ${currentUser.name ? `<div><strong>Name:</strong> ${currentUser.name}</div>` : ''}
        ${currentUser.phoneNumber ? `<div><strong>Phone:</strong> ${currentUser.phoneNumber}</div>` : ''}
        ${currentUser.role ? `<div><strong>Role:</strong> ${currentUser.role}</div>` : ''}
        ${currentUser.isNewUser !== undefined ? `<div><strong>New User:</strong> ${currentUser.isNewUser}</div>` : ''}
    `;
    
    userInfoDiv.classList.remove('hidden');
    authFormsDiv.classList.add('hidden');
}

// Show status message
function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.classList.remove('hidden');
    
    if (type === 'info') {
        statusDiv.style.background = '#d1ecf1';
        statusDiv.style.color = '#0c5460';
        statusDiv.style.border = '1px solid #bee5eb';
    }
    
    setTimeout(() => {
        if (type !== 'success' && type !== 'error') {
            statusDiv.classList.add('hidden');
        }
    }, 5000);
}

// Display API response
function displayResponse(data) {
    const responseDiv = document.getElementById('response-display');
    responseDiv.textContent = JSON.stringify(data, null, 2);
}

// Generate random state for CSRF protection
function generateRandomState() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
