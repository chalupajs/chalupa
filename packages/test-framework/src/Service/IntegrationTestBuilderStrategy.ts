import {
	Constructor,
	ContainerConstant,
	IBuilderStrategy,
	ICommunicationChannel,
	IIntermediateService,
	isExternalService,
	Metadata
} from '@chalupajs/interface'

import { IntegrationTestArrangement, SystemUnderTest } from './IntegrationTestArrangement'
import { IntegrationTestCommunicationChannel } from './IntegrationTestCommunicationChannel'
import { IntegrationTestCommunicationFacade } from './IntegrationTestCommunicationFacade'
import IntegrationTestCallbackHandler from './IntegrationTestCallbackHandler'

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
