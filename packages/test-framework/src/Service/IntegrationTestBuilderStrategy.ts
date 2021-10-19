import {
	ContainerConstant,
	IBuilderStrategy,
	ICommunicationChannel,
	IIntermediateService,
	Metadata,
} from '@catamaranjs/interface'

import { IntegrationTestArrangement, SystemUnderTest } from './IntegrationTestArrangement'
import { IntegrationTestCommunicationChannel } from './IntegrationTestCommunicationChannel'

/**
 * Strategy creating an integration testing optimized version of the service, which
 * will not make any actual Darcon calls.
 */
export class IntegrationTestBuilderStrategy implements IBuilderStrategy<IntegrationTestArrangement> {
	build(intermediateService: IIntermediateService): Promise<IntegrationTestArrangement> {
		const serviceBridge = intermediateService.bridge()

		intermediateService.container
			.bind<ICommunicationChannel>(ContainerConstant.COMMUNICATION_CHANNEL_INTERFACE)
			.to(IntegrationTestCommunicationChannel)

		const originalEnvValues = new Map<string, string | undefined>()

		const sut: SystemUnderTest = {
			getComponent(key) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return intermediateService.container.get(key)
			},
			getServiceOrModule(key) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return intermediateService.container.get(key)
			},
			async serviceAppeared(name) {
				if (!isItMe(name)) {
					await serviceBridge.callServiceAppeared([name])
				}
			},
			async serviceDisappeared(name) {
				if (!isItMe(name)) {
					await serviceBridge.callServiceDisappeared([name])
				}
			},
			async close() {
				await intermediateService.bridge().callLifecycleMethodOnService(Metadata.ServiceLifecycle.PreDestroy)

				// @ts-ignore
				for (const [key, value] of originalEnvValues.entries()) {
					process.env[key] = value
				}
			},
		}

		serviceBridge.suppressEventWarning().suppressMethodWarning().buildDependencyTree()

		const arrangement: IntegrationTestArrangement = {
			rebind(key, boundValue) {
				intermediateService.container.rebind(key).toConstantValue(boundValue)

				return arrangement
			},

			reconfigure(variable: string, value: any) {
				originalEnvValues.set(variable, process.env[variable])

				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				process.env[variable] = value

				return arrangement
			},

			async start() {
				await serviceBridge.callLifecycleMethodOnService(Metadata.ServiceLifecycle.PostInit)

				return sut
			},
		}

		return Promise.resolve(arrangement)

		function isItMe(name: string) {
			return name === intermediateService.serviceOptions.name
		}
	}
}
