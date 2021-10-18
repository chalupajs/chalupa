import { InversifyContainer, Constructor, IContextContainer } from '@catamaranjs/interface'

export type ModuleBindingProcessor = (current: Constructor, parent: Constructor | null) => void

export const NO_PARENT = null

/**
 * Represents the dependency injection container of a service,
 * containing the bindings used to resolve dependency relations.
 */
export class ContextContainer implements IContextContainer {
	constructor(
		private readonly container: InversifyContainer,
		private readonly moduleBindingProcessor: ModuleBindingProcessor,
		private readonly parent: Constructor | null
	) {}

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
	bindInterface<T>(accessor: string, constructor: Constructor<T>): this {
		this.container.bind<T>(accessor).to(constructor).inSingletonScope()

		return this
	}

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
	bindClass<T>(constructor: Constructor<T>): this {
		this.container.bind<T>(constructor).toSelf().inSingletonScope()

		return this
	}

	/**
	 * Binds the specified constant value to the given accessor string
	 *
	 * @param accessor
	 * @param constant
	 */
	bindConstant<T>(accessor: string, constant: T): this {
		this.container.bind<T>(accessor).toConstantValue(constant)
		return this
	}

	bindModule<T>(moduleConstructor: Constructor<T>): this {
		// TODO: check if really a module constructor

		this.moduleBindingProcessor(moduleConstructor, this.parent)

		return this
	}
}
