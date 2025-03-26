export const BACKEND_URL = "https://famous-hildagarde-skharry-f4172305.koyeb.app/api/v1";

// Add a helper function to make authenticated API calls
export const apiCall = async (endpoint, method = 'GET', data = null, includeCredentials = true) => {
  try {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    const token = userData ? JSON.parse(userData).token : null;
    
    // Configure request options
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: includeCredentials ? 'include' : 'omit'
    };
    
    // Add authorization header if token exists
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      options.body = JSON.stringify(data);
    }
    
    // Make the request
    const response = await fetch(`${BACKEND_URL}${endpoint}`, options);
    
    // Handle response
    if (response.ok) {
      return await response.json();
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.errors || `Request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
};

// Specific function for logout that doesn't require authentication
export const logoutUser = async () => {
  try {
    // First, clear local storage
    localStorage.removeItem('user');
    
    // Then try to call the logout endpoint without requiring authentication
    const response = await fetch(`${BACKEND_URL}/user/logout`, {
      method: 'GET',
      credentials: 'include'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Logout failed:', error);
    return false;
  }
};