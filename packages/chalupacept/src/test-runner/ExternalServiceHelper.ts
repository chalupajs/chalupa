import { Constructor, IExternalService } from '@chalupajs/interface'
import { communicationService } from './CommunicationService'
import { Helper } from './Helper'

export interface IExternalServiceHelper {
	getExternalService<T extends IExternalService>(serviceConstructor: Constructor<T>): Promise<T>
}

export default class ExternalServiceHelper extends Helper implements IExternalServiceHelper {
	getExternalService<T extends IExternalService>(serviceConstructor: Constructor<T>): Promise<T> {
		return communicationService.getExternalService<T>(serviceConstructor)
	}
}
