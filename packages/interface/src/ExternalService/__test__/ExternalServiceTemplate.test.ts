import "reflect-metadata"

import { ExternalServiceTemplate } from '../ExternalServiceTemplate'
import { ICommunicationChannel } from "@catamaranjs/interface";

const emitMock = jest.fn()
const servicesMock = jest.fn()
const requestMock = jest.fn()
const broadcastMock = jest.fn()

const CommunicationChannelMock: ICommunicationChannel = {
	emit: emitMock,
	broadcast: broadcastMock,
	services: servicesMock,
	request: requestMock
}

describe('ExternalServiceTemplate tests', () => {
	let externalService: ExternalServiceTemplate | undefined
	beforeAll(() => {
		externalService = new ExternalServiceTemplate(CommunicationChannelMock)
	})

	it('should call emit with correct parameters', () => {
		// Given
		const eventName: string = 'randomEvent'
		const parameters: any[] = [1, true, 'asd']
		const terms: Record<string, any> = {}

		// When
		externalService?.emit(eventName, parameters, terms)

		// Then
		expect(emitMock).toBeCalled()
		expect(emitMock).toBeCalledWith(undefined, eventName, parameters, terms)
	})

	it('should call services with correct parameters', () => {
		// Given

		// When
		externalService?.services()

		// Then
		expect(servicesMock).toBeCalled()
		expect(servicesMock).toBeCalledWith(undefined)
	})

	it('should call request with correct parameters', () => {
		// Given
		const serviceName: string | undefined = undefined
		const serviceMethodName: string = 'Example'
		const parameters: any[] = [1, 2, true, 'asd']
		const terms: Record<string, any> = {
			a: 1,
			b: true
		}

		// When
		externalService?.request(serviceMethodName, parameters, terms)

		// Then
		expect(requestMock).toBeCalled()
		expect(requestMock).toBeCalledWith(serviceName, serviceMethodName, parameters, terms)
	})

})
