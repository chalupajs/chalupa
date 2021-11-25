/*
 * 17. My First Module
 *
 * 
 * In this example, instead of creating a monolithic service, as we've done previously,
 * we try out something new: creating a module. Modules allow for code reuse and separation
 * of concerns. They are like mini-services (they can create bindings, have methods/events and even
 * have lifecycle decorators) that need a host service to actually execute in.
 * 
 * Topic: Modules
 * Showcased features:
 *   * @Module and the modules array.
 *   * Lifecycle decorators: ServiceInit and ServiceDestroy.
 */
import 'reflect-metadata'

import { ILogger, PreServiceInit, PreServiceDestroy, PostServiceDestroy, PostServiceInit, PostInit, PreDestroy, LoggerFactory, Service, Module, Injectable} from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'

@Injectable()
class DeliveryGuy {}

// @Module works the same way as @Service does: it marks a class as a module.
// Similarly to @Service, it takes an optional parameter in which we can configure
// the module.
@Module({
    // The inject property of the module options object works the same way
    // as that of the service options: it can either be an array of class bindings
    // or a function taking the context as its only parameter.
    //
    // Here, we use the shorthand array notation to create a class binding forű
    // the DeliveryGuy class.
    inject: [DeliveryGuy]
})
class DeliveryModule {
    private readonly logger: ILogger

    constructor(loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.getLogger(DeliveryModule)
    }

    // Each module can have at most one method decorated with the
    // @PreServiceInit lifecycle decorator. The method will run
    // prior to the @ServiceInit lifecycle method of the containing
    // service.
    //
    // The other decorated methods of the module work similarly
    // to this one.
    @PreServiceInit()
    preServiceInit() {
        this.logger.info('PreServiceInit')
    }

    @PostServiceInit()
    postServiceInit() {
        this.logger.info('PostServiceInit')
    }

    @PreServiceDestroy()
    preServiceDestroy() {
        this.logger.info('PreServiceDestroy')
    }

    @PostServiceDestroy()
    postServiceDestroy() {
        this.logger.info('PostServiceDestroy')
    }
}

@Service({
    // A modules and services can import other modules in the
    // modules shorthand array or in the inject function. Chalupa will
    // import the bindings from these modules into a single, shared context.
    // Therefore, the service and the modules can depend on the bindings
    // added by the imported modules.
    //
    // The below modules array is equivalent to the following inject function:
    //
    //   @Service({
    //     inject(context) {
    //       context.bindModule(DeliveryModule)    
    //     }
    //   })
	modules: [DeliveryModule]
})
class PizzaService {
    private readonly logger: ILogger

    // Since every binding lives in a single, shared context, the service
    // can access the DeliveryGuy binding of the DeliveryModule. Using
    // this feat, we simply inject DeliveryGuy into the service via
    // an ordinary TypeScript constructor parameter.
	constructor(loggerFactory: LoggerFactory, deliveryGuy: DeliveryGuy) {
		this.logger = loggerFactory.getLogger(PizzaService)

        this.logger.info(`Delivery guy: ${deliveryGuy}`)
	}

    @PostInit()
    postInit() {
        this.logger.info('PostInit')
    }

    @PreDestroy()
    preDestroy() {
        this.logger.info('PreDestroy')
    }
}

async function start() {
	const service = await Chalupa
		.builder()
		.createServiceWithStrategy(PizzaService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
