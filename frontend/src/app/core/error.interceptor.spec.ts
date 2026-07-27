import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  it('should be a defined function', () => {
    expect(typeof errorInterceptor).toBe('function');
  });
});
