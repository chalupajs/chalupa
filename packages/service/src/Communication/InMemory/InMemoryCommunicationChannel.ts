import { ICommunicationChannel, Injectable } from "@catamaranjs/interface";
import InMemoryOrchestrator from "./InMemoryOrchestrator";

@Injectable()
export class InMemoryCommunicationChannel implements ICommunicationChannel {

	emit(serviceName: string, eventName: any, parameters: any[], terms: Record<string, any>): void {
		InMemoryOrchestrator.emitTo(
			serviceName,
			eventName,
			parameters,
			terms
		)
	}

	request<T>(serviceName: string, serviceMethodName: string, parameters: any[], terms: Record<string, any>): Promise<T> {
		return InMemoryOrchestrator.request<T>(
			serviceName,
			serviceMethodName,
			parameters,
			terms
		)
	}

	services(serviceName: string): Promise<string[]> {
		return InMemoryOrchestrator.methods(serviceName)
	}

	broadcast(eventName: string, parameters: any[], terms: Record<string, any>): void {
		InMemoryOrchestrator.broadcast(eventName, parameters, terms)
	}
}
