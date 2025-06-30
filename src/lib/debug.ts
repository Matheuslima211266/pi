// ==== Log capture helpers (variables declared early) ====
export const capturedLogs: any[] = [];
let captureEnabled = false;
let captureFilter: string | null = null;
let captureFilterRegex: RegExp | null = null;
let originalConsole: Partial<Record<keyof Console, any>> | null = null;

// debug helper
export const isDebug = (): boolean => {
  if (process.env.NODE_ENV !== 'development') return false;
  if (typeof window === 'undefined') return false;
  // explicit runtime flag via window or localStorage
  // 1) window.SIM_DEBUG = true
  // 2) localStorage.setItem('SIM_DEBUG','1')
  // 3) ?debug in url (optional)
  const winFlag = (window as any).SIM_DEBUG === true;
  const storageFlag = typeof localStorage !== 'undefined' && localStorage.getItem('SIM_DEBUG') === '1';
  const urlFlag = typeof window !== 'undefined' && window.location.search.includes('debug');
  return winFlag || storageFlag || urlFlag;
};

export const dbg = (...args: any[]): void => {
  if (isDebug()) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
  // Capture logs when capture mode is enabled
  if (captureEnabled) {
    try {
      const first = args[0];
      const text = typeof first === 'string' ? first : '';
      if (!captureFilterRegex || (typeof text === 'string' && captureFilterRegex.test(text))) {
        capturedLogs.push({ ts: Date.now(), args: args.map(a => (typeof a === 'object' ? JSON.parse(JSON.stringify(a)) : a)) });
      }
    } catch (err) {
      // ignore serialization errors
    }
  }
};

export const startLogCapture = (filter: string | null = null): void => {
  captureEnabled = true;
  captureFilter = filter;
  capturedLogs.length = 0;

  // Build regex for multi-term OR support
  if (filter && filter.trim() !== '') {
    const parts = filter.split(/\s*[,|]\s*/).filter(Boolean).map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    captureFilterRegex = parts.length > 1 ? new RegExp(parts.join('|'), 'i') : new RegExp(parts[0], 'i');
  } else {
    captureFilterRegex = null;
  }

  // Monkey-patch console once on first activation
  if (!originalConsole) {
    originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    } as Partial<Record<keyof Console, any>>;

    (['log', 'warn', 'error', 'info', 'debug'] as const).forEach((method) => {
      // @ts-ignore – dynamic index
      console[method] = (...args: any[]) => {
        // Capture
        if (captureEnabled) {
          try {
            const first = args[0];
            const text = typeof first === 'string' ? first : '';
            if (!captureFilterRegex || (typeof text === 'string' && captureFilterRegex.test(text))) {
              capturedLogs.push({ ts: Date.now(), level: method, args: args.map(a => (typeof a === 'object' ? JSON.parse(JSON.stringify(a)) : a)) });
            }
          } catch {
            /* ignore */
          }
        }
        // Call original
        // @ts-ignore – dynamic index
        originalConsole![method](...args);
      };
    });
  }
};

export const stopLogCapture = (): void => {
  captureEnabled = false;
};

export const downloadCapturedLogs = (): void => {
  if (capturedLogs.length === 0) {
    // Still allow download of empty file so user sees something
    console.warn('[debug] No logs captured – downloading empty log');
  }
  const data = JSON.stringify(capturedLogs, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sim_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}; 