import { AbstractPlugin, Constructor } from '@chalupajs/interface'

export interface ClassLevelOverrides<T = any> {
	config: Constructor<T>
	overrides: Partial<Record<keyof T, unknown>>
}

export class OverrideConfigBuilder {
	private readonly overrides: ClassLevelOverrides[]

	constructor() {
		this.overrides = []
	}

	add<T>(config: Constructor<T>, overrides: Partial<Record<keyof T, unknown>>): this {
		this.overrides.push({ config, overrides })

		return this
	}

	build(): OverrideConfig {
		return new OverrideConfig(this.overrides)
	}
}

export class OverrideConfig extends AbstractPlugin {
	private readonly overrides: ClassLevelOverrides[]

	static builder(): OverrideConfigBuilder {
		return new OverrideConfigBuilder()
	}

	constructor(overrides: ClassLevelOverrides[]) {
		super()
		this.overrides = overrides
	}

	onGet<T>(accessor: Constructor<T> | string, instance: T): T {
		const overridesForClass = this.overrides.find(o => o.config == accessor)
		if (overridesForClass) {
			// @ts-ignore
			return new Proxy(instance, {
				get(target: any, propertyKey: string, _receiver: any): any {
					if (!(propertyKey in overridesForClass.overrides)) {
						return target[propertyKey]
					}

					if (typeof target[propertyKey] === 'function') {
						return () => overridesForClass.overrides[propertyKey]
					}

					return overridesForClass.overrides[propertyKey]
				},
			})
		}

		return instance
	}
}
