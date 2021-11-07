import {
	Constructor,
	IContainer,
	IFacadeContainer,
	IInjectContainer,
	ILogger,
	InversifyContainer,
	IPlugin,
	IPluginContainer,
	LoggerFactory,
} from '@chalupajs/interface'

export class Container implements IContainer, IInjectContainer, IFacadeContainer, IPluginContainer {
	private readonly _plugins: IPlugin[]
	private readonly _container: InversifyContainer
	private readonly _moduleBindingProcessor: Function
	private readonly _parent: Constructor | null

	constructor(
		plugins: IPlugin[],
		container: InversifyContainer,
		moduleBindingProcessor: Function,
		parent: Constructor | null
	) {
		this._plugins = plugins
		this._container = container
		this._moduleBindingProcessor = moduleBindingProcessor
		this._parent = parent
	}

	bindClass<T>(constructor: Constructor<T>): this {
		const processedConstructor = this._plugins.reduce(
			(previousConstructor: Constructor<T>, plugin: IPlugin) => plugin.onBindClass<T>(previousConstructor),
			constructor
		)
		this._container.bind<T>(processedConstructor).toSelf().inSingletonScope()
			.onActivation((_context, value) => this._plugins.reduce(
				(previousInstance: T, plugin: IPlugin) => plugin.onGet<T>(constructor, previousInstance),
				value
			))
		return this
	}

	bindConstant<T>(accessor: string | Constructor<T>, constant: T): this {
		const processedConstant = this._plugins.reduce(
			(previousConstant: T, plugin: IPlugin) => plugin.onBindConstant<T>(accessor, previousConstant),
			constant
		)
		this._container.bind<T>(accessor).toConstantValue(processedConstant)
			.onActivation((_context, value) => this._plugins.reduce(
				(previousInstance: T, plugin: IPlugin) => plugin.onGet<T>(accessor, previousInstance),
				value
			))
		return this
	}

	bindInterface<T>(accessor: string, constructor: Constructor<T>): this {
		const processedConstructor = this._plugins.reduce(
			(previousConstructor: Constructor<T>, plugin: IPlugin) =>
				plugin.onBindInterface<T>(accessor, previousConstructor),
			constructor
		)
		this._container.bind<T>(accessor).to(processedConstructor).inSingletonScope()
			.onActivation((_context, value) => this._plugins.reduce(
				(previousInstance: T, plugin: IPlugin) => plugin.onGet<T>(accessor, previousInstance),
				value
			))
		return this
	}

	getLogger<T = any>(key: Constructor<T> | string): ILogger {
		const loggerFactory = this.get<LoggerFactory>(LoggerFactory)
		return loggerFactory.getLogger(key)
	}

	immediate<T>(constructor: Constructor<T>): T {
		this.bindClass<T>(constructor)

		return this._container.get<T>(constructor)
	}

	isBound(accessor: string | Constructor): boolean {
		return this._container.isBound(accessor)
	}

	rebindClass<T>(constructor: Constructor<T>): this {
		const processedConstructor = this._plugins.reduce(
			(previousConstructor: Constructor<T>, plugin: IPlugin) => plugin.onRebindClass<T>(previousConstructor),
			constructor
		)
		this._container.rebind<T>(processedConstructor).toSelf()
			.onActivation((_context, value) => this._plugins.reduce(
				(previousInstance: T, plugin: IPlugin) => plugin.onGet<T>(constructor, previousInstance),
				value
			))
		return this
	}

	rebindConstant<T>(accessor: string | Constructor<T>, constant: T): this {
		const processedConstant = this._plugins.reduce(
			(previousConstant: T, plugin: IPlugin) => plugin.onRebindConstant<T>(accessor, previousConstant),
			constant
		)
		this._container.rebind<T>(accessor).toConstantValue(processedConstant)
			.onActivation((_context, value) => this._plugins.reduce(
				(previousInstance: T, plugin: IPlugin) => plugin.onGet<T>(accessor, previousInstance),
				value
			))
		return this
	}

	rebindInterface<T>(accessor: string, constructor: Constructor<T>): this {
		const processedConstructor = this._plugins.reduce(
			(previousConstructor: Constructor<T>, plugin: IPlugin) =>
				plugin.onRebindInterface<T>(accessor, previousConstructor),
			constructor
		)
		this._container.rebind<T>(accessor).to(processedConstructor)
			.onActivation((_context, value) => this._plugins.reduce(
				(previousInstance: T, plugin: IPlugin) => plugin.onGet<T>(constructor, previousInstance),
				value
			))
		return this
	}

	unbind(accessor: string | Constructor): this {
		if (
			!this._plugins.reduce(
				(previousBool: boolean, plugin: IPlugin) => plugin.onUnbind(accessor) && previousBool,
				true
			)
		) {
			return this
		}

		this._container.unbind(accessor)
		return this
	}

	bindModule<T>(moduleConstructor: Constructor<T>): IInjectContainer {
		const processedModuleConstructor: Constructor<T> = this._plugins.reduce(
			(previousConstructor: Constructor<T>, plugin: IPlugin) => plugin.onBindModule(previousConstructor),
			moduleConstructor
		)

		this._moduleBindingProcessor(processedModuleConstructor, this._parent)

		return this
	}

	get<T>(accessor: string | Constructor): T {
		return this._container.get<T>(accessor)
	}
}
