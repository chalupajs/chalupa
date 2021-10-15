import { ensureInjectable } from '../annotation_utils'
import { METADATA_KEY } from "inversify";
import { Injectable } from "../Container/decorators";
describe('ensureInjectable', () => {
	it('should return an @Injectable decorated constructor when it is not decorated already', () => {
		// Given
		class nonInjectableClass {}

		expect(Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, nonInjectableClass)).toBeFalsy()
		// When
		ensureInjectable(nonInjectableClass)

		// Then
		expect(Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, nonInjectableClass)).toBeTruthy()
	})
	it('should not throw when call on already decorated constructor', () => {
		// Given
		@Injectable()
		class injectableClass {}

		expect(Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, injectableClass)).toBeTruthy()
		// When
		function shouldNotThrow() {
			ensureInjectable(injectableClass)
		}

		// Then
		expect(shouldNotThrow).not.toThrow()
	})
})
