export namespace Errors {

	export class CLIError extends Error {}

	export class ChalupaceptConfigNotFoundError extends CLIError {
		constructor() {
			super(`Chalupacept config not found 'chalupacept.config.ts'`)
		}
	}

}
