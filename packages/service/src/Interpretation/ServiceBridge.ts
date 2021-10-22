import { IServiceBridge } from '@catamaranjs/interface/src/Interpretation/IServiceBridge'
import {
	Constructor,
	ILogger,
	InversifyContainer,
	Metadata,
	ServiceOptions,
	IDependencyGraph,
	ICommunicationFacade,
	IServiceBridgeOrchestrator,
	IPlugin,
} from '@catamaranjs/interface'
import { Container } from './Container'
import { extractServiceEventMap, extractServiceMethodMap } from './annotation_utils'

function createCallableMethod(target: any, propertyKey: string, prototype: any) {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
	const callableFunction: (...parameters: any[]) => Promise<any> = target[propertyKey].bind(target)
	return (parameters: any[], _terms: Record<string, any>): Promise<any> => {
		const termsIndex: number | undefined = Reflect.getOwnMetadata(
			Metadata.METADATA_TERMS_INDEX,
			prototype,
			propertyKey
		) as number | undefined
		if (typeof termsIndex === 'undefined') {
			return callableFunction(...parameters)
		}

		return callableFunction(...parameters.slice(0, termsIndex), _terms)
	}
}

export class ServiceBridge implements IServiceBridge {
	private readonly _container: InversifyContainer
	private readonly _serviceConstructor: Constructor
	private _serviceOptions: ServiceOptions
	private _logger: ILogger

	private readonly _plugins: IPlugin[]

	private _service?: any
	private _moduleMethodArrays: Record<Metadata.ModuleLifecycle, any[]> = {
		[Metadata.ModuleLifecycle.PreServiceInit]: [],
		[Metadata.ModuleLifecycle.PostServiceInit]: [],
		[Metadata.ModuleLifecycle.PreServiceDestroy]: [],
		[Metadata.ModuleLifecycle.PostServiceDestroy]: [],
	}

	// eslint-disable-next-line max-params
	constructor(
		container: InversifyContainer,
		serviceConstructor: Constructor,
		serviceOptions: ServiceOptions,
		logger: ILogger,
		private readonly moduleDependencyGraph: IDependencyGraph<Constructor>,
		plugins: IPlugin[]
	) {
		this._container = container
		this._serviceConstructor = serviceConstructor
		this._serviceOptions = serviceOptions
		this._logger = logger
		this._plugins = plugins
	}

	useFacade(facade: Constructor<ICommunicationFacade>): IServiceBridgeOrchestrator {
		const self = this

		const pluginContainer = new Container(this._plugins, this._container, () => {}, null)
		const facadeInstance = new facade(pluginContainer)

		facadeInstance.onServiceAppeared(this.callServiceAppeared.bind(this))
		facadeInstance.onServiceDisappeared(this.callServiceDisappeared.bind(this))

		async function start() {
			await facadeInstance.init(self._serviceOptions.name)
			await facadeInstance.connectToNetwork()

			self.buildDependencyTree(facadeInstance)

			const preStartResponse: boolean[] = await Promise.all(
				self._plugins.map(plugin => plugin.preStart(pluginContainer))
			)

			if (!preStartResponse.reduce((previous, curr) => previous && curr, true)) {
				// eslint-disable-next-line unicorn/no-process-exit
				process.exit(1)
			}

			await self.callLifecycleMethodOnService(Metadata.ServiceLifecycle.PostInit)

			await facadeInstance.publishSelf()

			await Promise.all(self._plugins.map(plugin => plugin.postStart(pluginContainer)))
		}

		async function close() {
			await Promise.all(self._plugins.map(plugin => plugin.preClose(pluginContainer)))

			await self.callLifecycleMethodOnService(Metadata.ServiceLifecycle.PreDestroy)
			await facadeInstance.closeSelf()
			await Promise.all(self._plugins.map(plugin => plugin.postClose(pluginContainer)))
		}

		process.on('SIGINT', () => {
			void close()
		})
		process.on('SIGTERM', () => {
			void close()
		})

		return {
			start,
			close,
		}
	}

	private _getServiceFromContainer(): any {
		return this._container.get<any>(this._serviceConstructor)
	}

	private _ensureServiceBuilded() {
		if (typeof this._service === 'undefined') {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			this._service = this._getServiceFromContainer()
		}
	}

