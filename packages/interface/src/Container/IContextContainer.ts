import { Constructor } from "../index";

export interface IContextContainer {
	/**
	 * Binds the specified constructor to the accessor. The container will inject
	 * an instance of the constructor type wherever the accessor is used.
	 *
	 * Note, that the constructor will be bound in singleton scope, which means
	 * that only a single instance will ever be created throughout the lifetime
	 * of the container (or zero, if no instance is requested).
	 * @param accessor A unique string identifying some type of interface.
	 * @param constructor A constructor function (or class) which will supply the bound instance.
	 * @returns The current `ContextContainer` instance for easy chaining of calls-
	 */
	bindInterface<T>(accessor: string, constructor: Constructor<T>): this

	/**
	 * Binds the specified constructor to itself: wherever an injection is requested
	 * with the constructor, the container will inject an instance of the constructor type.
	 *
	 * Note, that the constructor will be bound in singleton scope, which means
	 * that only a single instance will ever be created throughout the lifetime
	 * of the container (or zero, if no instance is requested).
	 * @param constructor A constructor function (or class) which will supply the bound instance.
	 * @returns The current `ContextContainer` instance for easy chaining of calls.
	 */
	bindClass<T>(constructor: Constructor<T>): this

	/**
	 * Binds the specified constant value to the given accessor string
	 *
	 * @param accessor
	 * @param constant
	 */
	bindConstant<T>(accessor: string, constant: T): this
}
