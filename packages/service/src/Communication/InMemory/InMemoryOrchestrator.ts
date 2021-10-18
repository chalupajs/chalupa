import { TinyEmitter } from 'tiny-emitter'

export interface IMemoryService {
	callMethod<T>(methodName: string, parameters: any[]): Promise<T>
	callEvent(eventName: string, parameters: any[]): void

	addMethod(methodName: string, fn: CallableFunction): this
	addEvent(eventName: string, fn: CallableFunction): this
	methods: string[]
	link(): void
}

export class MemoryService implements IMemoryService {
	private _serviceName: string
	private _messageBus: TinyEmitter
	private _methodMap: Map<string, CallableFunction>
	private _isLinked: boolean

	constructor(serviceName: string, messageBus: TinyEmitter) {
		this._serviceName = serviceName
		this._messageBus = messageBus
		this._methodMap = new Map<string, CallableFunction>()
		this._isLinked = false
	}

	link(): void {
		this._isLinked = true
	}

	get methods(): string[] {
		return [...this._methodMap.keys()]
	}

	addEvent(eventName: string, fn: Function): this {
		this._messageBus.on(`${this._serviceName}_${eventName}`, fn)
		if (this._isLinked) {
			this._messageBus.emit('entityUpdated', this._serviceName)
		}

		return this
	}

	addMethod(methodName: string, fn: Function): this {
		this._methodMap.set(methodName, fn)
		if (this._isLinked) {
			this._messageBus.emit('entityUpdated', this._serviceName)
		}

		return this
	}

	callEvent(eventName: string, parameters: any[]): void {
		this._messageBus.emit(`${this._serviceName}_${eventName}`, ...parameters)
	}

	callMethod<T>(methodName: string, parameters: any[]): Promise<T> {
		if (!this._methodMap.has(methodName)) {
			throw new Error(`Method '${methodName}' is not exists on service ${this._serviceName}`)
		}

		return this._methodMap.get(methodName)!(...parameters)
	}
}

export interface IInMemoryOrchestrator {
	request<T>(
		serviceName: string,
		serviceMethodName: string,
		parameters: any[],
		terms: Record<string, any>
	): Promise<T>
	emitTo(serviceName: string, eventName: any, parameters: any[], terms: Record<string, any>): void
	services: string[]
	methods(serviceName: string): Promise<string[]>
	broadcast(eventName: string, parameters: any[], terms: Record<string, any>): void
	createService(serviceName: string): IMemoryService
	onEntityAppeared(cb: CallableFunction): void
	onEntityUpdated(cb: CallableFunction): void
	onEntityDisappeared(cb: CallableFunction): void
	close(): void
}

class InMemoryOrchestrator implements IInMemoryOrchestrator {
	private _messageBus: TinyEmitter
	private _services: Map<string, IMemoryService>
	private _keepAlive?: NodeJS.Timer

	constructor() {
		this._messageBus = new TinyEmitter()
		this._services = new Map<string, IMemoryService>()
	}

	keepServiceAlive() {
		if (typeof this._keepAlive === 'undefined') {
			this._keepAlive = setInterval(() => {}, 1 << 30)
		}
	}

	close(): void {
		if (this._keepAlive) {
			clearInterval(this._keepAlive)
		}
	}

	onEntityAppeared(cb: CallableFunction): void {
		this._messageBus.on('entityAppeared', cb)
	}

	onEntityUpdated(cb: CallableFunction): void {
		this._messageBus.on('entityUpdated', cb)
	}

	onEntityDisappeared(cb: CallableFunction): void {
		this._messageBus.on('entityDisappeared', cb)
	}

	createService(serviceName: string): IMemoryService {
		const service = new MemoryService(serviceName, this._messageBus)
		this._services.set(serviceName, service)
		this._messageBus.emit('entityAppeared', serviceName)
		return service
	}

	request<T>(
		serviceName: string,
		serviceMethodName: string,
		parameters: any[],
		_terms: Record<string, any>
	): Promise<T> {
		if (!this._services.has(serviceName)) {
			throw new Error('Service not exists!')
		}

		return this._services.get(serviceName)!.callMethod<T>(serviceMethodName, parameters)
	}

	emitTo(serviceName: string, eventName: any, parameters: any[], _terms: Record<string, any>): void {
		this._messageBus.emit(`${serviceName}_${eventName}`, ...parameters)
	}

	get services(): string[] {
		return [...this._services.keys()]
	}

	methods(serviceName: string): Promise<string[]> {
		if (!this._services.has(serviceName)) {
			throw new Error(`Service '${serviceName}' not exists!`)
		}

		return Promise.resolve([...this._services.get(serviceName)!.methods])
	}

	broadcast(eventName: string, parameters: any[], _terms: Record<string, any>): void {
		for (const serviceName in this._services.keys()) {
			this._messageBus.emit(`${serviceName}_${eventName}`, ...parameters)
		}
	}
}

const singletonInstance = new InMemoryOrchestrator()

export default singletonInstance
