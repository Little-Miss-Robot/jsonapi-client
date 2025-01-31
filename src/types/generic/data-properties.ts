// Utility types to extract data properties (non-methods)
type NonMethodKeys<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
export type DataProperties<T> = Pick<T, NonMethodKeys<T>>;