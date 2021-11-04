import * as assert from 'assert'
import { Catamaran } from '@catamaranjs/service'
import {ClassLevelOverrides, IntegrationTestBuilderStrategy, OverrideConfig} from '@catamaranjs/test-framework'
import { CallWithResult } from '@catamaranjs/interface'
import { DateTimeService, GreetingService } from './GreetingService'
import {DarconConfig} from "@catamaranjs/communication-darcon";

const tests = [
	{
		name: 'It should return "Good morning, Jocky!" before noon.',
		async execute() {
			// Given
			const HOUR = 9
			const WHO = 'Jocky'
			const expected = 'Good morning, Jocky!'

			const arrangement = await Catamaran
				.builder()
				.use(OverrideConfig.with([
					{
						config: DarconConfig,
						overrides: {
							division: 'a',
							connectionPatience: 'b'
						}
					} as ClassLevelOverrides<DarconConfig>
				]))
				.createServiceWithStrategy(GreetingService, IntegrationTestBuilderStrategy)

			const sut = await arrangement
				.rebind(DateTimeService, {
					hours() {
						return CallWithResult.of(HOUR)
					},
				})
				.start()


			// When
			const actual = await sut.getServiceOrModule(GreetingService).greet(WHO)

			// Then
			assert.strictEqual(actual, expected)

			await sut.close()
		},
	},
]

;(async function () {
	for (const test of tests) {
		console.log(`\nExecuting | ${test.name}\n`)
		// eslint-disable-next-line no-await-in-loop
		await test.execute()
	}
})()
