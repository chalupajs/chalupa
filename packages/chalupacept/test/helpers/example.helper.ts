import { Helper } from '../../src/index'

export default class ExampleHelper extends Helper {
	// Before/after hooks
	_before() {
		// Remove if not used
	}

	_after() {
		// Remove if not used
	}

	ping(): string {
		return 'pong'
	}
}
