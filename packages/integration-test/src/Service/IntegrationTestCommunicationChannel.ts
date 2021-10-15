import {ICommunicationChannel} from "@catamaranjs/interface";

export class IntegrationTestCommunicationChannel implements ICommunicationChannel {
	broadcast(eventName: string, parameters: any[], _terms: Record<string, any>): void {
		throw new Error(`
Ooops, you forgot to properly mock this communication:

  Broadcast:
	${eventName}
  Parameters:
	${parameters.join(', ')}
`)
	}

	emit(serviceName: string, eventName: any, parameters: any[], _terms: Record<string, any>): void {
		throw new Error(`
Ooops, you forgot to properly mock this communication:

  Emit:
	${serviceName}.${eventName}
  Parameters:
	${parameters.join(', ')}
`)
	}

	request<T>(serviceName: string, serviceMethodName: string, parameters: any[], _terms: Record<string, any>): Promise<T> {
		throw new Error(`
Ooops, you forgot to properly mock this communication:

  Request:
	${serviceName}.${serviceMethodName}
  Parameters:
	${parameters.join(', ')}
`)
	}

	services(serviceName: string): Promise<string[]> {
		throw new Error(`Ooops, you forgot to properly mock the services call of ${serviceName}`)
	}
}
