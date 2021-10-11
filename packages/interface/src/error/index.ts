export namespace Errors {
	/**
	 * Thrown if something is decorated multiple types with a decorator
	 * that forbids such cases.
	 */
	export class AlreadyDecoratedError extends Error {
		constructor(readonly target: string, readonly decorator: string) {
			super(`${target} is already decorated with @${decorator}`)
		}
	}

	/**
	 * Thrown if the type passed to Catamaran is not decorated with
	 * the Service decorator.
	 */
	export class MissingServiceDecoratorError extends Error {
		constructor(type: string) {
			super(`${type} is not decorated with the mandatory @Service decorator!`)
		}
	}
}
