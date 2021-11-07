/*
 * 26. My First Test
 *
 *
 * Topic: Testing
 */
import * as assert from 'assert'
import {IntegrationTestBuilderStrategy} from '@chalupajs/test-framework'
import { CallWithResult } from '@chalupajs/interface'
import { DateTimeService, GreetingService } from './GreetingService'
import {Chalupa} from "@chalupajs/service";

const tests = [
	{
		name: 'It should return "Good morning, Jocky!" before noon.',
		async execute() {
			// Given
			const HOUR = 9
			const WHO = 'Jocky'
			const expected = 'Good morning, Jocky!'

			const arrangement = await Chalupa
				.builder()
				.createServiceWithStrategy(GreetingService, IntegrationTestBuilderStrategy)

			const sut = await arrangement
				.rebindConstant(DateTimeService, {
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

		await test.execute()
	}
})()
