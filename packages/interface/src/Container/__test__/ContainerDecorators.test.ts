import 'reflect-metadata'
import { METADATA_KEY } from 'inversify'
import { Injectable, Inject, MultiInject } from '../decorators'

describe('Container decorators', () => {
	describe('@Injectable', () => {
		it('should have @Injectable metadata', () => {
			class mustBeInjectable {}
			const injectableConstructor = Injectable()(mustBeInjectable)
			const isConstructorDecorated = Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, injectableConstructor)
			expect(isConstructorDecorated).toBeTruthy()
		})
	})
	describe('@Inject', () => {
		it('should have tagged metadata', () => {
			class mustBeInjected {}
			class someClass {
				// eslint-disable-next-line no-useless-constructor
				constructor(@Inject(mustBeInjected) _a: mustBeInjected) {}
			}

			const parametersMetadata = Reflect.getMetadata(METADATA_KEY.TAGGED, someClass) as Record<string, any>
			expect(typeof parametersMetadata).toBe('object')
		})
	})
	describe('@MultiInject', () => {
		it('hould have tagged metadata', () => {
			class mustBeInjected {}
			class someClass {
				// eslint-disable-next-line no-useless-constructor
				constructor(@MultiInject(mustBeInjected) _a: mustBeInjected) {}
			}
			const parametersMetadata = Reflect.getMetadata(METADATA_KEY.TAGGED, someClass) as Record<string, any>
			expect(typeof parametersMetadata).toBe('object')
		})
	})
})
