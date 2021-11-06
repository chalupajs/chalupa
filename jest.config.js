/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
	reporters: ['default', 'jest-junit'],
	projects: [
		'<rootDir>/packages/communication/darcon/jest.config.js',
		'<rootDir>/packages/database/mongo/jest.config.js',
		'<rootDir>/packages/interface/jest.config.js',
		'<rootDir>/packages/logger/pinolog/jest.config.js',
		'<rootDir>/packages/logger/tslog/jest.config.js',
		'<rootDir>/packages/service/jest.config.js',
		'<rootDir>/packages/test-framework/jest.config.js'
	],
}
