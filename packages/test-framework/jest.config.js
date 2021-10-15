/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',

	moduleFileExtensions: ['js', 'ts', 'jsx', 'tsx', 'json'],

	testRegex: '/(test|__test__)/.*\\.test\\.(ts|tsx)$',
	collectCoverageFrom: [
		"**/*.{ts,tsx}",
		"!**/node_modules/**",
		"!**/dist/**",
		"!**/test/**",
		"!**/__test__/**"
	],

	globals: {
		'ts-jest': {
		}
	},

	reporters: ['default', 'jest-junit'],
}
