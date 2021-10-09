import { Catamaran, DarconBuilderStrategy } from '@catamaranjs/service'
import { Service, Module, Inject } from '@catamaranjs/interface'
import {PinoLogProvider} from '@catamaranjs/logger-pino'

@Module({
	constants: [['kekw', true]],
})
class RandomModule {
	private readonly _kekw: boolean

	constructor(@Inject('kekw') kekw: boolean) {
		this._kekw = kekw
		console.log(this._kekw)
	}
}

@Service({
	modules: [RandomModule],
	constants: [['kekw', false]],
	logProvider: PinoLogProvider
})
class TestService {}

async function start() {
	const service = await Catamaran.createServiceWithStrategy(TestService, DarconBuilderStrategy)
	await service.start()
}

start().catch(console.error)
