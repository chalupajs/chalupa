export interface LogFunction {
	<T extends Record<string, unknown>>(object: T, message?: string, ...args: any[]): void
	(message: string, ...args: any[]): void
}
