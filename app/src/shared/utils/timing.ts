export type TimeoutHandle = {
  clear(): void;
  reset(): void;
};

export function createTimeout(
  cb: () => void,
  time: number = 0,
  runInitially = true
): TimeoutHandle {
  let timeout = runInitially ? setTimeout(cb, time) : null;

  return {
    clear() {
      if (!timeout) {
        return;
      }
      clearTimeout(timeout);
      timeout = null;
    },
    reset() {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(cb, time);
    },
  };
}
