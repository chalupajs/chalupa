/*
 * 23. Appeared Events
 *
 *
 * Topic: Service Communication
 */
import 'reflect-metadata'

import {ILogger, LoggerFactory, Service, ServiceAppeared, ServiceDisappeared} from "@chalupajs/interface";
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'

@Service()
class ServiceA {
	private readonly logger: ILogger

	constructor(loggerFactory: LoggerFactory) {
		this.logger = loggerFactory.getLogger(ServiceA)
	}

	@ServiceAppeared()
	onServiceAppeared(name: string) {
		this.logger.info('Service appeared', name)
	}

	@ServiceDisappeared()
	onServiceDisappeared(name: string) {
		this.logger.info('Service disappeared', name)
	}
}

@Service()
class ServiceB {
	private readonly logger: ILogger

	constructor(loggerFactory: LoggerFactory) {
		this.logger = loggerFactory.getLogger(ServiceB)
	}

	@ServiceAppeared()
	onServiceAppeared(name: string) {
		this.logger.info('Service appeared', name)
	}

	@ServiceDisappeared()
	onServiceDisappeared(name: string) {
		this.logger.info('Service disappeared', name)
	}
}

@Service()
class ServiceC {
	private readonly logger: ILogger

	constructor(loggerFactory: LoggerFactory) {
		this.logger = loggerFactory.getLogger(ServiceC)
	}

	@ServiceAppeared()
	onServiceAppeared(name: string) {
		this.logger.info('Service appeared', name)
	}

	@ServiceDisappeared()
	onServiceDisappeared(name: string) {
		this.logger.info('Service disappeared', name)
	}
}

async function start() {
	const serviceA = await Chalupa
		.builder()
		.createServiceWithStrategy(ServiceA, InMemoryStrategy)

    const serviceB = await Chalupa
		.builder()
		.createServiceWithStrategy(ServiceB, InMemoryStrategy)

	const serviceC = await Chalupa
		.builder()
		.createServiceWithStrategy(ServiceC, InMemoryStrategy)

	setTimeout(() => serviceB.close(), 3000)

	await Promise.allSettled([serviceA.start(), serviceB.start(), serviceC.start()])
}

start().catch(console.error)
