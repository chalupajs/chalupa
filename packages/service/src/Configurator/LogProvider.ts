import { IConfigurator } from "./IConfigurator";
import {
	Constructor,
	ContainerConstant,
	ILogProvider,
	InversifyContainer,
} from "@catamaranjs/interface";
import { ensureInjectable } from "@catamaranjs/interface/src/annotation_utils";

export class LogProvider implements IConfigurator {
	private readonly _logProvider: Constructor<ILogProvider>
	constructor(logProvider: Constructor<ILogProvider>) {
		this._logProvider = logProvider
	}

	static provider(logProvider: Constructor<ILogProvider>): LogProvider {
		return new LogProvider(logProvider)
	}

	configure(container: InversifyContainer): void {
		const injectableLogProvider = ensureInjectable(this._logProvider)
		container.rebind<ILogProvider>(ContainerConstant.LOG_PROVIDER_INTERFACE).to(injectableLogProvider)
	}

}