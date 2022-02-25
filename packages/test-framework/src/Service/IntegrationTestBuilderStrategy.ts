import { IBuilderStrategy, IIntermediateService } from '@chalupajs/interface'

import { IntegrationTestArrangement } from './IntegrationTestArrangement'
import { IntegrationTestCommunicationFacade } from './IntegrationTestCommunicationFacade'
import { IntegrationTestBuilderStrategyFactory } from './IntegrationTestBuilderStrategyFactory'

/**
 * Strategy creating an integration testing optimized version of the service, which
 * will not make any actual communication calls.
 */
export class IntegrationTestBuilderStrategy implements IBuilderStrategy<IntegrationTestArrangement> {
	build(intermediateService: IIntermediateService): Promise<IntegrationTestArrangement> {
		const integrationTestBuilder = new IntegrationTestBuilderStrategyFactory(IntegrationTestCommunicationFacade)

		const strategy = new (integrationTestBuilder.create())()

		return strategy.build(intermediateService)
	}
}
