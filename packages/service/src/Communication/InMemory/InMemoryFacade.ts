import {
	AbstractCommunicationFacade,
	ICommunicationChannel,
	ContainerConstant,
	ServiceAppearedCallback,
	ServiceDisappearedCallback,
	IFacadeContainer,
	MethodCallable,
	EventCallable,
} from '@chalupajs/interface'
import { InMemoryCommunicationChannel } from './InMemoryCommunicationChannel'
import InMemoryOrchestrator, { IMemoryService } from './InMemoryOrchestrator'

export class InMemoryFacade extends AbstractCommunicationFacade {
	// @ts-ignore
	private _facadeContainer: IFacadeContainer

	private _serviceName?: string

	private _memoryService?: IMemoryService

	constructor(facadeContainer: IFacadeContainer) {
		super()
		this._facadeContainer = facadeContainer
	}

	onServiceDisappeared(cb: ServiceDisappearedCallback) {
		InMemoryOrchestrator.onServiceDisappeared(async (serviceName: string) => {
			await cb(serviceName)
		})
	}

	onServiceAppeared(cb: ServiceAppearedCallback) {
		InMemoryOrchestrator.onServiceAppeared(async (serviceName: string) => {
			await cb(serviceName)
		})
	}

	async init(serviceName: string) {
		this._serviceName = serviceName

		this._facadeContainer.bindInterface<ICommunicationChannel>(
			ContainerConstant.COMMUNICATION_CHANNEL_INTERFACE,
			InMemoryCommunicationChannel
		)
		return Promise.resolve()
	}

	async connectToNetwork() {
		this._memoryService = InMemoryOrchestrator.createService(this._serviceName!)
		return Promise.resolve()
	}

	async publishSelf(): Promise<void> {
		this._memoryService?.connect()
		InMemoryOrchestrator.keepServiceAlive()
		return Promise.resolve()
	}

	async closeSelf() {
		InMemoryOrchestrator.close()
		return Promise.resolve()
	}

	addEventHandler(eventName: string, callable: EventCallable): void {
		this._memoryService?.addEvent(eventName, callable)
	}

	addMethodHandler(methodName: string, callable: MethodCallable): void {
		this._memoryService?.addMethod(methodName, callable)
	}
}
