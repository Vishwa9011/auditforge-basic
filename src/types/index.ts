// Generic helper to create a "branded" (nominal) type
// T = actual value type (number)
// B = unique symbol used as an invisible label
export type Brand<T, B extends symbol> = T & {
    // Add a hidden, type-only property keyed by a unique symbol
    // This makes the type distinct from plain T
    readonly [K in B]: true;
};
