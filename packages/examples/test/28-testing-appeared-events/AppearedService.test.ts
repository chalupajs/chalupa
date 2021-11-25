/*
 * 28. Testing Appeared Events
 *
 *
 * Topic: Testing
 */
import {IntegrationTestBuilderStrategy} from '@chalupajs/test-framework'
import { AppearedService } from './AppearedService'
import {Chalupa} from "@chalupajs/service";

const tests = [
	{
		name: 'It should log if a service appears/disappears.',
		async execute() {
			// Given
			const arrangement = await Chalupa
				.builder()
				.createServiceWithStrategy(AppearedService, IntegrationTestBuilderStrategy)

			const sut = await arrangement
				.start()

			// When
			await sut.serviceAppeared("OtherService")
			await sut.serviceDisappeared("OtherService")

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
