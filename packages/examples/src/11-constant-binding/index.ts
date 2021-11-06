/*
 * 11. Constant Binding
 *
 * 
 * In the case of class and interface bindings, instantiation is handled by
 * Chalupa, and we're only telling it which classes to create. However, in some
 * situations, we want to handle instantiations ourselves or want to bind literal
 * values (such as strings or numbers). These are the exact use cases for the
 * bindConstant() method.  
 * 
 * Topic: Dependency Injection
 * Showcased features:
 *   * @Inject.
 *   * bindConstant.
 *   * Injecting dependencies.
 */
import 'reflect-metadata'

import { LoggerFactory, Service, Inject } from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'

interface IDateTimeSource {
    now(): number
}

// This class will be instantiated by us and not Chalupa.
// Hence, in this case, we do not need to use the @Injectable()
// decorator. 
class BuiltInDateTimeSource implements IDateTimeSource {
    now(): number {
        return Date.now()
    }
}

const Types = {
    IDateTimeSource: 'IDateTimeSource'
}

// The same way we have to use type keys to relate
// interface bindings and dependency sites, we have to
// create keys for constant/literal values as well. 
const Constants = {
    TodaysPizzaChef: 'TodaysPizzaChef'
}

@Service({
    // bindConstant() works just like bindInterface(). First, we specify
    // a key that is going to identify the binding. When we wish to inject
    // the constant, you have to use the same key in the @Inject decorator.
    // Then, the second parameter is the actual value, bound to the key.
    // 
    // The first binding, TodaysPizzaChef is the most frequent use case for
    // constants bindings: supplying a literal value into the context.
    // Then, we instantiate an implementation of the IDateTimeSource by hand
    // and bind the instance to the appropriate type key. Such a pattern is
    // mostly relevant for testing purposes, however, it might be usable in
    // ordinary application code as well.
    //
    // The below inject function is equivalent to the following shorthand notation:
    //
    //   @Service({
    //     constants: [
    //       [Constants.TodaysPizzaChef, 'Giovanni'],
    //       [Types.IDateTimeSource, new BuiltInDateTimeSource()]
    //     ] 
    //   })
	inject(context) {
		context
            .bindConstant(Constants.TodaysPizzaChef, 'Giovanni')
            .bindConstant(Types.IDateTimeSource, new BuiltInDateTimeSource())
	}
})
class PizzaService {
    // Since we created the bindings based on constant/type keys, we
    // have to use the @Inject annotation for the actual injection
    // as well.
    // Observe, that in the case of Types.IDateTimeSource, even though
    // we used a constant binding, we specified the interface as the
    // parameter type instead of the BuiltInDateTimeSource implementation.
	constructor(
        loggerFactory: LoggerFactory,
        @Inject(Constants.TodaysPizzaChef) chef: string,
        @Inject(Types.IDateTimeSource) dateTimeSource: IDateTimeSource
    ) {
		const logger = loggerFactory.getLogger(PizzaService)

        logger.info(chef)
        logger.info(`The current time is ${dateTimeSource.now()}`)
	}
}

async function start() {
	const service = await Chalupa
		.builder()
		.createServiceWithStrategy(PizzaService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
