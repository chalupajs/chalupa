import {
	Constructor,
	IIntermediateService,
	ILogger,
	InversifyContainer,
	LoggerFactory,
	ServiceOptions
} from "@catamaranjs/interface";
import { extractServiceOptions } from "../annotation_utils";
import { IServiceBridge } from "@catamaranjs/interface/src/Interpretation/IServiceBridge";
import { ServiceBridge } from "../ServiceBridge";

export class IntermediateService implements IIntermediateService {
	container: InversifyContainer
	serviceConstructor: Constructor

	serviceOptions: ServiceOptions

	private _logger: ILogger

	private _serviceBridgeSingleton?: IServiceBridge


	constructor(container: InversifyContainer, serviceConstructor: Constructor) {
		this.container = container;
		this.serviceConstructor = serviceConstructor;
		this.serviceOptions = extractServiceOptions(serviceConstructor)
		const loggerFactory = container.get<LoggerFactory>(LoggerFactory)
		this._logger = loggerFactory.getLogger('CommunicationLayer')
	}

	bindLogger(logger: ILogger): void {
		this._logger = logger
	}

	bridge(): IServiceBridge {
		if (typeof this._serviceBridgeSingleton === 'undefined') {
			this._serviceBridgeSingleton = new ServiceBridge(
				this.container,
				this.serviceConstructor,
				this.serviceOptions,
				this._logger
			)
		}
		return this._serviceBridgeSingleton
	}

	getServiceFromContainer(): any {
		return this.container.get<any>(this.serviceConstructor)
	}

}
