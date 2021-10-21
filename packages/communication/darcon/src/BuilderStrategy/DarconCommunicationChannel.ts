import { ContainerConstant, ICommunicationChannel, Inject, Injectable } from '@catamaranjs/interface'
import { newUID } from '../util'

import Darcon = darcon.Darcon

const DarconCommunication = Object.freeze({
	Request: 'R',
	Inform: 'I',
})

@Injectable()
export class DarconCommunicationChannel implements ICommunicationChannel {
	private _darcon: Darcon
	private _serviceName: string

	constructor(@Inject('darcon') darcon: darcon.Darcon, @Inject(ContainerConstant.SERVICE_NAME) serviceName: string) {
		this._darcon = darcon
		this._serviceName = serviceName
	}

	emit(serviceName: string, eventName: any, parameters: any[], terms: Record<string, any>): void {
		const flowID = terms.flowID ?? newUID()
		const processID = terms.processID ?? newUID()

		// eslint-disable-next-line no-void
		void this._darcon.comm(DarconCommunication.Inform, flowID, processID, serviceName, eventName, parameters, terms)
	}

	request<T>(
		serviceName: string,
		serviceMethodName: string,
		parameters: any[],
		terms: Record<string, any>
	): Promise<T> {
		const flowID = terms.flowID ?? newUID()
		const processID = terms.processID ?? newUID()

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this._darcon.comm(
			DarconCommunication.Request,
			flowID,
			processID,
			serviceName,
			serviceMethodName,
			parameters,
			terms
		)
	}

	services(serviceName: string): Promise<string[]> {
		const flowID = newUID()
		const processID = newUID()

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this._darcon.comm(DarconCommunication.Request, flowID, processID, serviceName, 'services', [], {})
	}

	broadcast(eventName: string, _parameters: any[], _terms: Record<string, any>) {
		// eslint-disable-next-line no-void
		void this._darcon.proclaim(this._serviceName, eventName, _terms)
	}
}
