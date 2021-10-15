/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
	reporters: ['default', 'jest-junit'],
	projects: [
		'<rootDir>/packages/interface/jest.config.js'
	],
}
