/**
 * Thrown if the type passed to Catamaran is not decorated with
 * the Service decorator.
 */
export class MissingServiceDecoratorError extends Error {
	constructor(type: string) {
		super(`${type} is not decorated with the mandatory @Service decorator!`)
	}
}
