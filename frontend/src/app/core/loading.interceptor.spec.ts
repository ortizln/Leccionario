describe('loadingInterceptor', () => {
  it('should be a defined function', () => {
    const { loadingInterceptor } = require('./loading.interceptor');
    expect(typeof loadingInterceptor).toBe('function');
  });
});
