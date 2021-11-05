import {Catamaran, LogProvider} from '@chalupajs/service'
import {DarconBuilderStrategy} from '@chalupajs/communication-darcon'
import {PinoLogProvider} from '@chalupajs/logger-pino'
import { Service } from "@chalupajs/interface";

@Service({
	delayStart: 5000
})
class TestService {}

async function start() {
	const service = await Catamaran
		.builder()
		.use(LogProvider.provider(PinoLogProvider))
		.createServiceWithStrategy(TestService, DarconBuilderStrategy)
	await service.start()
}

start().catch(console.error)
