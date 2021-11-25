/*
 * 15. Rebinding
 *
 * 
 * As seen in the previous example, multiple calls to bindInterface with the same
 * type key will not overwrite the binding for that key, but actually extend it into
 * a multibinding/multi-inject. If we want to replace or overwrite a previously added
 * binding, then we have to use the rebind family of methods. 
 * 
 * Topic: Dependency Injection
 * Showcased features:
 *   * bindInterface.
 *   * immediate.
 *   * rebindConstant.
 *   * @Inject.
 *   * @Configurable, @Configuration.
 *   * Injecting dependencies.
 */
import 'reflect-metadata'

import { LoggerFactory, Service, Injectable, Inject, Configuration, Configurable } from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'

// The interface that we will bind and then rebind.
interface IRebindable {
    greeting(): string
}

// OrdinaryImplementation is the default implementation of
// IRebindable. It is bound with bindImplementation(), and
// instantiated by Chalupa, that's why it has the @Injectable
// decorator.
@Injectable()
class OrdinaryImplementation implements IRebindable {
    greeting(): string {
        return 'Ordinary greeting'
    }
}

// The alternative implementation, which is bound based
// on the supplied configuration. Since we're going to
// instantiate it by hand and bind it as a constant, there
// is no need for the @Injectable decorator.
class ReboundImplementation implements IRebindable {
    greeting(): string {
        return 'Rebound greeting'
    }
}

// Both the binding and the rebinding will
// use the same type key.
const Types = {
    IRebindable: 'IRebindable'
}

@Configuration()
class RebindConfig {
    @Configurable({
        doc: 'The environment the application is executing in.',
        format: ['local', 'staging', 'production'],
    })
    env = 'production'

    shouldReplaceImplementation(): boolean {
        return this.env === 'local'
    }
}

@Service({
    // First, we bind OrdinaryImplementation to the Types.IRebindable
    // type key. This is the default binding for the key.
    //
    // Then, we use The shouldReplaceImplementation() method of RebindConfig
    // to decide, whether to replace the previously bound class or not.
    // If this method returns true, then we execute the rebindConstant() method,
    // passing it the same type key, as we did in the case of bindInterface().
    // This will instruct Chalupa to remove the previous binding for
    // Types.IRebindable, and replace it with a binding to our ReboundImplementation
    // instance.
    // On the other hand, if the shouldReplaceImplementation() returns false,
    // nothing happens, and the original binding remans.
    //
    // You can affect the return value of the method by setting the
    //
    //   REBIND_ENV
    //
    // environment variable to 'local', for example.
	inject(context) {
		context.bindInterface(Types.IRebindable, OrdinaryImplementation)

        if (context.immediate(RebindConfig).shouldReplaceImplementation()) {
            context.rebindConstant(Types.IRebindable, new ReboundImplementation())
        }
	}
})
class RebindService {
    constructor(
        loggerFactory: LoggerFactory,
        @Inject(Types.IRebindable) rebindable: IRebindable
    ) {
        const logger = loggerFactory.getLogger(RebindService)

        logger.info(rebindable.greeting())
    }
}

async function start() {
	const service = await Chalupa
		.builder()
		.createServiceWithStrategy(RebindService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
