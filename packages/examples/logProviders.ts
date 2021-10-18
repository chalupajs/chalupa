import "reflect-metadata"

import { Service } from '@catamaranjs/interface'
import { Catamaran, LogProvider } from '@catamaranjs/service'
import {DarconBuilderStrategy} from '@catamaranjs/communication-darcon'
import {TSLogProvider} from "../logger/tslog";

@Service()
class TestService {}

async function start() {
	const service = await Catamaran
		.builder()
		.use(LogProvider.provider(TSLogProvider))
		.createServiceWithStrategy(TestService, DarconBuilderStrategy)
	await service.start()
}

start().catch(console.error)
