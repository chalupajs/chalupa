import { IServiceBridge } from '@catamaranjs/interface/src/Interpretation/IServiceBridge'
import {
	Constructor,
	ILogger,
	InversifyContainer,
	Metadata,
	ServiceOptions,
	IDependencyGraph,
	ICommunicationFacade,
	IServiceBridgeOrchestrator, IPlugin,
} from '@catamaranjs/interface'
import { Container } from './Container'
import { extractServiceEventMap, extractServiceMethodMap } from './annotation_utils'

function createCallableMethod(callableFunction: (...params: any[]) => Promise<any>) {
	return (parameters: any[], _terms: Record<string, any>): Promise<any> => {
		return callableFunction(...parameters)
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

			await Promise.all([...self._plugins.map(plugin => plugin.preStart(pluginContainer))])

			await self.callLifecycleMethodOnService(Metadata.ServiceLifecycle.PostInit)

			await facadeInstance.publishSelf()

			await Promise.all([...self._plugins.map(plugin => plugin.postStart(pluginContainer))])

			process.on('SIGINT', async () => {
				await close()
			})
		}

		async function close() {
			await Promise.all([...self._plugins.map(plugin => plugin.preClose(pluginContainer))])

			await self.callLifecycleMethodOnService(Metadata.ServiceLifecycle.PreDestroy)
			await facadeInstance.closeSelf()
			await Promise.all([...self._plugins.map(plugin => plugin.postClose(pluginContainer))])
		}


		return {
			start,
			close
		}
	}

	private _getServiceFromContainer(): any {
		return this._container.get<any>(this._serviceConstructor)
	}

	private _ensureServiceBuilded() {
		if (typeof this._service === 'undefined') {
			this._service = this._getServiceFromContainer()
		}
	}


	private _collectLifecycleMetadata(symbol: Metadata.ModuleLifecycle, proto: any, instance: any) {
		const key: string = Reflect.getMetadata(symbol, proto)
		if (key) {
			this._moduleMethodArrays[symbol].push(instance[key].bind(instance))
		}
	}

	private _registerServiceMethodsAndServiceEvents(facade: ICommunicationFacade, target: any, prototype: any) {
		const serviceMethodMap = extractServiceMethodMap(prototype)
		const serviceEventMap = extractServiceEventMap(prototype)

		serviceMethodMap?.forEach((propertyKey: string, externalName: string) => {
			facade.addMethodHandler(externalName, createCallableMethod(target[propertyKey].bind(target)))
		})

		serviceEventMap?.forEach((propertyKey: string, externalName: string) => {
			facade.addEventHandler(externalName, createCallableMethod(target[propertyKey].bind(target)))
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
		return Promise.all(this._moduleMethodArrays[symbol].map(initMethod => initMethod()))
	}

	async callLifecycleMethodOnService(symbol: Metadata.ServiceLifecycle): Promise<IServiceBridge> {
		this._ensureServiceBuilded()

		await this._callModuleLifecycleMethods(
			symbol === Metadata.ServiceLifecycle.PostInit
				? Metadata.ModuleLifecycle.PreServiceInit
				: Metadata.ModuleLifecycle.PreServiceDestroy
		)
		const key: string | undefined = Reflect.getMetadata(symbol, this._serviceConstructor.prototype)
		if (typeof key !== 'undefined') {
			await this._service[key]()
		}

		await this._callModuleLifecycleMethods(
			symbol === Metadata.ServiceLifecycle.PostInit
				? Metadata.ModuleLifecycle.PostServiceInit
				: Metadata.ModuleLifecycle.PostServiceDestroy
		)
		return this
	}

	async callServiceAppeared(serviceName: string): Promise<IServiceBridge> {
		await Promise.all([...this._plugins.map(plugin => plugin.onServiceAppeared(serviceName))])
		return this.callNetworkEvent(Metadata.METADATA_SERVICE_APPEARED, serviceName)
	}

	async callServiceDisappeared(serviceName: string): Promise<IServiceBridge> {
		await Promise.all([...this._plugins.map(plugin => plugin.onServiceDisappeared(serviceName))])
		return this.callNetworkEvent(Metadata.METADATA_SERVICE_DISAPPEARED, serviceName)
	}

	private async callNetworkEvent(symbol: string, serviceName: string): Promise<IServiceBridge> {
		const propertyKey: string | null = Reflect.getMetadata(symbol, this._serviceConstructor.prototype)

		if (propertyKey) {
			this._ensureServiceBuilded()
			try {
				await this._service[propertyKey](serviceName)
			} catch (error: any) {
				this._logger.error(error)
			}
		}

		return this
	}

}
