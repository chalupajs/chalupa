import 'reflect-metadata'
import { METADATA_KEY } from 'inversify'
import { Module, PreServiceInit, PostServiceInit, PreServiceDestroy, PostServiceDestroy } from '../decorators'
import { Metadata } from '../../metadata/Metadata'
import { Errors } from '../../error'

describe('Module decorators', () => {
	describe('Lifecycle decorators', () => {
		describe('@PreServiceInit', () => {
			it('should asign the correct metadata', () => {
				// Given
				class SomeClass {
					preServiceMethod() {}
				}
				expect(
					Reflect.hasMetadata(Metadata.METADATA_MODULE_LIFECYCLE_PRE_SERVICE_INIT, SomeClass.prototype)
				).toBeFalsy()

				// When
				class SomeClass2 {
					@PreServiceInit()
					preServiceMethod() {}
				}

				// Then
				expect(
					Reflect.hasMetadata(Metadata.METADATA_MODULE_LIFECYCLE_PRE_SERVICE_INIT, SomeClass2.prototype)
				).toBeTruthy()
			})
		})
		describe('@PostServiceInit', () => {
			it('should asign the correct metadata', () => {
				// Given
				class SomeClass {
					postServiceMethod() {}
				}
				expect(
					Reflect.hasMetadata(Metadata.METADATA_MODULE_LIFECYCLE_POST_SERVICE_INIT, SomeClass.prototype)
				).toBeFalsy()

				// When
				class SomeClass2 {
					@PostServiceInit()
					postServiceMethod() {}
				}

				// Then
				expect(
					Reflect.hasMetadata(Metadata.METADATA_MODULE_LIFECYCLE_POST_SERVICE_INIT, SomeClass2.prototype)
				).toBeTruthy()
			})
		})
		describe('@PreServiceDestroy', () => {
			it('should asign the correct metadata', () => {
				// Given
				class SomeClass {
					preServiceMethod() {}
				}
				expect(
					Reflect.hasMetadata(Metadata.METADATA_MODULE_LIFECYCLE_PRE_SERVICE_DESTROY, SomeClass.prototype)
				).toBeFalsy()

				// When
				class SomeClass2 {
					@PreServiceDestroy()
					preServiceMethod() {}
				}

				// Then
				expect(
					Reflect.hasMetadata(Metadata.METADATA_MODULE_LIFECYCLE_PRE_SERVICE_DESTROY, SomeClass2.prototype)
				).toBeTruthy()
			})
		})
		describe('@PostServiceDestroy', () => {
			it('should asign the correct metadata', () => {
				// Given
				class SomeClass {
					postServiceMethod() {}
				}
				expect(
					Reflect.hasMetadata(Metadata.METADATA_MODULE_LIFECYCLE_POST_SERVICE_DESTROY, SomeClass.prototype)
				).toBeFalsy()

				// When
				class SomeClass2 {
					@PostServiceDestroy()
					postServiceMethod() {}
				}

				// Then
				expect(
					Reflect.hasMetadata(Metadata.METADATA_MODULE_LIFECYCLE_POST_SERVICE_DESTROY, SomeClass2.prototype)
				).toBeTruthy()
			})
		})
	})
	describe('@Module decorator', () => {
		it('should throw when decorated multiple times', () => {
			// Given
			class SomeModule {}

			// When
			function decorateMultipleTimes() {
				Module()(Module()(SomeModule))
			}

			// Then
			expect(decorateMultipleTimes).toThrow(Errors.AlreadyDecoratedError)
		})
		it('should assign the correct metadata with the provided options', () => {
			// Given
			class SomeModule {}
			class ConfigClass {}

			// When
			const configs = {
				config: ConfigClass,
			}
			Module(configs)(SomeModule)

			// Then
			expect(Reflect.getMetadata(Metadata.METADATA_MODULE_INJECTED, SomeModule)).toBeTruthy()
			expect(Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, SomeModule)).toBeTruthy()
			expect(Reflect.getMetadata(Metadata.METADATA_MODULE_OPTIONS, SomeModule)).toBe(configs)
		})
	})
})
