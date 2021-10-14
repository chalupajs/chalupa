import { Container } from 'inversify'
import { Constructor } from '../types'
import { ILogger } from "../Log/ILogger";
import { ServiceOptions } from "../Service/decorators";
import { IServiceBridge } from "./IServiceBridge";
import {IDependencyGraph} from "../DependencyGraph";

export interface IIntermediateService {
	container: Container
	serviceConstructor: Constructor
	serviceOptions: ServiceOptions
	moduleDependencyGraph: IDependencyGraph<Constructor>
	bindLogger(logger: ILogger): void
	timeout(ms: number): Promise<void>
	getServiceFromContainer (): any
	bridge(): IServiceBridge
}
