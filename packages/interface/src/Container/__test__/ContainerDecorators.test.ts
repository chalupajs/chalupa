import 'reflect-metadata'
import { Injectable, Inject, MultiInject } from '../decorators'

const CLASS_IS_INJECTABLE_FLAG_REFLECT_KEY = '@inversifyjs/core/classIsInjectableFlagReflectKey'
const CLASS_METADATA_REFLECT_KEY = '@inversifyjs/core/classMetadataReflectKey'

describe('Container decorators', () => {
	describe('@Injectable', () => {
		it('should have @Injectable metadata', () => {
			class mustBeInjectable {}
			const injectableConstructor = Injectable()(mustBeInjectable)
			const isConstructorDecorated = Reflect.hasOwnMetadata(
				CLASS_IS_INJECTABLE_FLAG_REFLECT_KEY,
				injectableConstructor,
			)
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

			const classMetadata = Reflect.getMetadata(CLASS_METADATA_REFLECT_KEY, someClass) as {
				constructorArguments: { value: unknown }[]
			}
			expect(classMetadata.constructorArguments[0]?.value).toBe(mustBeInjected)
		})
	})
	describe('@MultiInject', () => {
		it('hould have tagged metadata', () => {
			class mustBeInjected {}
			class someClass {
				// eslint-disable-next-line no-useless-constructor
				constructor(@MultiInject(mustBeInjected) _a: mustBeInjected) {}
			}
			const classMetadata = Reflect.getMetadata(CLASS_METADATA_REFLECT_KEY, someClass) as {
				constructorArguments: { value: unknown }[]
			}
			expect(classMetadata.constructorArguments[0]?.value).toBe(mustBeInjected)
		})
	})
})
