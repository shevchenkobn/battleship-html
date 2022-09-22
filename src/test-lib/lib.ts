export function normalizeMinus0<T>(value: T) {
  return JSON.parse(JSON.stringify(value)); // bruh.
}

export function log<Args extends any[], T>(func: (...args: Args) => T, name = func.name) {
  return (...args: Args) => {
    console.log(name + ' called');
    return func(...args);
  };
}
