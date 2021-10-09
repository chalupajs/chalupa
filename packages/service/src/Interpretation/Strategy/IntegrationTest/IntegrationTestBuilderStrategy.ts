/* eslint-disable  @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-implicit-any-catch */
import {
	ServiceOptions,
	LoggerFactory,
	IBuilderStrategy,
	IIntermediateService,
	Metadata
} from '@catamaranjs/interface'

import { IntegrationTestArrangement, SystemUnderTest } from './IntegrationTestArrangement'

/**
 * Strategy creating an integration testing optimized version of the service, which
 * will not make any actual Darcon calls.
 */
export class IntegrationTestBuilderStrategy
	implements IBuilderStrategy<IntegrationTestArrangement>
{
	async build(intermediateService: IIntermediateService): Promise<IntegrationTestArrangement> {
		const serviceOptions = Reflect.getMetadata(
			Metadata.SERVICE_OPTIONS,
			intermediateService.serviceConstructor
		) as ServiceOptions

		const loggerFactory = intermediateService.container.get<LoggerFactory>(LoggerFactory)
		const logger = loggerFactory.getLogger('Darcon')

		intermediateService.container.bind<any>('darcon').toConstantValue({
			// This adheres to the Darcon API, so there's not much we can
			// do regarding the parameter count.
			// eslint-disable-next-line max-params
			comm(
				type: string,
				_flowID: any,
				_processID: any,
				service: string,
				method: string,
				parameters: [any]
			) {
				throw new Error(`
Ooops, you forgot to properly mock this Darcon communication:

  Emit(I)/Call(R): (${type})
	${service}.${method}
  Parameters:
	${parameters.join(', ')}
`)
			},
		})

		const modulePreInitMethods: any[] = []
		const modulePostInitMethods: any[] = []
		const modulePreDestroyMethods: any[] = []
		const modulePostDestroyMethods: any[] = []

		const collectLifecycleMetadata = function (
			symbol: string,
			proto: any,
			instance: any,
			targetArray: any[]
		) {
			const key = Reflect.getMetadata(symbol, proto) as string | undefined
			if (key) {
				targetArray.push(instance[key].bind(instance))
			}
		}

		const callLifecycleMethodOnService = async function (symbol: string) {
			const key = Reflect.getMetadata(symbol, intermediateService.serviceConstructor.prototype) as
				| string
				| undefined
			if (key) {
				const service = intermediateService.container.get<any>(intermediateService.serviceConstructor)
				await service[key]()
			}
		}

		if (serviceOptions.modules?.length) {
			for (const module of serviceOptions.modules) {
				const moduleInstance = intermediateService.container.get(module)

				collectLifecycleMetadata(
					Metadata.METADATA_MODULE_LIFECYCLE_PRE_SERVICE_INIT,
					module.prototype,
					moduleInstance,
					modulePreInitMethods
				)
				collectLifecycleMetadata(
					Metadata.METADATA_MODULE_LIFECYCLE_POST_SERVICE_INIT,
					module.prototype,
					moduleInstance,
					modulePostInitMethods
				)
				collectLifecycleMetadata(
					Metadata.METADATA_MODULE_LIFECYCLE_PRE_SERVICE_DESTROY,
					module.prototype,
					moduleInstance,
					modulePreDestroyMethods
				)
				collectLifecycleMetadata(
					Metadata.METADATA_MODULE_LIFECYCLE_POST_SERVICE_DESTROY,
					module.prototype,
					moduleInstance,
					modulePostDestroyMethods
				)
			}
		}

		const originalEnvValues = new Map<string, string | undefined>()

		const sut: SystemUnderTest = {
			getServiceOrModule(key) {
				return intermediateService.container.get(key)
			},
			async entityAppeared(name) {
				if (!isItMe(name)) {
					await callNetworkEvent(Metadata.NetworkEvent.EntityAppeared, [name])
				}
			},
			async entityLinked(name) {
				if (!isItMe(name)) {
					await callNetworkEvent(Metadata.NetworkEvent.EntityLinked, [name])
				}
			},
			async entityDisappeared(name) {
				if (!isItMe(name)) {
					await callNetworkEvent(Metadata.NetworkEvent.EntityDisappeared, [name])
				}
			},
			async entityUpdated(name, terms) {
				if (!isItMe(name)) {
					await callNetworkEvent(Metadata.NetworkEvent.EntityUpdated, [name, terms])
				}
			},
			async close() {
				await Promise.all(modulePreDestroyMethods.map(initMethod => initMethod()))
				await callLifecycleMethodOnService(Metadata.ServiceLifecycle.PreDestroy)
				await Promise.all(modulePostDestroyMethods.map(initMethod => initMethod()))

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
				await Promise.all(modulePreInitMethods.map(initMethod => initMethod()))
				await callLifecycleMethodOnService(Metadata.ServiceLifecycle.PostInit)
				await Promise.all(modulePostInitMethods.map(initMethod => initMethod()))

				return sut
			},
		}

		return arrangement

		function isItMe(name: string) {
			return name === serviceOptions.name
		}

		async function callNetworkEvent(symbol: string, parameters: any[]) {
			const propertyKey = Reflect.getMetadata(symbol, intermediateService.serviceConstructor.prototype) as
				| string
				| null

			if (propertyKey) {
				try {
					const service = intermediateService.container.get<NetworkEventHost>(
						intermediateService.serviceConstructor
					)
					await service[propertyKey](...parameters)
				} catch (error: any) {
					logger.error(error)
				}
			}
		}
	}
}

type NetworkEventHost = Record<string, (...args: any) => Promise<void>>
