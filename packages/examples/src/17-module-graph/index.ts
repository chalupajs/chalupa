/*
 * 17. Module Graph
 *
 * 
 * Modules can bind/import other modules. These binding relationships for a directed acyclic graph,
 * in which the nodes correspond to modules and the edges are formed according to the bindings
 * between the modules. In this example, we will have three modules: A, B and C. Both B and C
 * binds A, while B and C are bound by the service itself. Thus we will have a module graph
 * that looks somehow like this:
 *
 *      service
 *      /     \
 *     /       \
 *    B         C  
 *     \       /
 *      \     /
 *       \   /
 *        \ /
 *         A
 * 
 * Even though A is bound twice (both by B and C), it will only get imported and instantiated once,
 * as modules are singletons.
 * 
 * The module graph also plays a role in the service lifecycle. The various ServiceInit and
 * ServiceDestroy lifecycle methods of the modules are called with respect to the dependency
 * relations of the module graph.
 * 
 * Topic: Modules
 * Showcased features:
 *   * @Module and modules
 *   * Lifecycle decorators: ServiceInit and ServiceDestroy.
 *   * Module graph.
 */
import 'reflect-metadata'

import { ILogger, PreServiceInit, PreServiceDestroy, PostServiceDestroy, PostServiceInit, PostInit, PreDestroy, LoggerFactory, Service, Module } from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'

@Module({
    inject(context) {
        context.getLogger('ModuleA.inject').info('inject')
    }
})
class ModuleA {
    private readonly logger: ILogger

    constructor(loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.getLogger(ModuleA)
    }

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

@Module({
    modules: [ModuleA],
    inject(context) {
        context.getLogger('ModuleB.inject').info('inject')
    }
})
class ModuleB {
    private readonly logger: ILogger

    constructor(loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.getLogger(ModuleB)
    }

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

@Module({
    modules: [ModuleA],
    inject(context) {
        context.getLogger('ModuleC.inject').info('inject')
    }
})
class ModuleC {
    private readonly logger: ILogger

    constructor(loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.getLogger(ModuleC)
    }

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
	modules: [ModuleB, ModuleC],
    inject(context) {
        context.getLogger('MultiModuleService.inject').info('inject')
    }
})
class MultiModuleService {
    private readonly logger: ILogger

	constructor(loggerFactory: LoggerFactory) {
		this.logger = loggerFactory.getLogger(MultiModuleService)
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
		.createServiceWithStrategy(MultiModuleService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
