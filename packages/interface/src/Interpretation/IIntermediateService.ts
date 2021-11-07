import { Constructor } from '../types'
import { ServiceOptions } from '../Service/decorators'
import { IDependencyGraph } from '../DependencyGraph'
import { IServiceBridge } from './IServiceBridge'
import {Container} from "inversify";
import {IInjectContainer} from "../Container/IInjectContainer";

export interface IIntermediateService {
	container: Container
	injectContainer: IInjectContainer
	serviceConstructor: Constructor
	serviceOptions: ServiceOptions
	moduleDependencyGraph: IDependencyGraph<Constructor>
	bridge(): IServiceBridge
}
