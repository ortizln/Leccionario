const isLocalHost = typeof window !== 'undefined'
  && ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_URL = isLocalHost ? 'http://localhost:1080/api' : '/api';
