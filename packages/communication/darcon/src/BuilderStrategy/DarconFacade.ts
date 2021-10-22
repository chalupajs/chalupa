// @ts-expect-error
import Darcon from 'darcon'
import {
	ICommunicationFacade,
	AbstractCommunicationFacade,
	ICommunicationChannel,
	ContainerConstant,
	ServiceAppearedCallback,
	ServiceDisappearedCallback,
	IFacadeContainer,
	MethodCallable,
	EventCallable,
} from '@catamaranjs/interface'
import { DarconConfig } from '../Config/DarconConfig'
import { DarconCommunicationChannel } from './DarconCommunicationChannel'

export class DarconFacade extends AbstractCommunicationFacade implements ICommunicationFacade {
	// @ts-ignore
	private _facadeContainer: IFacadeContainer

	private _darcon?: Darcon

	private _services: string[] = []
	private _events: string[] = []
	private _serviceName?: string

	private _serviceAppearedCallback?: ServiceAppearedCallback
	private _serviceDisappearedCallback?: ServiceDisappearedCallback

	private _methodHandlers: Map<string, MethodCallable>
	private _eventHandlers: Map<string, EventCallable>

	constructor(facadeContainer: IFacadeContainer) {
		super()
		this._facadeContainer = facadeContainer
		this._methodHandlers = new Map<string, MethodCallable>()
		this._eventHandlers = new Map<string, EventCallable>()
	}

	onServiceDisappeared(_cb: ServiceDisappearedCallback) {
		this._serviceDisappearedCallback = _cb
	}

	onServiceAppeared(_cb: ServiceAppearedCallback) {
		this._serviceAppearedCallback = _cb
	}

	async init(serviceName: string) {
		this._serviceName = serviceName
		this._darcon = new Darcon()
		this._facadeContainer.bindConstant('darcon', this._darcon)

		this._facadeContainer.bindInterface<ICommunicationChannel>(
			ContainerConstant.COMMUNICATION_CHANNEL_INTERFACE,
			DarconCommunicationChannel
		)
		return Promise.resolve()
	}

	async connectToNetwork() {
		// eslint-disable-next-line unicorn/no-this-assignment
		const self = this
		const logger = this._facadeContainer.getLogger('Darcon')

		// eslint-disable-next-line no-warning-comments
		// TODO: remove it when @imrefazekas merged https://github.com/imrefazekas/darcon/pull/3

		// @ts-expect-error
		logger.darconlog = function (error, message, object, level) {
			if (error) {
				// @ts-expect-error
				this.error(error, error.message || error.toString())
			} else {
				// @ts-expect-error
				this[level || 'debug'](object || {}, message)
			}
		}.bind(logger)

		const config: DarconConfig = this._facadeContainer.immediate<DarconConfig>(DarconConfig)
		await this._darcon.init({
			logger,
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

			async entityDisappeared(_: any, name: string) {
				if (self._serviceDisappearedCallback) {
					await self._serviceDisappearedCallback(name)
				}

				return 'OK'
			},

			async entityAppeared(_: any, name: string) {
				if (self._serviceAppearedCallback) {
					await self._serviceAppearedCallback(name)
				}

				return 'OK'
			},
		})
	}

	async publishSelf(): Promise<void> {
		// eslint-disable-next-line unicorn/no-this-assignment
		const self = this
		const darconEntity = {
			name: this._serviceName,
			async init() {
				return Promise.resolve('OK')
			},
			async close() {
				return Promise.resolve('OK')
			},
		}
		Object.defineProperty(darconEntity, 'services', {
			get(): string[] {
				return self._services
			},
		})
		Object.defineProperty(darconEntity, 'events', {
			get(): string[] {
				return self._events
			},
		})

		this._methodHandlers.forEach((callable, methodName) => {
			Object.defineProperty(darconEntity, methodName, {
				value: (...parameters: any[]) => callable(parameters.slice(0, -1), parameters.slice(-1)[0]),
			})
		})

		this._eventHandlers.forEach((callable, eventName) => {
			Object.defineProperty(darconEntity, eventName, {
				value: (...parameters: any[]) => {
					const response = callable(parameters.slice(0, -1), parameters.slice(-1)[0])
					if (typeof response === 'undefined') {
						return 'OK'
					}

					return response
				},
			})
		})

		await this._darcon.publish(darconEntity, {})
	}

	async closeSelf() {
		await this._darcon.close()
	}

	addEventHandler(eventName: string, callable: EventCallable): void {
		this._services.push(eventName)
		this._events.push(eventName)
		this._eventHandlers.set(eventName, callable)
	}

	addMethodHandler(methodName: string, callable: MethodCallable): void {
		this._services.push(methodName)
		this._methodHandlers.set(methodName, callable)
	}
}
