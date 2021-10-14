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
			},
			{
				type: 'select',
				name: 'logProvider',
				message: 'Pick a log provider',
				choices: ['ConsoleLogger', 'Pino', 'TSLog'],
				default: 'ConsoleLogger'
			},
			{
				type: 'multiselect',
				name: 'communicationChannels',
				message: 'Pick your communication channels',
				choices: [
					{ name: 'Nats', value: 'darcon' },
					{ name: 'IPC', value: 'ipc' },
					{ name: 'In Memory', value: 'inMemory' }
				]
			}
		])
	}
}
