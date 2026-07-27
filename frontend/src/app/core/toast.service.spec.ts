import { ToastService, Toast } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = new ToastService();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should add a toast on show()', (done) => {
    service.toasts$.subscribe(toasts => {
      if (toasts.length > 0) {
        expect(toasts[0].message).toBe('Hello');
        expect(toasts[0].type).toBe('info');
        done();
      }
    });
    service.show('Hello');
  });

  it('should auto-dismiss after duration', () => {
    service.show('Test', 'success', 1000);
    expect(service['toasts'].value.length).toBe(1);

    jest.advanceTimersByTime(1000);
    expect(service['toasts'].value.length).toBe(0);
  });

  it('success() should create success toast', (done) => {
    service.toasts$.subscribe(toasts => {
      if (toasts.length > 0) {
        expect(toasts[0].type).toBe('success');
        expect(toasts[0].message).toBe('Done');
        done();
      }
    });
    service.success('Done');
  });

  it('error() should create error toast with longer duration', (done) => {
    service.toasts$.subscribe(toasts => {
      if (toasts.length > 0) {
        expect(toasts[0].type).toBe('error');
        expect(toasts[0].duration).toBe(6000);
        done();
      }
    });
    service.error('Fail');
  });

  it('dismiss() should remove toast by id', () => {
    service.show('A');
    service.show('B');
    expect(service['toasts'].value.length).toBe(2);

    service.dismiss(0);
    expect(service['toasts'].value.length).toBe(1);
    expect(service['toasts'].value[0].message).toBe('B');
  });

  it('warning() should create warning toast', (done) => {
    service.toasts$.subscribe(toasts => {
      if (toasts.length > 0) {
        expect(toasts[0].type).toBe('warning');
        done();
      }
    });
    service.warning('Careful');
  });

  it('info() should create info toast', (done) => {
    service.toasts$.subscribe(toasts => {
      if (toasts.length > 0) {
        expect(toasts[0].type).toBe('info');
        done();
      }
    });
    service.info('FYI');
  });
});
