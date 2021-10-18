import { ContainerConstant, InversifyContainer } from '@catamaranjs/interface'
import { IPlugin } from '../Plugin/IPlugin'

export class EnvPrefix implements IPlugin {
	constructor(private readonly prefix: string) {}

	static from(prefix: string): EnvPrefix {
		return new EnvPrefix(prefix)
	}

	configure(container: InversifyContainer): void {
		container.bind<string>(ContainerConstant.ENV_PREFIX).toConstantValue(this.prefix)
	}
}
