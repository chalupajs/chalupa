import Helper from '@codeceptjs/helper'

class ExampleHelper extends Helper {
	// before/after hooks
	_before() {
		// remove if not used
	}

	_after() {
		// remove if not used
	}

	ping(): string {
		return 'pong'
	}
}

export = ExampleHelper
