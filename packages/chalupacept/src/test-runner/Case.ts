import { expect } from 'chai'

import { describe, it, xit, after, before, beforeEach, afterEach, teardown, setup } from 'mocha'

import { Chalupacept } from './interface'

export function Case(caseName: string, cb: (context: Chalupacept.TestContext) => void) {
	describe(caseName, () => {
		cb({
			describe,
			it,
			xit,
			after,
			before,
			beforeEach,
			afterEach,
			teardown,
			setup,
			// @ts-ignore
			I: {
				say(message: string) {
					console.log(message)
				},
				expect,
			},
		})
	})
}
