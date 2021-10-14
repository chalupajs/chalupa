import { ContainerConstant, InversifyContainer } from "@catamaranjs/interface";
import { IConfigurator } from "./IConfigurator";

export class ConfigSources implements IConfigurator {
	private readonly _configSources: string[]

	constructor(configSources: string[]) {
		this._configSources = configSources;
	}

	static from(configSources: string[]): ConfigSources {
		return new ConfigSources(configSources)
	}

	configure(container: InversifyContainer): void {
		container.bind<string[]>(ContainerConstant.CONFIG_SOURCES).toConstantValue(this._configSources)
	}

}
