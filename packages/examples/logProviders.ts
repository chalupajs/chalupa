import "reflect-metadata"

import { Service } from '@catamaranjs/interface'
import { Catamaran } from '@catamaranjs/service'
import {DarconBuilderStrategy} from '@catamaranjs/communication-darcon'
import { TSLogProvider } from "../logger/tslog";

@Service()
class TestService {}

async function start() {
	Catamaran.useLogger(TSLogProvider)
	const service = await Catamaran.createServiceWithStrategy(TestService, DarconBuilderStrategy)
	await service.start()
}

start().catch(console.error)
