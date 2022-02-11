import { AbstractPlugin, Constructor, IPluginContainer } from '@chalupajs/interface'

export interface MethodCall<P = any> {
	parameters: unknown[]
	terms: unknown
	decoratorParameterization: P
}
export type NextAspect = (parameters: unknown[], terms: unknown) => unknown

export interface MethodAspect<P = any> {
	wrap(call: MethodCall<P>, next: NextAspect): unknown
}

export type MethodAspectMap = Map<string, { parameterization: unknown; aspect: Constructor<MethodAspect> }[]>

export class MethodAspectPlugin extends AbstractPlugin {
	private container!: IPluginContainer

	preStart(container: IPluginContainer): Promise<boolean> {
		this.container = container

		return Promise.resolve(true)
	}

	callNextAspect(
		call: MethodCall,
		parameterizedAspects: { parameterization: unknown; aspect: Constructor<MethodAspect> }[],
		index: number,
		fn: Function
	): unknown {
		if (parameterizedAspects.length === 0) {
			return fn(...call.parameters)
		}

		if (index < parameterizedAspects.length - 1) {
			const aspectInstance = this.container.get<MethodAspect>(parameterizedAspects[index].aspect)

			return aspectInstance.wrap(
				{
					...call,
					decoratorParameterization: parameterizedAspects[index].parameterization,
				},
				(parameters, terms) =>
					this.callNextAspect(
						{
							...call,
							parameters,
							terms,
						},
						parameterizedAspects,
						index + 1,
						fn
					)
			)
		}

		const aspectInstance = this.container.get<MethodAspect>(parameterizedAspects[index].aspect)

		return aspectInstance.wrap(
			{
				...call,
				decoratorParameterization: parameterizedAspects[index].parameterization,
			},
			(parameters, _terms) => fn(...parameters)
		)
	}

	onGet<T>(_accessor: Constructor<T> | string, instance: T): T {
		const proto = Object.getPrototypeOf(instance) as Object

		const methodAspectMap = (Reflect.getMetadata('method-aspects', proto) || new Map()) as MethodAspectMap

		for (const [methodName, parameterizedAspects] of methodAspectMap.entries()) {
			// @ts-ignore
			const fn = (instance[methodName] as Function).bind(instance)

			// @ts-ignore
			instance[methodName] = (...parameters: unknown[]) =>
				this.callNextAspect(
					{
						decoratorParameterization: null,
						parameters,
						terms: {},
					},
					parameterizedAspects,
					0,
					fn
				)
		}

		return instance
	}
}

export function makeAspectDecorator<P>(aspect: Constructor<MethodAspect<P>>) {
	return function (parameterization: P) {
		return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
			if (!Reflect.hasMetadata('method-aspects', target)) {
				Reflect.defineMetadata('method-aspects', new Map(), target)
			}

			const map = Reflect.getMetadata('method-aspects', target) as MethodAspectMap

			const parameterizedAspects = map.get(propertyKey) || []

			parameterizedAspects.push({
				parameterization,
				aspect,
			})

			map.set(propertyKey, parameterizedAspects)
		}
	}
}
