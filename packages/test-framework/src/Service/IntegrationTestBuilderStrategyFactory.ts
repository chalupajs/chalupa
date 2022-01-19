import {
	Constructor,
	IBuilderStrategy,
	ICommunicationFacade,
	IIntermediateService,
	isExternalService,
	Metadata,
} from '@chalupajs/interface'

import { IntegrationTestArrangement, SystemUnderTest } from './IntegrationTestArrangement'

/**
 * Strategy creating an integration testing optimized version of the service, which
 * will not make any actual communication calls.
 */
export class IntegrationTestBuilderStrategyFactory implements IBuilderStrategy<IntegrationTestArrangement> {
	communicationFacade: Constructor<ICommunicationFacade>

	constructor(communicationFacade: Constructor<ICommunicationFacade>) {
		this.communicationFacade = communicationFacade
	}

	build(intermediateService: IIntermediateService): Promise<IntegrationTestArrangement> {
		const orchestrator = intermediateService.bridge().useFacade(this.communicationFacade)

		const sut: SystemUnderTest = {
			getComponent(key) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return intermediateService.container.get(key)
			},
			getServiceOrModule(key) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return intermediateService.container.get(key)
			},
			async close() {
				await orchestrator.close()
			},
		}

		const arrangement: IntegrationTestArrangement = {
			isBound(accessor: string | Constructor): boolean {
				return intermediateService.injectContainer.isBound(accessor)
			},

			bindClass<T>(constructor: Constructor<T>) {
				if (isExternalService(constructor)) {
					Reflect.deleteMetadata(Metadata.METADATA_EXTERNAL_SERVICE, constructor)
				}

				intermediateService.injectContainer.bindClass(constructor)

				return this
			},
			rebindClass<T>(constructor: Constructor<T>) {
				if (isExternalService(constructor)) {
					intermediateService.injectContainer.unbind(constructor)

					Reflect.deleteMetadata(Metadata.METADATA_EXTERNAL_SERVICE, constructor)

					intermediateService.injectContainer.bindClass(constructor)
				} else {
					intermediateService.injectContainer.rebindClass(constructor)
				}

				return this
			},

			bindConstant<T>(accessor: string | Constructor<T>, constant: Partial<T>) {
				if (typeof accessor === 'function' && isExternalService(accessor)) {
					Reflect.deleteMetadata(Metadata.METADATA_EXTERNAL_SERVICE, accessor)
				}

				intermediateService.injectContainer.bindConstant(accessor, constant)

				return this
			},
			rebindConstant<T>(accessor: string | Constructor<T>, constant: Partial<T>) {
				if (typeof accessor === 'function' && isExternalService(accessor)) {
					intermediateService.injectContainer.unbind(accessor)

					Reflect.deleteMetadata(Metadata.METADATA_EXTERNAL_SERVICE, accessor)

					intermediateService.injectContainer.bindConstant(accessor, constant)
				} else {
					intermediateService.injectContainer.rebindConstant(accessor, constant)
				}

				return this
			},

			bindInterface<T>(accessor: string, constructor: Constructor<T>) {
				if (isExternalService(constructor)) {
					Reflect.deleteMetadata(Metadata.METADATA_EXTERNAL_SERVICE, constructor)
				}

				intermediateService.injectContainer.bindInterface(accessor, constructor)

				return this
			},
			rebindInterface<T>(accessor: string, constructor: Constructor<T>) {
				if (isExternalService(constructor)) {
					intermediateService.injectContainer.unbind(accessor)

					Reflect.deleteMetadata(Metadata.METADATA_EXTERNAL_SERVICE, constructor)

					intermediateService.injectContainer.bindInterface(accessor, constructor)
				}

				intermediateService.injectContainer.rebindInterface(accessor, constructor)

				return this
			},

			unbind(accessor: string | Constructor) {
				intermediateService.injectContainer.unbind(accessor)

				return this
			},

			async start() {
				await orchestrator.start()

				return Promise.resolve(sut)
			},
		}

		return Promise.resolve(arrangement)
	}
}
