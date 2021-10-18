/* eslint-disable @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-implicit-any-catch */
// @ts-expect-error
import Darcon from 'darcon'

import {
	LoggerFactory,
	IBuilderStrategy,
	IIntermediateService,
	Metadata,
	reconfigureToEnvPrefix,
	ICommunicationChannel,
	ContainerConstant,
} from '@catamaranjs/interface'

import { DarconConfig } from '../Config/DarconConfig'
import { ConstructedService } from './ConstructedService'
import { DarconCommunicationChannel } from './DarconCommunicationChannel'

/**
 * Strategy which builds a self-contained, executable service, that can publish itself to Darcon.
 */
export class DarconBuilderStrategy implements IBuilderStrategy<ConstructedService> {
	async build(intermediateService: IIntermediateService): Promise<ConstructedService> {
		const { container, serviceOptions } = intermediateService

		const loggerFactory = container.get<LoggerFactory>(LoggerFactory)

		const envPrefix = container.isBound(ContainerConstant.ENV_PREFIX)
			? container.get<string>(ContainerConstant.ENV_PREFIX)
			: undefined

		container.bind<DarconConfig>(DarconConfig).to(reconfigureToEnvPrefix(envPrefix, DarconConfig))
		const config: DarconConfig = container.get<DarconConfig>(DarconConfig)

		const darconLogger = loggerFactory.getLogger('Darcon')
		// @ts-expect-error
		darconLogger.darconlog = function (error, message, object, level) {
			if (error) {
				// @ts-expect-error
				this.error(error, error.message || error.toString())
			} else {
				// @ts-expect-error
				this[level || 'debug'](object || {}, message)
			}
		}.bind(darconLogger)

		intermediateService.bindLogger(darconLogger)

		const serviceBridge = intermediateService.bridge()

		let depends: string[] = serviceOptions.dependsOn ?? []

		const darcon = new Darcon()

		const isItMe = function (name: string) {
			return name === serviceOptions.name
		}

		await darcon.init({
			logger: darconLogger,
			name: config.division,
			idLength: config.idLength,
			reponseTolerance: config.responseTolerance,
			reporterInterval: config.reporterInterval,
			keeperInterval: config.keeperInterval,
			maxReconnectAttempts: config.maxReconnectAttempts,
			reconnectTimeWait: config.reconnectTimeWait,
			connectTimeWait: config.connectTimeWait,
			connectionPatience: config.connectionPatience,
			commSize: config.commSize,
			maxCommSize: config.maxCommSize,
			strict: config.strict,
			nats: {
				url: config.natsUrl,
			},
			mortar: {
				enabled: false,
			},
			millieu: {},
			async entityUpdated(_: any, name: string, terms = {}) {
				if (isItMe(name)) {
					return 'OK'
				}

				await serviceBridge.callNetworkEvent(Metadata.NetworkEvent.EntityUpdated, [name, terms])
				return 'OK'
			},

			async entityDisappeared(_: any, name: string) {
				if (isItMe(name)) {
					return 'OK'
				}

				await serviceBridge.callNetworkEvent(Metadata.NetworkEvent.EntityDisappeared, [name])
				return 'OK'
			},

			async entityAppeared(_: any, name: string) {
				if (isItMe(name)) {
					return 'OK'
				}

				await serviceBridge.callNetworkEvent(Metadata.NetworkEvent.EntityAppeared, [name])
				depends = depends.filter(depend => depend !== name)
				darconLogger.info(`'${name}' appeared on the network`)
				return 'OK'
			},
		})

		container.bind<any>('darcon').toConstantValue(darcon)
		container
			.bind<ICommunicationChannel>(ContainerConstant.COMMUNICATION_CHANNEL_INTERFACE)
			.to(DarconCommunicationChannel)

		const services: string[] = []
		const events: string[] = []

		const darconEntity: any = {
			name: serviceOptions.name,
			async init() {
				return 'OK'
			},
			async close() {
				return 'OK'
			},
			services(): string[] {
				return services
			},
			events(): string[] {
				return events
			},
		}

		serviceBridge
			.serviceMethodHandler((externalName: string, fn: any) => {
				services.push(externalName)
				darconEntity[externalName] = fn
			})
			.serviceEventHandler((externalName: string, fn: any) => {
				services.push(externalName)
				events.push(externalName)
				darconEntity[externalName] = async function (...parameters: any[]) {
					const response = await fn(...parameters)
					if (typeof response === 'undefined') {
						return 'OK'
					}

					return response
				}
			})

		serviceBridge.buildDependencyTree()

		const start = async function () {
			while (depends.length > 0 && !darcon.finalised) {
				darconLogger.info(`Waiting for ${depends.join(', ')} to be present!`)
				// eslint-disable-next-line no-await-in-loop
				await intermediateService.timeout(2000)
			}

			await serviceBridge.respectDelayedStart()

			await serviceBridge.callLifecycleMethodOnService(Metadata.ServiceLifecycle.PostInit)

			await darcon.publish(darconEntity, {})
		}

		const close = async function () {
			await serviceBridge.callLifecycleMethodOnService(Metadata.ServiceLifecycle.PreDestroy)
			await darcon.close()
		}

		process.on('SIGINT', () => {
			void close()
		})

		return {
			start,
			close,
		}
	}
}
