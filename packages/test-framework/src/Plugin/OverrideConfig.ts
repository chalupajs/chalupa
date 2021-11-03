import {AbstractPlugin, Constructor} from "@catamaranjs/interface";

export interface ClassLevelOverrides<T = any> {
	config: Constructor<T>,
	overrides: Partial<Record<keyof T, unknown>>
}

export class OverrideConfig extends AbstractPlugin {
	private readonly overrides: [ClassLevelOverrides]

	static with(overrides: [ClassLevelOverrides]): OverrideConfig {
		return new OverrideConfig(overrides)
	}

	private constructor(overrides: [ClassLevelOverrides]) {
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
				}
			})
		}

		return instance
	}
}
