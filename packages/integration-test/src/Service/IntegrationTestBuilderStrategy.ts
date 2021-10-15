/* eslint-disable  @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-implicit-any-catch */
import {
	ContainerConstant,
	IBuilderStrategy,
	ICommunicationChannel,
	IIntermediateService,
	Metadata
} from '@catamaranjs/interface'

import {IntegrationTestArrangement, SystemUnderTest} from './IntegrationTestArrangement'
import {IntegrationTestCommunicationChannel} from "./IntegrationTestCommunicationChannel";

/**
 * Strategy creating an integration testing optimized version of the service, which
 * will not make any actual Darcon calls.
 */
export class IntegrationTestBuilderStrategy
	implements IBuilderStrategy<IntegrationTestArrangement>
{
	async build(intermediateService: IIntermediateService): Promise<IntegrationTestArrangement> {
		const serviceBridge = intermediateService.bridge()

		intermediateService.container.bind<ICommunicationChannel>(ContainerConstant.COMMUNICATION_CHANNEL_INTERFACE)
			.to(IntegrationTestCommunicationChannel)

		const originalEnvValues = new Map<string, string | undefined>()

		const sut: SystemUnderTest = {
			getComponent(key) {
				return intermediateService.container.get(key)
			},
			getServiceOrModule(key) {
				return intermediateService.container.get(key)
			},
			async entityAppeared(name) {
				if (!isItMe(name)) {
					await serviceBridge.callNetworkEvent(Metadata.NetworkEvent.EntityAppeared, [name])
				}
			},
			async entityDisappeared(name) {
				if (!isItMe(name)) {
					await serviceBridge.callNetworkEvent(Metadata.NetworkEvent.EntityDisappeared, [name])
				}
			},
			async entityUpdated(name, terms) {
				if (!isItMe(name)) {
					await serviceBridge.callNetworkEvent(Metadata.NetworkEvent.EntityUpdated, [name, terms])
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

		const arrangement: IntegrationTestArrangement = {
			rebind(key, boundValue) {
				intermediateService.container.rebind(key).toConstantValue(boundValue)

				return arrangement
			},

			reconfigure(variable: string, value: any) {
				originalEnvValues.set(variable, process.env[variable])

				process.env[variable] = value

				return arrangement
			},

			async start() {
				await serviceBridge.callLifecycleMethodOnService(Metadata.ServiceLifecycle.PostInit)

				return sut
			},
		}

		return arrangement

		function isItMe(name: string) {
			return name === intermediateService.serviceOptions.name
		}
	}
}
