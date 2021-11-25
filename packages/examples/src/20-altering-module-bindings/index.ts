/*
 * 20. Altering Module Bindings
 *
 * 
 * As module and service bindings share the same context, modules can rebind and unbind
 * the bindings of modules that have been imported prior to them. This is exactly what
 * we will see in this example: the AuthenticatedHttpApiModule binds the HttpApiModule
 * and once that's bound, it immediately rebinds the Types.HttpApi binding created by
 * HttpApiModule. Therefore, when we injec Types.HttpApi in our service, we will
 * get the binding bound by AuthenticatedHttpApiModule.
 * 
 * Topic: Modules
 * Showcased features:
 *   * @Module and modules.
 *   * bindInterface.
 *   * rebindInterface.
 */
import 'reflect-metadata'

import { LoggerFactory, Service, Module, Injectable, Inject, ILogger} from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'

interface HttpApi {}

@Injectable()
class OriginalHttpApiImpl implements HttpApi {}

const Types = {
    HttpApi: 'HttpApi'
}

@Module({
    inject(context) {
        context.bindInterface(Types.HttpApi, OriginalHttpApiImpl)

        context.getLogger('HttpApiModule.inject')
            .info(`Bound ${Types.HttpApi}`)
    }
})
class HttpApiModule {}

@Injectable()
class AuthenticatedHttpApiImpl implements HttpApi {
    private readonly impl: OriginalHttpApiImpl;

    constructor(loggerFactory: LoggerFactory)  {
        const logger = loggerFactory.getLogger(AuthenticatedHttpApiImpl)

        this.impl = new OriginalHttpApiImpl()

        logger.info(`Impl: ${this.impl}`)
    }
}

@Module({
    inject(context) {
        context.bindModule(HttpApiModule)

        context.rebindInterface(Types.HttpApi, AuthenticatedHttpApiImpl)

        context.getLogger('AuthenticatedHttpApiModule.inject')
            .info(`Rebound ${Types.HttpApi}`)
    }
})
class AuthenticatedHttpApiModule {}

@Service({
	modules: [AuthenticatedHttpApiModule]
})
class HttpService {
    private readonly logger: ILogger

	constructor(loggerFactory: LoggerFactory, @Inject(Types.HttpApi) httpApi: HttpApi) {
		this.logger = loggerFactory.getLogger(HttpService)

        this.logger.info(`HttpApi: ${httpApi}`)
	}
}

async function start() {
	const service = await Chalupa
		.builder()
		.createServiceWithStrategy(HttpService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
