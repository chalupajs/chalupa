import { EventCallable, ICommunicationFacade, MethodCallable } from './ICommunicationFacade'
import { ServiceAppearedCallback, ServiceDisappearedCallback } from './NetworkEventCallbacks'

export abstract class AbstractCommunicationFacade implements ICommunicationFacade {
	init(_serviceName: string): Promise<void> {
		return Promise.resolve()
	}

	connectToNetwork(): Promise<void> {
		return Promise.resolve()
	}

	addEventHandler(_eventName: string, _callable: EventCallable): void {}

	addMethodHandler(_methodName: string, _callable: MethodCallable): void {}

	onServiceDisappeared(_cb: ServiceDisappearedCallback): void {}

	onServiceAppeared(_cb: ServiceAppearedCallback): void {}

	closeSelf(): Promise<void> {
		return Promise.resolve()
	}

	publishSelf(): Promise<void> {
		return Promise.resolve()
	}
}
