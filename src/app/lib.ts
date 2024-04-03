import { assert } from './types';

export function normalizeToLimit(value: number, limit: number) {
  assert(limit > 0, 'Value and limit must be non-negative.');
  return value - Math.trunc(value / limit) * limit;
}

/**
 * Non-blockingly waits for all the promises, produced from {@link tasks} to settle & returns an easy-to-process object.
 */
export function waitAllSafely<T, Args = any>(tasks: DeepReadonly<(() => [Promise<T>, Args?])[]>) {
  return Promise.allSettled(tasks.map(t => {
    const [promise, args] = t();
    return promise.catch(error => { throw [error, args]; });
  })).then(results => {
    const settled: SettledPromises<Args, T> = {
      fulfilled: [],
      rejected: [],
    };
    for (const r of results) {
      if (r.status === 'fulfilled') {
        settled.fulfilled.push(r.value);
      } else {
        let rejected: typeof settled['rejected'][0];
        if (Array.isArray(r.reason) && r.reason.length === 2) {
          rejected = {
            reason: r.reason[0],
            args: r.reason[1],
          };
        } else {
          console.error(new TypeError('SettledPromise: Unexpected invalid state for error'), r.reason);
          rejected = {
            reason: r.reason,
            args: undefined as any
          };
        }
        settled.rejected.push(rejected);
      }
    }
    return settled;
  });
}
