import { AbstractPlugin, configurator, IPluginContainer } from '@chalupajs/interface'

export class ConfigSources extends AbstractPlugin {
	private readonly _configSources: string[]

	constructor(configSources: string[]) {
		super()
		this._configSources = configSources
	}

	static from(configSources: string[]): ConfigSources {
		return new ConfigSources(configSources)
	}

	async preCreation(_container: IPluginContainer): Promise<void> {
		configurator.withSources(this._configSources)
		return Promise.resolve()
	}
}
