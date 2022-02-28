import { HookFunction, PendingTestFunction, SuiteFunction, TestFunction } from 'mocha'
import { Expect } from './Expect'
import { IExternalServiceHelper } from './ExternalServiceHelper'

export namespace Chalupacept {
	export interface BaseActor extends IExternalServiceHelper {
		expect: Expect
		say(message: string): void
	}

	export interface Actor extends BaseActor {}

	export interface BaseContext {
		describe: SuiteFunction
		it: TestFunction
		xit: PendingTestFunction
		after: HookFunction
		before: HookFunction
		beforeEach: HookFunction
		afterEach: HookFunction
		teardown: HookFunction
		setup: HookFunction
		I: Actor
	}

	export interface TestContext extends BaseContext {}
}
