import { ServiceAppearedCallback, ServiceDisappearedCallback } from './NetworkEventCallbacks'

export type MethodCallable = (parameters: any[], terms: Record<string, any>) => Promise<any>
export type EventCallable = (parameters: any[], terms: Record<string, any>) => Promise<any>

export interface ICommunicationFacade {
	init(serviceName: string): Promise<void>
	connectToNetwork(): Promise<void>
	publishSelf(): Promise<void>
	closeSelf(): Promise<void>
	addMethodHandler(methodName: string, callable: MethodCallable): void
	addEventHandler(eventName: string, callable: EventCallable): void
	onServiceDisappeared(cb: ServiceDisappearedCallback): void
	onServiceAppeared(cb: ServiceAppearedCallback): void
}
