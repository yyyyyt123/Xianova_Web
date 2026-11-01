/**
 * 只在页面可见时校验公开岗位；合并定时、回到前台和手动重试，避免并发请求。
 * @param {{refresh: () => Promise<void>, lastCheckedAt?: number, interval?: number,
 * documentTarget?: Pick<Document, 'visibilityState' | 'addEventListener' | 'removeEventListener'>,
 * windowTarget?: Pick<Window, 'addEventListener' | 'removeEventListener'>,
 * now?: () => number, setTimer?: typeof setTimeout, clearTimer?: typeof clearTimeout}} options
 */
export function startVisibleJobsRefresh({refresh, lastCheckedAt = 0, interval = 30000,
  documentTarget = document, windowTarget = window, now = Date.now,
  setTimer = setTimeout, clearTimer = clearTimeout}) {
  let stopped = false, inFlight = false;
  let lastAttempt = Math.min(lastCheckedAt, now());
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer;
  function cancelTimer() {
    if (timer !== undefined) clearTimer(timer);
    timer = undefined;
  }
  function schedule() {
    cancelTimer();
    if (!stopped && documentTarget.visibilityState === 'visible') {
      timer = setTimer(() => { void check(); }, Math.max(0, interval - (now() - lastAttempt)));
    }
  }
  async function check(force = false) {
    if (stopped || inFlight || documentTarget.visibilityState !== 'visible') return;
    if (!force && now() - lastAttempt < interval) { schedule(); return; }
    cancelTimer();
    inFlight = true;
    lastAttempt = now();
    try { await refresh(); } catch { /* 错误提示由调用者处理，定时校验继续。 */ }
    finally { inFlight = false; if (!stopped) schedule(); }
  }
  function onVisibility() {
    if (documentTarget.visibilityState !== 'visible') cancelTimer();
    else void check();
  }
  function onFocus() { void check(); }
  function onOnline() { void check(true); }
  documentTarget.addEventListener('visibilitychange', onVisibility);
  windowTarget.addEventListener('focus', onFocus);
  windowTarget.addEventListener('online', onOnline);
  void check();
  return {
    check,
    dispose() {
      stopped = true;
      cancelTimer();
      documentTarget.removeEventListener('visibilitychange', onVisibility);
      windowTarget.removeEventListener('focus', onFocus);
      windowTarget.removeEventListener('online', onOnline);
    },
  };
}
