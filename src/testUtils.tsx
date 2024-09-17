export const flushPromises = async (): Promise<unknown> =>
  (await vi.importActual('timers')).setImmediate;
