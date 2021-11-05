import { IBuilderStrategy, IIntermediateService } from '@chalupajs/interface'

import { ConstructedService } from './ConstructedService'
import { DarconFacade } from './DarconFacade'

/**
 * Strategy which builds a self-contained, executable service, that can publish itself to Darcon.
 */
export class DarconBuilderStrategy implements IBuilderStrategy<ConstructedService> {
	async build(intermediateService: IIntermediateService): Promise<ConstructedService> {
		const orchesrator = intermediateService.bridge().useFacade(DarconFacade)

		async function start() {
			return orchesrator.start()
		}

		async function close() {
			return orchesrator.close()
		}

		return Promise.resolve({ start, close })
	}
}
