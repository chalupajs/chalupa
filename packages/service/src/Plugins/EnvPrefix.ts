import {
	AbstractPlugin,
	Constructor,
	ensureInjectable,
	isConfiguration, reconfigureToEnvPrefix
} from '@catamaranjs/interface'

export class EnvPrefix extends AbstractPlugin {
	private readonly prefix: string

	constructor(prefix: string) {
		super()
		this.prefix = prefix
	}

	static from(prefix: string): EnvPrefix {
		return new EnvPrefix(prefix)
	}

	onBindClass<T>(constructor: Constructor<T>): Constructor<T> {
		return isConfiguration(constructor) ? reconfigureToEnvPrefix(this.prefix, ensureInjectable(constructor)) : constructor
	}

	onRebindClass<T>(constructor: Constructor<T>): Constructor<T> {
		return isConfiguration(constructor) ? reconfigureToEnvPrefix(this.prefix, ensureInjectable(constructor)) : constructor
	}
}
