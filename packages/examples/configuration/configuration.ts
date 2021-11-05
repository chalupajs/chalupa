import path from 'path'
import { Catamaran, IntegrationTestBuilderStrategy, ConfigSources } from '@chalupajs/service'
import { Configuration, Configurable, Inject, Service } from '@chalupajs/interface'

@Configuration()
class PizzaConfig {
	@Configurable({
		format: 'nat'
	})
	bakingTime = 180
}

@Service({
	config: PizzaConfig
})
class PizzaService {
	constructor(@Inject(PizzaConfig) config: PizzaConfig) {
		console.log(config.bakingTime)
	}
}

async function start() {
	Catamaran.use(ConfigSources.from([path.join(__dirname, 'local.yml')]))
	const service = await Catamaran.createServiceWithStrategy(PizzaService, IntegrationTestBuilderStrategy)
	const systemUnderTest = await service.start()

	systemUnderTest.getServiceOrModule(PizzaService)

	await systemUnderTest.close()
}

start().catch(console.error)
