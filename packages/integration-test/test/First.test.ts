// @ts-ignore
const log = require('why-is-node-running')
import {Catamaran} from "@catamaranjs/service";
import {ModuleHost} from "../src/Module/ModuleHost";
import {ILogger, LoggerFactory, Module, PostServiceDestroy, PreServiceInit} from "@catamaranjs/interface";
import {IntegrationTestBuilderStrategy} from "../src/Service/IntegrationTestBuilderStrategy";

@Module()
class ExampleModule {
	private readonly logger: ILogger

	constructor(loggerFactory: LoggerFactory) {
		this.logger = loggerFactory.getLogger('Example')
	}

	@PreServiceInit()
	init() {
		this.logger.info('pre')
	}

	@PostServiceDestroy()
	destroy() {
		this.logger.info('post')
	}
}

describe('', () => {
	it('a', async () => {
		const arrangement = await Catamaran.createServiceWithStrategy(
			ModuleHost.fromModule(ExampleModule),
			IntegrationTestBuilderStrategy
		)

		const sut = await arrangement.start()

		console.log(sut.getServiceOrModule(ExampleModule))

		await sut.close()
	})
})
