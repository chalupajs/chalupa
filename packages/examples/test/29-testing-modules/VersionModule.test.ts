/*
 * 29. Testing Modules
 *
 *
 * Topic: Testing
 */
import {IntegrationTestBuilderStrategy, ModuleHost} from '@chalupajs/test-framework'
import {Chalupa} from "@chalupajs/service";
import {Constants, VersionModule} from "./VersionModule";
import assert from "assert";

const tests = [
	{
		name: 'It should return the bound version.',
		async execute() {
			// Given
			const version = '1.0.0'
			const expected = version

			const arrangement = await Chalupa
				.builder()
				.createServiceWithStrategy(ModuleHost.fromModule(VersionModule), IntegrationTestBuilderStrategy)

			const sut = await arrangement
				.bindConstant(Constants.Version, version)
				.start()

			// When
			const actual = await sut.getServiceOrModule(VersionModule).version()

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
