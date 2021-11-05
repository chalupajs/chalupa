import {
	Constructor,
	IIntermediateService,
	ILogger,
	InversifyContainer,
	LoggerFactory,
	ServiceOptions,
	IDependencyGraph,
	IPlugin,
} from '@chalupajs/interface'
import { IServiceBridge } from '@chalupajs/interface/src/Interpretation/IServiceBridge'
import { extractServiceOptions } from '../annotation_utils'
import { ServiceBridge } from '../ServiceBridge'

export class IntermediateService implements IIntermediateService {
	container: InversifyContainer
	serviceConstructor: Constructor

	serviceOptions: ServiceOptions

	private _logger: ILogger

	private _serviceBridgeSingleton?: IServiceBridge

	private _plugins: IPlugin[]

	constructor(
		container: InversifyContainer,
		serviceConstructor: Constructor,
		public readonly moduleDependencyGraph: IDependencyGraph<Constructor>,
		plugins: IPlugin[]
	) {
		this.container = container
		this.serviceConstructor = serviceConstructor
		this.serviceOptions = extractServiceOptions(serviceConstructor)
		const loggerFactory = container.get<LoggerFactory>(LoggerFactory)
		this._logger = loggerFactory.getLogger('CommunicationLayer')
		this._plugins = plugins
	}

	bridge(): IServiceBridge {
		if (typeof this._serviceBridgeSingleton === 'undefined') {
			this._serviceBridgeSingleton = new ServiceBridge(
				this.container,
				this.serviceConstructor,
				this.serviceOptions,
				this._logger,
				this.moduleDependencyGraph,
				this._plugins
			)
		}

		return this._serviceBridgeSingleton
	}
}
