import "reflect-metadata"

import { Service } from '@chalupajs/interface'
import { Catamaran } from '@chalupajs/service'
import {DarconBuilderStrategy} from '@chalupajs/communication-darcon'

@Service()
class TestService {}

async function start() {
	const service = await Catamaran
		.builder()
		.createServiceWithStrategy(TestService, DarconBuilderStrategy)
	await service.start()
}

start().catch(console.error)
