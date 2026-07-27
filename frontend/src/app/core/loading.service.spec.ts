import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    service = new LoadingService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('show() should set loading to true', () => {
    service.show();
    let loading = false;
    service.loading$.subscribe(v => loading = v);
    expect(loading).toBe(true);
  });

  it('hide() should set loading to false when count reaches zero', () => {
    service.show();
    service.hide();
    let loading = true;
    service.loading$.subscribe(v => loading = v);
    expect(loading).toBe(false);
  });

  it('should handle multiple show/hide calls', () => {
    service.show();
    service.show();
    service.hide();

    let loading = true;
    service.loading$.subscribe(v => loading = v);
    expect(loading).toBe(true);

    service.hide();
    service.loading$.subscribe(v => loading = v);
    expect(loading).toBe(false);
  });

  it('hide() should not go below zero', () => {
    service.hide();
    service.hide();
    let loading = false;
    service.loading$.subscribe(v => loading = v);
    expect(loading).toBe(false);
  });

  it('reset() should immediately set loading to false', () => {
    service.show();
    service.show();
    service.reset();

    let loading = true;
    service.loading$.subscribe(v => loading = v);
    expect(loading).toBe(false);
  });
});
