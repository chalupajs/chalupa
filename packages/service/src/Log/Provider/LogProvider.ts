import { Constructor, ContainerConstant, ILogProvider, InversifyContainer } from '@catamaranjs/interface'
import { ensureInjectable } from '@catamaranjs/interface/src/annotation_utils'
import { IPlugin } from '../../Plugin/IPlugin'

export class LogProvider implements IPlugin {
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
