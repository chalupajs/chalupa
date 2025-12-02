import { ensureInjectable } from '../annotation_utils'
import { Injectable } from '../Container/decorators'

const CLASS_IS_INJECTABLE_FLAG_REFLECT_KEY = '@inversifyjs/core/classIsInjectableFlagReflectKey'

describe('ensureInjectable', () => {
	it('should return an @Injectable decorated constructor when it is not decorated already', () => {
		// Given
		class nonInjectableClass {}

		expect(Reflect.hasOwnMetadata(CLASS_IS_INJECTABLE_FLAG_REFLECT_KEY, nonInjectableClass)).toBeFalsy()
		// When
		ensureInjectable(nonInjectableClass)

		// Then
		expect(Reflect.hasOwnMetadata(CLASS_IS_INJECTABLE_FLAG_REFLECT_KEY, nonInjectableClass)).toBeTruthy()
	})
	it('should not throw when call on already decorated constructor', () => {
		// Given
		@Injectable()
		class injectableClass {}

		expect(Reflect.hasOwnMetadata(CLASS_IS_INJECTABLE_FLAG_REFLECT_KEY, injectableClass)).toBeTruthy()
		// When
		function shouldNotThrow() {
			ensureInjectable(injectableClass)
		}

		// Then
		expect(shouldNotThrow).not.toThrow()
	})
})
