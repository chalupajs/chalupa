import "reflect-metadata"
import { Injectable, Inject, MultiInject } from "../decorators";
import { METADATA_KEY } from "inversify";
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
				constructor(@Inject(mustBeInjected) _a: mustBeInjected) {}
			}

			const paramsMetadata = Reflect.getMetadata(METADATA_KEY.TAGGED, someClass);
			expect(typeof paramsMetadata).toBe('object')
		})
	})
	describe('@MultiInject', () => {
		it('hould have tagged metadata', () => {
			class mustBeInjected {}
			class someClass {
				constructor(@MultiInject(mustBeInjected) _a: mustBeInjected) {}
			}
			const paramsMetadata = Reflect.getMetadata(METADATA_KEY.TAGGED, someClass);
			expect(typeof paramsMetadata).toBe('object')
		})
	})
})
