import {
	Service, Configuration, Configurable, ServiceMethod
} from '@chalupajs/interface'
import {Chalupa, InMemoryStrategy} from "@chalupajs/service";

@Configuration()
export class OverridingConfig {
	@Configurable({
		doc: 'The directory into which data is saved.',
		format: String
	})
	dataDirectory: string = '/data/pizza'
}

@Service({
	inject: [OverridingConfig],
})
export class OverridingConfigurationsService {
	private readonly dataDirectory: string

	constructor(overridingConfig: OverridingConfig) {
		this.dataDirectory = overridingConfig.dataDirectory
	}

	@ServiceMethod()
	async getDataDirectory(): Promise<string> {
		return this.dataDirectory
	}
}

async function start() {
	const service = await Chalupa
		.builder()
		.createServiceWithStrategy(OverridingConfigurationsService, InMemoryStrategy)
	await service.start()
}

if (require.main === module) {
	start().catch(console.error)
}
