/**
 * Methods of Helper class will be available in tests in `I` object.
 */
import { Suite, Test } from 'mocha'

export abstract class Helper {
	config: any
	options: any

	/**
	 *
	 * @param {*} config
	 */
	protected constructor(config: any) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this.config = config
	}

	/**
	 * Abstract method to provide required config options
	 * @return {*}
	 * @protected
	 */
	static _config() {}

	/**
	 * Abstract method to validate config
	 * @param {*} config
	 * @returns {*}
	 * @protected
	 */
	_validateConfig(config: any): any {
		return config
	}

	/**
	 * Sets config for current test
	 * @param {*} options
	 * @protected
	 */
	_setConfig(options: any): void {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this.options = this._validateConfig(options)
	}

	/**
	 * Hook executed before all tests
	 * @protected
	 */
	_init() {}

	/**
	 * Hook executed before each test.
	 * @protected
	 */
	_before() {}

	/**
	 * Hook executed after each test
	 * @protected
	 */
	_after() {}

	/**
	 * Hook executed after each passed test
	 *
	 * @param {Mocha.Test} _test
	 * @protected
	 */
	_passed(_test: Test) {}

	/**
	 * Hook executed after each failed test
	 *
	 * @param {Mocha.Test} _test
	 * @protected
	 */
	_failed(_test: Test) {}

	/**
	 * Hook executed before each suite
	 *
	 * @param {Mocha.Suite} _suite
	 * @protected
	 */
	_beforeSuite(_suite: Suite) {}

	/**
	 * Hook executed after each suite
	 *
	 * @param {Mocha.Suite} _suite
	 * @protected
	 */
	_afterSuite(_suite: Suite) {}

	/**
	 * Hook executed after all tests are executed
	 *
	 * @param {Mocha.Suite} _suite
	 * @protected
	 */
	_finishTest(_suite: Suite) {}
}
