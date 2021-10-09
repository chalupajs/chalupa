import { Catamaran, Service, DarconBuilderStrategy } from '@catamaranjs/service'
import {PinoLogProvider} from '@catamaranjs/logger-pino'

@Service({
	delayStart: 5000,
	logProvider: PinoLogProvider
})
class TestService {}

async function start() {
	const service = await Catamaran.createServiceWithStrategy(TestService, DarconBuilderStrategy)
	await service.start()
}

start().catch(console.error)
