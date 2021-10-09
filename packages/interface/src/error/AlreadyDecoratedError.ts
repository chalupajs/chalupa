/**
 * Thrown if something is decorated multiple types with a decorator
 * that forbids such cases.
 */
export class AlreadyDecoratedError extends Error {
	constructor(readonly target: string, readonly decorator: string) {
		super(`${target} is already decorated with @${decorator}`)
	}
}
