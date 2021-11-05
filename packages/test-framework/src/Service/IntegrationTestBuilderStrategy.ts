import {
	Constructor,
	ContainerConstant,
	IBuilderStrategy,
	ICommunicationChannel,
	IIntermediateService,
	// Metadata,
} from '@chalupajs/interface'

import { IntegrationTestArrangement, SystemUnderTest } from './IntegrationTestArrangement'
import { IntegrationTestCommunicationChannel } from './IntegrationTestCommunicationChannel'
import {IntegrationTestCommunicationFacade} from "./IntegrationTestCommunicationFacade";
import IntegrationTestCallbackHandler from "./IntegrationTestCallbackHandler";

/**
 * Strategy creating an integration testing optimized version of the service, which
 * will not make any actual communication calls.
 */
export class IntegrationTestBuilderStrategy implements IBuilderStrategy<IntegrationTestArrangement> {
	build(intermediateService: IIntermediateService): Promise<IntegrationTestArrangement> {
		const orchestrator = intermediateService.bridge().useFacade(IntegrationTestCommunicationFacade)

		intermediateService.container
			.bind<ICommunicationChannel>(ContainerConstant.COMMUNICATION_CHANNEL_INTERFACE)
			.to(IntegrationTestCommunicationChannel)

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
				if (IntegrationTestCallbackHandler.onServiceAppeared) {
					await IntegrationTestCallbackHandler.onServiceAppeared(name)
				}

				return Promise.resolve()
			},
			async serviceDisappeared(name) {
				if (IntegrationTestCallbackHandler.onServiceDisappeared) {
					await IntegrationTestCallbackHandler.onServiceDisappeared(name)
				}

				return Promise.resolve()
			},
			async close() {
				await orchestrator.close()
			},
		}

		const arrangement: IntegrationTestArrangement = {
			bind(key: string | Constructor, boundValue: any) {
				intermediateService.container.bind(key).toConstantValue(boundValue)

				return arrangement
			},

			rebind(key, boundValue) {
				intermediateService.container.rebind(key).toConstantValue(boundValue)

				return arrangement
			},

			async start() {
				await orchestrator.start()

				return Promise.resolve(sut)
			},
		}

		return Promise.resolve(arrangement)
	}
}
