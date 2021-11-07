/*
 * 28. Overriding Configurations
 *
 *
 * Topic: Testing
 */
import * as assert from 'assert'
import {IntegrationTestBuilderStrategy, OverrideConfig} from '@chalupajs/test-framework'
import { OverridingConfig, OverridingConfigurationsService } from './OverridingConfigurationsService'
import {Chalupa} from "@chalupajs/service";

const tests = [
	{
		name: 'It should return the overridden data directory.',
		async execute() {
			// Given
			const dataDirectory = '/overridden/data/directory'
			const expected = dataDirectory

			const arrangement = await Chalupa
				.builder()
				.use(
					OverrideConfig.builder()
						.add(OverridingConfig, {
							dataDirectory
						})
						.build()
				)
				.createServiceWithStrategy(OverridingConfigurationsService, IntegrationTestBuilderStrategy)

			const sut = await arrangement
				.start()

			// When
			const actual = await sut.getServiceOrModule(OverridingConfigurationsService).getDataDirectory()

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
