export function objectKeys<const T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

export function copy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
