declare namespace darcon {
	interface Darcon {
		finalised: boolean
		comm(
			mode: string,
			flowID: string,
			processID: string,
			entity: any,
			message: any,
			parameters: any[],
			terms: any
		): Promise<any>
		inform(
			flowID: string,
			processID: string,
			entity: any,
			message: any,
			parameters: any[],
			terms: any
		): Promise<any>
		request(
			flowID: string,
			processID: string,
			entity: any,
			message: any,
			parameters: any[],
			terms: any
		): Promise<any>
		publish(entity: any, options: any): Promise<any>
		proclaim(serviceName: string, eventName: string, terms: Record<string, any>): Promise<any>
	}
}
