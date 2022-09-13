export function normalizeMinus0<T>(value: T) {
  return JSON.parse(JSON.stringify(value)); // bruh.
}
