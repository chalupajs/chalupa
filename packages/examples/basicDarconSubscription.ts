import "reflect-metadata"

import { Service } from '@catamaranjs/interface'
import { Catamaran } from '@catamaranjs/service'
import {DarconBuilderStrategy} from '@catamaranjs/communication-darcon'

@Service()
class TestService {}

async function start() {
	const service = await Catamaran.createServiceWithStrategy(TestService, DarconBuilderStrategy)
	await service.start()
}

start().catch(console.error)
