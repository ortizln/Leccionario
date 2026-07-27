import { authInterceptor } from './auth.interceptor';
import { API_URL } from './api.config';

describe('authInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should pass through auth endpoint requests unchanged', () => {
    const req = { url: `${API_URL}/auth/login` } as any;
    const handler = jest.fn().mockReturnValue('next-result');
    const result = authInterceptor(req, handler);
    expect(handler).toHaveBeenCalledWith(req);
    expect(result).toBe('next-result');
  });

  it('should not add header when no session', () => {
    const req = { url: `${API_URL}/students` } as any;
    const handler = jest.fn().mockReturnValue('next-result');
    authInterceptor(req, handler);
    expect(handler).toHaveBeenCalledWith(req);
  });

  it('should add Authorization header from session', () => {
    localStorage.setItem('auth_session', JSON.stringify({ token: 'jwt-abc' }));
    const clonedReq = { url: `${API_URL}/students` };
    const req = { url: `${API_URL}/students`, clone: jest.fn().mockReturnValue(clonedReq) } as any;
    const handler = jest.fn().mockReturnValue('next-result');
    authInterceptor(req, handler);
    expect(req.clone).toHaveBeenCalledWith({
      setHeaders: { Authorization: 'Bearer jwt-abc' }
    });
  });

  it('should handle malformed session JSON gracefully', () => {
    localStorage.setItem('auth_session', 'not-json');
    const req = { url: `${API_URL}/students` } as any;
    const handler = jest.fn().mockReturnValue('next-result');
    authInterceptor(req, handler);
    expect(handler).toHaveBeenCalledWith(req);
  });

  it('should handle session with no token', () => {
    localStorage.setItem('auth_session', JSON.stringify({ username: 'admin' }));
    const req = { url: `${API_URL}/students` } as any;
    const handler = jest.fn().mockReturnValue('next-result');
    authInterceptor(req, handler);
    expect(handler).toHaveBeenCalledWith(req);
  });
});
