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

	constructor(serviceName: string, messageBus: TinyEmitter) {
		this._serviceName = serviceName
		this._messageBus = messageBus
		this._methodMap = new Map<string, CallableFunction>()
	}

	link(): void {
		// No-op.
	}

	get methods(): string[] {
		return [...this._methodMap.keys()]
	}

	addEvent(eventName: string, fn: Function): this {
		this._messageBus.on(`${this._serviceName}_${eventName}`, fn)

		return this
	}

	addMethod(methodName: string, fn: Function): this {
		this._methodMap.set(methodName, fn)

		return this
	}

	callEvent(eventName: string, parameters: any[]): void {
		this._messageBus.emit(`${this._serviceName}_${eventName}`, ...parameters)
	}

	callMethod<T>(methodName: string, parameters: any[]): Promise<T> {
		const method = this._methodMap.get(methodName)

		if (!method) {
			throw new Error(`Method '${methodName}' is not exists on service ${this._serviceName}`)
		}

		return method(...parameters) as Promise<T>
	}
}

export interface IInMemoryOrchestrator {
	request<T>(
		serviceName: string,
		serviceMethodName: string,
		parameters: unknown[],
		terms: Record<string, unknown>
	): Promise<T>
	emitTo(serviceName: string, eventName: string, parameters: unknown[], terms: Record<string, unknown>): void
	services: string[]
	methods(serviceName: string): Promise<string[]>
	broadcast(eventName: string, parameters: unknown[], terms: Record<string, unknown>): void
	createService(serviceName: string): IMemoryService
	onServiceAppeared(cb: CallableFunction): void
	onServiceDisappeared(cb: CallableFunction): void
	close(): void
}

class InMemoryOrchestrator implements IInMemoryOrchestrator {
	// eslint-disable-next-line no-bitwise
	private static readonly KEEP_ALIVE_DURATION = 1 << 30

	private _messageBus: TinyEmitter
	private _services: Map<string, IMemoryService>
	private _keepAlive?: NodeJS.Timer

	constructor() {
		this._messageBus = new TinyEmitter()
		this._services = new Map<string, IMemoryService>()
	}

	keepServiceAlive() {
		if (typeof this._keepAlive === 'undefined') {
			this._keepAlive = setInterval(() => {}, InMemoryOrchestrator.KEEP_ALIVE_DURATION)
		}
	}

	close(): void {
		if (this._keepAlive) {
			clearInterval(this._keepAlive)
		}
	}

	onServiceAppeared(cb: CallableFunction): void {
		this._messageBus.on('serviceAppeared', cb)
	}

	onServiceDisappeared(cb: CallableFunction): void {
		this._messageBus.on('serviceDisappeared', cb)
	}

	createService(serviceName: string): IMemoryService {
		const service = new MemoryService(serviceName, this._messageBus)
		this._services.set(serviceName, service)
		this._messageBus.emit('serviceAppeared', serviceName)
		return service
	}

	request<T>(
		serviceName: string,
		serviceMethodName: string,
		parameters: unknown[],
		_terms: Record<string, unknown>
	): Promise<T> {
		if (!this._services.has(serviceName)) {
			throw new Error('Service not exists!')
		}

		return this._services.get(serviceName)!.callMethod<T>(serviceMethodName, parameters)
	}

	emitTo(serviceName: string, eventName: string, parameters: unknown[], _terms: Record<string, unknown>): void {
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

	broadcast(eventName: string, parameters: unknown[], _terms: Record<string, unknown>): void {
		// eslint-disable-next-line guard-for-in
		for (const serviceName in this._services.keys()) {
			this._messageBus.emit(`${serviceName}_${eventName}`, ...parameters)
		}
	}
}

const singletonInstance = new InMemoryOrchestrator()

export default singletonInstance
