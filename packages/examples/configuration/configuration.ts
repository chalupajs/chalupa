import path from 'path'
import { Catamaran, IntegrationTestBuilderStrategy, } from '@catamaranjs/service'
import { Configuration, Configurable, Inject, Service, } from '@catamaranjs/interface'

@Configuration()
class PizzaConfig {
	@Configurable({
		format: 'nat'
	})
	bakingTime = 180
}

@Service({
	config: PizzaConfig,
	configSources: [path.join(__dirname, '/local.yml')],
})
class PizzaService {
	constructor(@Inject(PizzaConfig) config: PizzaConfig) {
		console.log(config.bakingTime)
	}
}

async function start() {
	const service = await Catamaran.createServiceWithStrategy(PizzaService, IntegrationTestBuilderStrategy)
	const systemUnderTest = await service.start()

	systemUnderTest.getServiceOrModule(PizzaService)

	await systemUnderTest.close()
}

start().catch(console.error)
