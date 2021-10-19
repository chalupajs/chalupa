import {
	LoggerFactory,
	IBuilderStrategy,
	IIntermediateService,
	Metadata,
	ICommunicationChannel,
	ContainerConstant,
} from '@catamaranjs/interface'

import { ConstructedService } from './ConstructedService'
import { InMemoryCommunicationChannel } from './InMemoryCommunicationChannel'
import InMemoryOrchestrator from './InMemoryOrchestrator'

/**
 * Strategy which builds a self-contained, executable service, that can publish itself to Darcon.
 */
export class InMemoryStrategy implements IBuilderStrategy<ConstructedService> {
	build(intermediateService: IIntermediateService): Promise<ConstructedService> {
		const { container, serviceOptions } = intermediateService

		const loggerFactory = container.get<LoggerFactory>(LoggerFactory)
		const logger = loggerFactory.getLogger('InMemory')

		intermediateService.bindLogger(logger)

		const MemoryService = InMemoryOrchestrator.createService(serviceOptions.name)

		const serviceBridge = intermediateService.bridge()

		let depends: string[] = serviceOptions.dependsOn ?? []

		for (const linkedServiceName of InMemoryOrchestrator.services) {
			depends = depends.filter(d => d !== linkedServiceName)
		}

		const isItMe = function (name: string) {
			return name === serviceOptions.name
		}

		InMemoryOrchestrator.onEntityUpdated(async (serviceName: string) => {
			if (isItMe(serviceName)) {
				return
			}

			await serviceBridge.callNetworkEvent(Metadata.NetworkEvent.EntityUpdated, [serviceName])
		})
		InMemoryOrchestrator.onEntityAppeared(async (serviceName: string) => {
			if (isItMe(serviceName)) {
				return
			}

			await serviceBridge.callNetworkEvent(Metadata.NetworkEvent.EntityAppeared, [serviceName])
			depends = depends.filter(depend => depend !== serviceName)
			MemoryService.link()
		})
		InMemoryOrchestrator.onEntityDisappeared(async (serviceName: string) => {
			if (isItMe(serviceName)) {
				return
			}

			await serviceBridge.callNetworkEvent(Metadata.NetworkEvent.EntityDisappeared, [serviceName])
		})

		container
			.bind<ICommunicationChannel>(ContainerConstant.COMMUNICATION_CHANNEL_INTERFACE)
			.to(InMemoryCommunicationChannel)

		serviceBridge
			.serviceMethodHandler((externalName: string, fn: any) => MemoryService.addMethod(externalName, fn))
			.serviceEventHandler((externalName: string, fn: any) => MemoryService.addEvent(externalName, fn))

		serviceBridge.buildDependencyTree()

		const start = async function () {
			while (depends.length > 0) {
				logger.info(`Waiting for ${depends.join(', ')} to be present!`)
				logger.info(`ASD ${InMemoryOrchestrator.services.join(', ')}`)
				// eslint-disable-next-line no-await-in-loop
				await intermediateService.timeout(2000)
			}

			await serviceBridge.respectDelayedStart()
			await serviceBridge.callLifecycleMethodOnService(Metadata.ServiceLifecycle.PostInit)
			InMemoryOrchestrator.keepServiceAlive()
		}

		const close = async function () {
			await serviceBridge.callLifecycleMethodOnService(Metadata.ServiceLifecycle.PreDestroy)
			logger.debug('Service close called!')
			InMemoryOrchestrator.close()
		}

		process.on('SIGINT', () => {
			void close()
		})
		process.on('SIGTERM', () => {
			void close()
		})

		return Promise.resolve({
			start,
			close,
		})
	}
}
