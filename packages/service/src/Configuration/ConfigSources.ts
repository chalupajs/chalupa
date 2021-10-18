import { ContainerConstant, InversifyContainer } from '@catamaranjs/interface'
import { IPlugin } from '../Plugin/IPlugin'

export class ConfigSources implements IPlugin {
	private readonly _configSources: string[]

	constructor(configSources: string[]) {
		this._configSources = configSources
	}

	static from(configSources: string[]): ConfigSources {
		return new ConfigSources(configSources)
	}

	configure(container: InversifyContainer): void {
		container.bind<string[]>(ContainerConstant.CONFIG_SOURCES).toConstantValue(this._configSources)
	}
}
