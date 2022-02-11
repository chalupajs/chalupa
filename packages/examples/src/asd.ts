/*
 * 01. My First Service
 *
 *
 * In this example, we create a new service (that can execute on its own)
 * and attach it to an in-memory event bus.
 *
 * Once the service is ready to operate, it logs a message to the console.
 *
 * Showcased features:
 *   * Chalupa logging.
 *   * Injecting dependencies.
 *   * @PostInit.
 *   * Instantiating and starting services.
 */
import 'reflect-metadata'

import {ILogger, Injectable, LoggerFactory, PostInit, Service} from '@chalupajs/interface'
import {
	Chalupa,
	InMemoryStrategy,
	makeAspectDecorator,
	MethodAspect,
	MethodAspectPlugin, MethodCall,
	NextAspect
} from '@chalupajs/service'

@Injectable()
class TimedAspect implements MethodAspect<void> {
	wrap(call: MethodCall<any>, next: NextAspect): unknown {
		const start = process.hrtime.bigint()

		const result = next(call.parameters, call.terms)

		const end = process.hrtime.bigint()

		console.log(`Took ${end - start} nanoseconds`);

		return result
	}
}

const Timed = makeAspectDecorator(TimedAspect)

@Injectable()
class PushNumberAspect implements MethodAspect<number> {
	wrap(call: MethodCall<number>, next: NextAspect): unknown {
		(call.parameters as [number[]])[0].push(call.decoratorParameterization)

		return next(call.parameters, call.terms)
	}
}

const PushNumber = makeAspectDecorator(PushNumberAspect)

@Service({
	async inject(context) {
		context
			.bindClass(TimedAspect)
			.bindClass(PushNumberAspect)
	}
})
class MyFirstService {
	private readonly logger: ILogger

	// This is equivalent to
	//
	//   @Inject(LoggerFactory) loggerFactory: LoggerFactory
	//
	// However, since LoggerFactory is a concrete class, you
	// can omit the @Inject decorator.
	constructor(loggerFactory: LoggerFactory) {
		this.logger = loggerFactory.getLogger(MyFirstService)
	}

	@PostInit()
	async postInit() {
		this.logger.info('My First Service Post Init!')
		this.doThing()
		this.printNumbers([])
	}

	@Timed({})
	@Timed({})
	@Timed({})
	doThing() {
		console.log('do')
	}

	@PushNumber(3)
	@PushNumber(2)
	@PushNumber(1)
	printNumbers(nums: number[]) {
		console.log(nums)
	}
}

async function start() {
	const service = await Chalupa
		.builder()
		.use(new MethodAspectPlugin())
		.createServiceWithStrategy(MyFirstService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
