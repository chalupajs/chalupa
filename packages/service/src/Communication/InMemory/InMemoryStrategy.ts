import { IBuilderStrategy, IIntermediateService } from '@chalupajs/interface'

import { ConstructedService } from './ConstructedService'
import { InMemoryFacade } from './InMemoryFacade'

/**
 * Strategy which builds a self-contained, executable service
 */
export class InMemoryStrategy implements IBuilderStrategy<ConstructedService> {
	build(intermediateService: IIntermediateService): Promise<ConstructedService> {
		const orchestrator = intermediateService.bridge().useFacade(InMemoryFacade)

		async function start() {
			await orchestrator.start()
		}

		async function close() {
			await orchestrator.close()
		}

		return Promise.resolve({ start, close })
	}
}
