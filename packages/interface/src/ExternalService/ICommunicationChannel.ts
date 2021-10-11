export interface ICommunicationChannel {
	request<T>(serviceName: string, serviceMethodName: string, parameters: any[], terms: Record<string, any>): Promise<T>
	emit(serviceName: string, eventName: any, parameters: any[], terms: Record<string, any>): void
	services(serviceName: string): Promise<string[]>
	broadcast(eventName: string, parameters: any[], terms: Record<string, any>): void
}
