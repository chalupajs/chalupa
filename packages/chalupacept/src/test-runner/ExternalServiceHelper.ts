// @ts-ignore
import Helper from '@codeceptjs/helper'

import { Constructor, IExternalService } from '@chalupajs/interface'
import { communicationService } from './CommunicationService'

class ExternalServiceHelper extends Helper {
	getExternalService<T extends IExternalService>(serviceConstructor: Constructor<T>): Promise<T> {
		return communicationService.getExternalService<T>(serviceConstructor)
	}
}

export = ExternalServiceHelper
