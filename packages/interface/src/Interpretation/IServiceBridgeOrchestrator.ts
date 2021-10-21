export interface IServiceBridgeOrchestrator {
	start(): Promise<void>
	close(): Promise<void>
}
