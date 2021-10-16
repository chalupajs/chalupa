import { Constructor, Service, ServiceOptions } from '@catamaranjs/interface'

export const ModuleHost = {
	fromModule(constructor: Constructor): Constructor {
		return ModuleHost.fromServiceOptions({
			modules: [constructor],
		})
	},

	fromServiceOptions(options: Partial<ServiceOptions>): Constructor {
		return Service(options)(class {})
	},
}