	private _collectLifecycleMetadata(symbol: Metadata.ModuleLifecycle, proto: any, instance: any) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const key: string = Reflect.getMetadata(symbol, proto)
		if (key) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
			this._moduleMethodArrays[symbol].push(instance[key].bind(instance))
		}
	}

	private _registerServiceMethodsAndServiceEvents(facade: ICommunicationFacade, target: any, prototype: any) {
		const serviceMethodMap = extractServiceMethodMap(prototype)
		const serviceEventMap = extractServiceEventMap(prototype)

		serviceMethodMap?.forEach((propertyKey: string, externalName: string) => {
			facade.addMethodHandler(externalName, createCallableMethod(target, propertyKey, prototype))
		})

		serviceEventMap?.forEach((propertyKey: string, externalName: string) => {
			facade.addEventHandler(externalName, createCallableMethod(target, propertyKey, prototype))
		})
	}

	buildDependencyTree(facade: ICommunicationFacade): IServiceBridge {
		this._ensureServiceBuilded()
		this._registerServiceMethodsAndServiceEvents(facade, this._service, this._serviceConstructor.prototype)

		for (const moduleName of this.moduleDependencyGraph.overallOrder()) {
			const constructor = this.moduleDependencyGraph.getNodeData(moduleName)
			if (!constructor) {
				continue
			}

			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const instance = this._container.get(constructor)

			this._registerServiceMethodsAndServiceEvents(facade, instance, constructor.prototype)

			this._collectLifecycleMetadata(Metadata.ModuleLifecycle.PreServiceInit, constructor.prototype, instance)
			this._collectLifecycleMetadata(Metadata.ModuleLifecycle.PostServiceInit, constructor.prototype, instance)
			this._collectLifecycleMetadata(Metadata.ModuleLifecycle.PreServiceDestroy, constructor.prototype, instance)
			this._collectLifecycleMetadata(Metadata.ModuleLifecycle.PostServiceDestroy, constructor.prototype, instance)
		}

		this._moduleMethodArrays[Metadata.ModuleLifecycle.PreServiceDestroy].reverse()
		this._moduleMethodArrays[Metadata.ModuleLifecycle.PostServiceDestroy].reverse()

		return this
	}

	private async _callModuleLifecycleMethods(symbol: Metadata.ModuleLifecycle) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
		return Promise.all(this._moduleMethodArrays[symbol].map(initMethod => initMethod()))
	}

	async callLifecycleMethodOnService(symbol: Metadata.ServiceLifecycle): Promise<IServiceBridge> {
		this._ensureServiceBuilded()

		await this._callModuleLifecycleMethods(
			symbol === Metadata.ServiceLifecycle.PostInit
				? Metadata.ModuleLifecycle.PreServiceInit
				: Metadata.ModuleLifecycle.PreServiceDestroy
		)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const key: string | undefined = Reflect.getMetadata(symbol, this._serviceConstructor.prototype)
		if (typeof key !== 'undefined') {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
			await this._service[key]()
		}

		await this._callModuleLifecycleMethods(
			symbol === Metadata.ServiceLifecycle.PostInit
				? Metadata.ModuleLifecycle.PostServiceInit
				: Metadata.ModuleLifecycle.PostServiceDestroy
		)
		return this
	}

	async callServiceAppeared(serviceName: string): Promise<void> {
		await Promise.all(this._plugins.map(plugin => plugin.onServiceAppeared(serviceName)))
		await this.callNetworkEvent(Metadata.METADATA_SERVICE_APPEARED, serviceName)
	}

	async callServiceDisappeared(serviceName: string): Promise<void> {
		await Promise.all(this._plugins.map(plugin => plugin.onServiceDisappeared(serviceName)))
		await this.callNetworkEvent(Metadata.METADATA_SERVICE_DISAPPEARED, serviceName)
	}

	private async callNetworkEvent(symbol: string, serviceName: string): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const propertyKey: string | null = Reflect.getMetadata(symbol, this._serviceConstructor.prototype)

		if (propertyKey) {
			this._ensureServiceBuilded()
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
				await this._service[propertyKey](serviceName)
			} catch (error: any) {
				this._logger.error(error)
			}
		}
	}
}
