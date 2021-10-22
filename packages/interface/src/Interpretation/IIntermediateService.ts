import { Container } from 'inversify'
import { Constructor } from '../types'
import { ServiceOptions } from '../Service/decorators'
import { IDependencyGraph } from '../DependencyGraph'
import { IServiceBridge } from './IServiceBridge'

export interface IIntermediateService {
	container: Container
	serviceConstructor: Constructor
	serviceOptions: ServiceOptions
	moduleDependencyGraph: IDependencyGraph<Constructor>
	bridge(): IServiceBridge
}
