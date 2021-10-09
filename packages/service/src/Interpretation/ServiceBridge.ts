import { IServiceBridge } from "@catamaranjs/interface/src/Interpretation/IServiceBridge";
import { Constructor, ILogger, InversifyContainer, Metadata, ServiceOptions } from "@catamaranjs/interface";
import { timeout } from "../util";

export class ServiceBridge implements IServiceBridge {
	private _container: InversifyContainer
	private _serviceConstructor: Constructor
	private _serviceOptions: ServiceOptions
	private _logger: ILogger

	private _service?: any
	private _moduleMethodArrays: Record<Metadata.ModuleLifecycle, any[]> = {
		[Metadata.ModuleLifecycle.PreServiceInit]: [],
		[Metadata.ModuleLifecycle.PostServiceInit]: [],
		[Metadata.ModuleLifecycle.PreServiceDestroy]: [],
		[Metadata.ModuleLifecycle.PostServiceDestroy]: []
	}

	private _serviceEventHandler?: (externalName: string, fn: any) => void
	private _serviceMethodHandler?: (externalName: string, fn: any) => void

	private _suppressMissingEventHandlerWarning: boolean = false
	private _suppressMissingMethodHandlerWarning: boolean = false

	constructor(container: InversifyContainer, serviceConstructor: Constructor, serviceOptions: ServiceOptions, logger: ILogger) {
		this._container = container;
		this._serviceConstructor = serviceConstructor;
		this._serviceOptions = serviceOptions;
		this._logger = logger;
	}

	private _getServiceFromContainer(): any {
		return this._container.get<any>(this._serviceConstructor)
	}

	private _ensureServiceBuilded() {
		if (typeof this._service === 'undefined') {
			this._service = this._getServiceFromContainer()
		}
	}

	suppressEventWarning(): IServiceBridge {
		this._suppressMissingEventHandlerWarning = true
		return this;
	}

	suppressMethodWarning(): IServiceBridge {
		this._suppressMissingMethodHandlerWarning = true
		return this;
	}



	private _collectLifecycleMetadata(symbol: Metadata.ModuleLifecycle, proto: any, instance: any) {
		const key: string = Reflect.getMetadata(symbol, proto)
		if (key) {
			this._moduleMethodArrays[symbol].push(instance[key].bind(instance))
		}
	}

	private _registerServiceMethodsAndServiceEvents (target: any, prototype: any) {
		const serviceMethodMap: Map<string, string> | undefined = Reflect.getMetadata(Metadata.METADATA_SERVICE_MAP, prototype)
		if(serviceMethodMap && typeof this._serviceMethodHandler !== 'undefined') {
			serviceMethodMap.forEach((propertyKey: string, externalName: string) => {
				this._serviceMethodHandler!(externalName, target[propertyKey].bind(target))
			})
		}
		const serviceEventMap: Map<string, string> | undefined = Reflect.getMetadata(Metadata.METADATA_EVENT_MAP, prototype)
		if(serviceEventMap && typeof this._serviceEventHandler !== 'undefined') {
			serviceEventMap.forEach((propertyKey: string, externalName: string) => {
				this._serviceEventHandler!(externalName, target[propertyKey].bind(target))
			})
		}
	}

	buildDependencyTree(): IServiceBridge {
		if(typeof this._serviceMethodHandler === 'undefined' && !this._suppressMissingMethodHandlerWarning) {
			this._logger.warn('Missing serviceMethodHandler in ServiceBridge during service building')
		}
		if(typeof this._serviceEventHandler === 'undefined' && !this._suppressMissingEventHandlerWarning) {
			this._logger.warn('Missing serviceEventHandler in ServiceBridge during service building')
		}
		this._ensureServiceBuilded()
		this._registerServiceMethodsAndServiceEvents(this._service, this._serviceConstructor.prototype)

		if(this._serviceOptions.modules?.length) {
			for (const module of this._serviceOptions.modules) {
				const moduleInstance = this._container.get(module)
				this._registerServiceMethodsAndServiceEvents(moduleInstance, module.prototype)

				this._collectLifecycleMetadata(
					Metadata.ModuleLifecycle.PreServiceInit,
					module.prototype,
					moduleInstance
				)
				this._collectLifecycleMetadata(
					Metadata.ModuleLifecycle.PostServiceInit,
					module.prototype,
					moduleInstance
				)
				this._collectLifecycleMetadata(
					Metadata.ModuleLifecycle.PreServiceDestroy,
					module.prototype,
					moduleInstance
				)
				this._collectLifecycleMetadata(
					Metadata.ModuleLifecycle.PostServiceDestroy,
					module.prototype,
					moduleInstance
				)
			}
		}

		return this;
	}

	private async _callModuleLifecycleMethods(symbol: Metadata.ModuleLifecycle) {
		return Promise.all(this._moduleMethodArrays[symbol].map(initMethod => initMethod()))
	}

	async callLifecycleMethodOnService(symbol: Metadata.ServiceLifecycle): Promise<IServiceBridge> {
		this._ensureServiceBuilded()

		await this._callModuleLifecycleMethods(
			(symbol === Metadata.ServiceLifecycle.PostInit)
				? Metadata.ModuleLifecycle.PreServiceInit
				: Metadata.ModuleLifecycle.PreServiceDestroy
		)
		const key: string | undefined = Reflect.getMetadata(symbol, this._serviceConstructor.prototype)
		if (typeof key !== 'undefined') {
			await this._service[key]()
		}
		await this._callModuleLifecycleMethods(
			(symbol === Metadata.ServiceLifecycle.PostInit)
				? Metadata.ModuleLifecycle.PostServiceInit
				: Metadata.ModuleLifecycle.PostServiceDestroy
		)
		return this
	}

	async callNetworkEvent(symbol: Metadata.NetworkEvent, parameters: any[]): Promise<IServiceBridge> {
		const propertyKey: string | null = Reflect.getMetadata(
			symbol,
			this._serviceConstructor.prototype
		)

		if (propertyKey) {
			this._ensureServiceBuilded()
			try {
				await this._service[propertyKey](...parameters)
			} catch (error: any) {
				this._logger.error(error)
			}
		}
		return this
	}

	async respectDelayedStart(): Promise<IServiceBridge> {
		if (this._serviceOptions.delayStart) {
			this._logger.info(`Waiting ${this._serviceOptions.delayStart} milliseconds for start`)
			await timeout(this._serviceOptions.delayStart)
			this._logger.info(`Delay ended!`)
		}
		return this
	}

	serviceEventHandler(cb: (externalName: string, fn: any) => void): IServiceBridge {
		this._serviceEventHandler = cb
		return this;
	}

	serviceMethodHandler(cb: (externalName: string, fn: any) => void): IServiceBridge {
		this._serviceMethodHandler = cb
		return this;
	}

}
