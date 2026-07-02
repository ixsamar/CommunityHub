const originalWarn = console.warn.bind(console);
const originalError = console.error.bind(console);

beforeAll(() => {
  console.warn = (msg: unknown, ...rest: unknown[]) => {
    const str = String(msg);
    if (
      str.includes('act()') ||
      str.includes('Warning:') ||
      str.includes('Each child') ||
      str.includes('componentWillReceiveProps')
    ) {
      return;
    }
    originalWarn(msg, ...rest);
  };

  console.error = (msg: unknown, ...rest: unknown[]) => {
    const str = String(msg);
    if (str.includes('Warning:') || str.includes('act()')) {
      return;
    }
    originalError(msg, ...rest);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
