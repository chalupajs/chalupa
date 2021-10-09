/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',

	moduleFileExtensions: ['js', 'ts', 'jsx', 'tsx', 'json'],

	testRegex: '/test/.*\\.test\\.(ts|tsx)$',

	reporters: ['default', 'jest-junit'],
}
