import { Container } from 'inversify'
import { Constructor } from '../types'
import { ServiceOptions } from '../Service/decorators'
import { IDependencyGraph } from '../DependencyGraph'
import { IInjectContainer } from '../Container/IInjectContainer'
import { IServiceBridge } from './IServiceBridge'

export interface IIntermediateService {
	container: Container
	injectContainer: IInjectContainer
	serviceConstructor: Constructor
	serviceOptions: ServiceOptions
	moduleDependencyGraph: IDependencyGraph<Constructor>
	bridge(): IServiceBridge
}
