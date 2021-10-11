module.exports = {
	async prompt({ prompter }) {
		return await prompter.prompt([
			{
				type: 'input',
				name: 'name',
				message: "Name of the npm package",
			},
			{
				type: 'input',
				name: 'description',
				message: "Description of the package",
			},
			{
				type: 'input',
				name: 'serviceName',
				message: "Name of the service",
			},
			{
				type: 'input',
				name: 'remote',
				message: "Repository remote",
			}
		])
	}
}
