import { Metadata } from '../metadata/Metadata'

export interface IServiceBridge {
	respectDelayedStart(): Promise<IServiceBridge>
	callLifecycleMethodOnService(symbol: Metadata.ServiceLifecycle): Promise<IServiceBridge>
	callNetworkEvent(symbol: Metadata.NetworkEvent, parameters: any[]): Promise<IServiceBridge>
	serviceMethodHandler(cb: (externalName: string, fn: any) => void): IServiceBridge
	serviceEventHandler(cb: (externalName: string, fn: any) => void): IServiceBridge
	buildDependencyTree(): IServiceBridge
	suppressEventWarning(): IServiceBridge
	suppressMethodWarning(): IServiceBridge
}
