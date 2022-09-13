export function assert(condition: boolean, errorMessage = 'Assertion failed!') {
  if (!condition) {
    throw new TypeError(errorMessage);
  }
}
