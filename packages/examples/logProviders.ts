import "reflect-metadata"

import { Service } from '@chalupajs/interface'
import { Catamaran, LogProvider } from '@chalupajs/service'
import {DarconBuilderStrategy} from '@chalupajs/communication-darcon'
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
