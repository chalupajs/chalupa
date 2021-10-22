import { ICommunicationFacade } from '../Communication/ICommunicationFacade'
import { Constructor } from '../types'

import { IServiceBridgeOrchestrator } from './IServiceBridgeOrchestrator'

export interface IServiceBridge {
	useFacade(facade: Constructor<ICommunicationFacade>): IServiceBridgeOrchestrator
}
