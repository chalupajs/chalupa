import { IConfigurator } from "./IConfigurator";
import {
	Constructor,
	ContainerConstant,
	ILogProvider,
	Injectable,
	InversifyContainer,
	InversifyMetadata
} from "@catamaranjs/interface";

export class LogProvider implements IConfigurator {
	private readonly _logProvider: Constructor<ILogProvider>
	constructor(logProvider: Constructor<ILogProvider>) {
		this._logProvider = logProvider
	}

	static provider(logProvider: Constructor<ILogProvider>): LogProvider {
		return new LogProvider(logProvider)
	}

	configure(container: InversifyContainer): void {
		// Bind logProvider
		const isLogProviderDecorated = Reflect.hasOwnMetadata(
			InversifyMetadata.PARAM_TYPES,
			this._logProvider
		)
		const injectableLogProvider = (
			isLogProviderDecorated ? this._logProvider : Injectable()(this._logProvider)
		) as Constructor<ILogProvider>
		container.rebind<ILogProvider>(ContainerConstant.LOG_PROVIDER_INTERFACE).to(injectableLogProvider)
	}

}
