import { Catamaran } from '@catamaranjs/service'
import {DarconBuilderStrategy} from '@catamaranjs/communication-darcon'
import {PinoLogProvider} from '@catamaranjs/logger-pino'
import { Service } from "@catamaranjs/interface";

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
