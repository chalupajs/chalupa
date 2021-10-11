import { Container } from 'inversify'
import { Constructor } from '../types'
import { ILogger } from "../Log/ILogger";
import { ServiceOptions } from "../Service/decorators";
import { IServiceBridge } from "./IServiceBridge";

export interface IIntermediateService {
	container: Container
	serviceConstructor: Constructor
	serviceOptions: ServiceOptions
	bindLogger(logger: ILogger): void
	timeout(ms: number): Promise<void>
	getServiceFromContainer (): any
	bridge(): IServiceBridge
}
