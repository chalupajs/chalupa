---
to: jest.config.js
---
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleFileExtensions: ['js', 'ts', 'jsx', 'tsx', 'json'],
	testRegex: '/(test|__test__)/.*\\.test\\.(ts|tsx)$',
	reporters: ['default', 'jest-junit']
}
