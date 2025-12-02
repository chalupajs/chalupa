import path from 'path'
import { Chalupa, ConfigSources } from '@chalupajs/service'
import { IntegrationTestBuilderStrategy } from '@chalupajs/test-framework'
import { Configuration, Configurable, Inject, Service } from '@chalupajs/interface'

@Configuration()
class PizzaConfig {
	@Configurable({
		format: 'nat'
	})
	bakingTime = 180
}

@Service({
	inject: [PizzaConfig]
})
class PizzaService {
	constructor(@Inject(PizzaConfig) config: PizzaConfig) {
		console.log(config.bakingTime)
	}
}

async function start() {
	const builder = Chalupa.builder()
	builder.use(ConfigSources.from([path.join(__dirname, 'local.yml')]))
	const service = await builder.createServiceWithStrategy(PizzaService, IntegrationTestBuilderStrategy)
	const systemUnderTest = await service.start()

	systemUnderTest.getServiceOrModule(PizzaService)

	await systemUnderTest.close()
}

start().catch(console.error)
