const BASE_URL = 'http://localhost:5000/api';

export function apiFetch(path: string, options: RequestInit = {}) {
  return fetch(`${BASE_URL}${path}`, options);
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (err) {
    return true;
  }
}

export function checkAuthRedirect(navigate: (path: string) => void): string | null {
  const token = localStorage.getItem('token');

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenTimeoutId');
    navigate('/auth/login');
    return null;
  }

  return token;
}

// Function to set up automatic token cleanup
export function setupTokenExpiration(navigate: (path: string) => void): void {
  const token = localStorage.getItem('token');
  
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const remainingTime = expirationTime - currentTime;
    
    if (remainingTime > 0) {
      // Clear any existing timeout
      const existingTimeout = localStorage.getItem('tokenTimeoutId');
      if (existingTimeout) {
        clearTimeout(Number(existingTimeout));
      }

      // Set timeout for remaining time
      const timeoutId = setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenTimeoutId');
        navigate('/auth/login');
        console.log('Session expired. Please login again.');
      }, remainingTime);

      localStorage.setItem('tokenTimeoutId', timeoutId.toString());
    }
  } catch (err) {
    // If there's an error parsing the token, remove it
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenTimeoutId');
  }
}

// Function to clear token expiration timeout
export function clearTokenExpiration(): void {
  const existingTimeout = localStorage.getItem('tokenTimeoutId');
  if (existingTimeout) {
    clearTimeout(Number(existingTimeout));
    localStorage.removeItem('tokenTimeoutId');
  }
}