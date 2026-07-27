import { permissionGuard } from './permission.guard';

describe('permissionGuard', () => {
  it('should be a defined function', () => {
    expect(typeof permissionGuard).toBe('function');
  });
});
