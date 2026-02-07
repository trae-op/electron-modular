/**
 * @fileoverview Generic constructor type definition.
 *
 * Provides a type-safe representation of class constructors used throughout
 * the dependency injection system.
 *
 * @module @core/types/constructor
 */

/**
 * Represents a class constructor that can be instantiated with any arguments.
 *
 * @template T - The type of instance the constructor creates
 */
export type Constructor<T = any> = new (...args: any[]) => T;
