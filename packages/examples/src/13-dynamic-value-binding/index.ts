/*
 * 13. Dynamic Value Binding
 *
 *
 * Again, in the case of class and interface bindings, instantiation is handled by
 * Chalupa, and we're only telling it which classes to create. We've already seen,
 * that we can use bindConstant() to bind literals or pre-created instances. In practice,
 * we might want to bind providers: functions that will supply the actual value of the binding.
 * Why so? The value that we want to bind might not be available when creating the binding, only
 * when injecting it. A great example is TypeORM, which provides a global getConnection function.
 * To retrieve this connection, we can use dynamic value bindings.
 *
 * Topic: Dependency Injection
 * Showcased features:
 *   * @Inject.
 *   * bindDynamicValue.
 *   * Injecting dependencies.
 */
import 'reflect-metadata'

import { LoggerFactory, Service, Inject } from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'

interface IConnection {
	db: string
}

const Types = {
    IConnection: 'IConnection'
}

function getConnection(): IConnection {
	return {
		db: 'mongodb'
	}
}

@Service({
    // bindDynamicValue() is like bindInterface(). First, we specify
    // a key that is going to identify the binding. The, we just use the same
	// key in the the @Inject decorator. The second parameter, in turn, is
	// the provider function. When someone requests an instance of the binding,
	// then the supplied provider function is executed to retrieve the bound value.
	// The provider function has a single optional parameter, the dynamic context,
	// making it possible to manipulate container bindings (for example, getting instances).
	inject(context) {
		context
			.bindDynamicValue(Types.IConnection, () => getConnection())
	}
})
class PizzaService {
	constructor(
        loggerFactory: LoggerFactory,
        @Inject(Types.IConnection) connection: IConnection
    ) {
		const logger = loggerFactory.getLogger(PizzaService)

        logger.info(`Received a connection to ${connection.db}`)
	}
}

async function start() {
	const service = await Chalupa
		.builder()
		.createServiceWithStrategy(PizzaService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
