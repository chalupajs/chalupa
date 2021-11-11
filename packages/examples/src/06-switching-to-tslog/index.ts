/*
 * 06. Switching to TSLog
 *
 *
 * Using the LogProvider plugin, we change the logging backend
 * from the default console implementation to TSLog.
 *
 * The service will log with WARN and INFO levels on
 * creation and initialization.
 *
 * Topic: Logging
 * Showcased features:
 *   * Chalupa logging.
 *   * Switching the log provider (using the LogProvider plugin).
 */
import 'reflect-metadata'

import { ILogger, LoggerFactory, PostInit, Service } from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'
import { TSLogProvider } from '@chalupajs/logger-tslog'

// Observe, that the change in the log provider does not
// affect the actual service. This is so, as it depends
// on the ILogger interface as opposed to a concrete logger
// implementation.
@Service()
class SwitchingToTSLogService {
	private readonly logger: ILogger

	constructor(loggerFactory: LoggerFactory) {
		this.logger = loggerFactory.getLogger(SwitchingToTSLogService)
        this.logger.warn('Constructed the service.')
	}

	@PostInit()
	async postInit() {
		this.logger.info('Initialized the service.')
	}
}

async function start() {
	const service = await Chalupa
		.builder()
        // You can switch the log provider by using the
        // LogProvider plugin.
		.logProvider(TSLogProvider)
		.createServiceWithStrategy(SwitchingToTSLogService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
