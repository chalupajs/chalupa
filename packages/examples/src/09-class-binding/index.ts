/*
 * 09. Class Binding
 *
 * 
 * Previously, we only injected configuration classes and LoggerFactories. In what follows
 * we create multiple classes and decorate them with @Injectable decorator to make
 * the dependency injectable. Then, we tell Chalupa to manage them in the context using
 * the context.bindClass() method. 
 * 
 * Topic: Dependency Injection
 * Showcased features:
 *   * @Injectable.
 *   * bindClass.
 *   * Injecting dependencies.
 */
import 'reflect-metadata'

import { LoggerFactory, Service, Injectable } from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'

// Classes decorated with @Service, @Module and @Configuration are automatically
// made injectable by Chalupa. In other cases you have to explicitly decorate
// the class with the @Injectable() decorator.
//
// This decorator marks a class as something that can be injected into other classes
// and something that can get its dependencies injected. If you forget this decorator,
// then Chalupa will throw a big fat error, telling that your class is not dependency
// injection compatible.
@Injectable()
class PizzaOven {}

@Injectable()
class DeliveryGuy {}

@Injectable()
class PizzaHouse {
    // Injecting a concrete class is dead simple: just use an ordinary
    // TypeScript constructor parameter and Chalupa will sort out the rest.
    constructor(loggerFactory: LoggerFactory, oven: PizzaOven, deliveryGuy: DeliveryGuy) {        
        const logger = loggerFactory.getLogger(PizzaHouse)

        logger.info(`Oven: ${oven}`)
        logger.info(`Delivery Guy: ${deliveryGuy}`)
    }
}

@Service({
    // The inject method is where you setup the context. Essentially,
    // you tell Chalupa which classes you want to use. Then, when you
    // create and start your service, Chalupa will handle the instantiation
    // for you.
    //
    // Here, we use the bindClass() method, which expects a class as its only
    // parameter. Calls to bindClass() can be chained to make the code more
    // concise.
    //
    // The below inject function is equivalent to the following shorthand notation:
    //
    //   @Service({
    //     inject: [PizzaHouse, DeliveryGuy, PizzaOven]   
    //   })
    //
    // If you're only using the bindClass() method, then the array form is a much shorter
    // and easier to read solution. Note, that you cannot use the array and the function form
    // simultaneously.
    //
    // Keep in mind, that generally no instantiation happens in the inject function. It's just
    // a description of the classes Chalupa needs to manage. 
    inject(context) {
        context
            .bindClass(PizzaHouse)
            .bindClass(DeliveryGuy)
            .bindClass(PizzaOven)
    }
})
class PizzaService {
    // PizzaService has a dependency on PizzaHouse, therefore, prior to
    // instantiating PizzaService, Chalupa needs to create a PizzaHouse instance.
    // Now, to create a new PizzaHouse instance, Chalupa first needs to instantiate
    // both the DeliveryGuy and the PizzaOven classes. Since these classes have no
    // dependencies, the chain ends, and dependency injection succeeds.
	constructor(loggerFactory: LoggerFactory, house: PizzaHouse) {
		const logger = loggerFactory.getLogger(PizzaService)

        logger.info(`House: ${house}`)
	}
}

async function start() {
	const service = await Chalupa
		.builder()
		.createServiceWithStrategy(PizzaService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
