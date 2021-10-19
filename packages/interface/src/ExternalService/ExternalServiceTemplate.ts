/* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable } from '../Container/decorators'
import { ContainerConstant } from '../constants'
import { ICommunicationChannel } from './ICommunicationChannel'
import {Metadata} from "../metadata/Metadata";

(function assignExternalServiceMetadata() {
	Reflect.defineMetadata(Metadata.METADATA_EXTERNAL_SERVICE, true, ExternalServiceTemplate)
})()

/**
 * Abstract base for classes representing external services.
 */
@Injectable()
export class ExternalServiceTemplate {
	private readonly serviceName!: string

	private communicationChannel: ICommunicationChannel

	constructor(
		@Inject(ContainerConstant.COMMUNICATION_CHANNEL_INTERFACE) communicationChannel: ICommunicationChannel
	) {
		this.communicationChannel = communicationChannel
	}

	/**
	 * Make a request-reply call to the specified method.
	 * @param serviceMethodName The name of the called method.
	 * @param parameters An array of arbitrary parameters, passed to the method.
	 * @param terms Additional terms of the call.
	 * @returns The received response.
	 */
	async request<T>(serviceMethodName: string, parameters: any[] = [], terms: Record<string, any> = {}): Promise<T> {
		return this.communicationChannel.request<T>(this.serviceName, serviceMethodName, parameters, terms)
	}

	/**
	 * Fire the specified event (in a fire-and-forget manner).
	 * @param eventName The name of the target event to be fired.
	 * @param props An arbitrary array of event props.
	 * @param terms Additional terms of the event.
	 */
	emit(eventName: any, props: any[] = [], terms: Record<string, any> = {}): void {
		return this.communicationChannel.emit(this.serviceName, eventName, props, terms)
	}

	/**
	 * List the provided services (methods and events) of the service.
	 * @returns The array of provided events and methods.
	 */
	async services(): Promise<string[]> {
		return this.communicationChannel.services(this.serviceName)
	}
}

/**
 * Dummy implementation for functions, marked with the `ExternalServiceMethod` annotation.
 */
// @ts-expect-error
export function serviceMethodPlaceholder(..._parameters: any[]): IExternalServiceCall {
	// Intentionally left blank.
}

/**
 * Dummy implementation for functions, marked with the `ExternalServiceEvent` annotation.
 */
// @ts-expect-error
export function serviceEventPlaceholder(..._parameters: any[]): IExternalServiceEmit {
	// Intentionally left blank.
}

/**
 * A command object, representing an event waiting to be fired.
 */
export interface IExternalServiceEmit<T = any> {
	/**
	 * Adds additional terms to the event.
	 * @param terms Additional terms.
	 */
	withTerms(terms: Record<string, any>): this

	/**
	 * Fires the event with optional additional terms.
	 * @param terms Additional terms.
	 */
	send(terms?: Record<string, any>): Promise<T>
}

export class ExternalServiceEmit<T = any> implements IExternalServiceEmit<T> {
	private readonly _communicationChannel: ICommunicationChannel

	private readonly _externalServiceName: string
	private readonly _externalServiceMethod: string
	private _terms: Record<string, any> = {}

	private readonly _params: any[]

	constructor(
		communicationChannel: ICommunicationChannel,
		externalServiceName: string,
		externalServiceMethod: string,
		parameters: any[]
	) {
		this._communicationChannel = communicationChannel
		this._externalServiceName = externalServiceName
		this._externalServiceMethod = externalServiceMethod
		this._params = parameters
	}

	withTerms(terms: Record<string, any>): this {
		this._terms = terms
		return this
	}

	async send(terms?: Record<string, any>): Promise<any> {
		const finalTerms = { ...this._terms, ...terms }
		return this._communicationChannel.emit(
			this._externalServiceName,
			this._externalServiceMethod,
			this._params,
			finalTerms
		)
	}
}

/**
 * Test double for emitting events that resolve with a pre-set value.
 */
export class EmitWithResult<T = any> implements IExternalServiceEmit<T> {
	private constructor(private readonly result: T) {}

	/**
	 * Create a new event double that can be used to stub external services.
	 * @param result The pre-set result of the event emission.
	 */
	static of<T>(result: T): EmitWithResult<T> {
		return new EmitWithResult<T>(result)
	}

	withTerms(_terms: Record<string, any>): this {
		return this
	}

	async send(_terms?: Record<string, any>): Promise<T> {
		return Promise.resolve(this.result)
	}
}

/**
 * A command object, representing an external service call waiting to be made.
 * @template T The type of the response.
 */
export interface IExternalServiceCall<T = any> {
	/**
	 * Adds additional terms to the call.
	 * @param terms Additional terms.
	 */
	withTerms(terms: Record<string, any>): this

	/**
	 * Performs the request and waits for the reply.
	 * @param terms Additional terms to the request.
	 * @returns The received response.
	 */
	send(terms?: Record<string, any>): Promise<T>
}

export class ExternalServiceCall<T = any> implements IExternalServiceCall<T> {
	private readonly _communicationChannel: ICommunicationChannel

	private readonly _externalServiceName: string
	private readonly _externalServiceMethod: string
	private _terms: Record<string, any> = {}

	private readonly _params: any[]

	constructor(
		communicationChannel: ICommunicationChannel,
		externalServiceName: string,
		externalServiceMethod: string,
		parameters: any[]
	) {
		this._communicationChannel = communicationChannel
		this._externalServiceName = externalServiceName
		this._externalServiceMethod = externalServiceMethod
		this._params = parameters
	}

	withTerms(terms: Record<string, any>): this {
		this._terms = terms
		return this
	}

	async send(terms?: Record<string, any>): Promise<T> {
		const finalTerms = { ...this._terms, ...terms }
		return this._communicationChannel.request<T>(
			this._externalServiceName,
			this._externalServiceMethod,
			this._params,
			finalTerms
		)
	}
}

/**
 * Test double for method calls that respond with a pre-set value.
 */
export class CallWithResult<T = any> implements IExternalServiceCall<T> {
	private constructor(private readonly result: T) {}

	/**
	 * Create a new method call double that can be used to stub external services.
	 * @param result The pre-set result (or, response) of the method call.
	 * @template T The type of the result.
	 */
	static of<T>(result: T): CallWithResult<T> {
		return new CallWithResult<T>(result)
	}

	withTerms(_terms: Record<string, any>): this {
		return this
	}

	async send(_terms?: Record<string, any>): Promise<T> {
		return Promise.resolve(this.result)
	}
}
