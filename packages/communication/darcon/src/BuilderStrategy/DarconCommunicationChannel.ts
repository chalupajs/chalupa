import { ContainerConstant, ICommunicationChannel, Inject, Injectable } from '@catamaranjs/interface'
import Darcon = darcon.Darcon
import { newUID } from '../util'

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

		this._darcon.comm(DarconCommunication.Inform, flowID, processID, serviceName, eventName, parameters, terms)
	}

	request<T>(
		serviceName: string,
		serviceMethodName: string,
		parameters: any[],
		terms: Record<string, any>
	): Promise<T> {
		const flowID = terms.flowID ?? newUID()
		const processID = terms.processID ?? newUID()

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

		return this._darcon.comm(DarconCommunication.Request, flowID, processID, serviceName, 'services', [], {})
	}

	broadcast(eventName: string, _parameters: any[], _terms: Record<string, any>) {
		this._darcon.proclaim(this._serviceName, eventName, _terms)
	}
}
