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
    navigate('/auth/login');
    return null;
  }

  return token;
}