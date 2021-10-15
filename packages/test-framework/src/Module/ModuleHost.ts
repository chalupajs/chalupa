import {Constructor, Service, ServiceOptions} from "@catamaranjs/interface";

export class ModuleHost {
	static fromModule(constructor: Constructor): Constructor {
		return ModuleHost.fromServiceOptions({
			modules: [constructor]
		})
	}

	static fromServiceOptions(options: Partial<ServiceOptions>): Constructor {
		return Service(options)(class {})
	}

	private constructor() {}
}
