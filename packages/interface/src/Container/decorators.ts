import { inject, injectable, multiInject } from 'inversify'
import { Constructor } from '../types'

/**
 * Marks a parameter as an injection target for the container. The injected instance
 * is determined through the parameter of this annotation.
 * @param injectable A string key or a constructor type used to determine the injected instance.
 */
export function Inject(injectable: string | symbol | Constructor) {
	return function (target: Record<string, unknown>, propertyKey: string, parameterIndex: number) {
		inject(injectable)(target, propertyKey, parameterIndex)
	}
}

/**
 * Marks a class or constructor function as injectable, meaning:
 *   * it can be used to fulfill dependency injection requests,
 *   * it can be injected into.
 */
export function Injectable() {
	return function (target: any): any {
		return injectable()(target)
	}
}

/**
 * Marks a parameter as a multi-injection target for the container. This means, that every binding
 * bound to the parameter of this annotation will be injected as an array.
 * @param injectable A string key or a constructor type used to determine the multi-injected instances.
 */
export function MultiInject(injectable: string | symbol | Constructor) {
	return function (target: Record<string, unknown>, propertyKey: string, parameterIndex: number) {
		multiInject(injectable)(target, propertyKey, parameterIndex)
	}
}
