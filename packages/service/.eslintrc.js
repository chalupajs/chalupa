module.exports = {
	extends: '@dwmt',
	rules: {
		'no-void': ['error', { allowAsStatement: true }],
		'import/no-unassigned-import': [0],
		'unicorn/no-this-assignment': [0],
		'unicorn/no-array-reduce': [0],
	},
}
