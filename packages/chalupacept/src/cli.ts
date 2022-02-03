import { Errors } from './Errors';
import { Command } from 'commander'
import { runCommand } from './commands/run'
import PrettyError from 'pretty-error'

import chalk from 'chalk' // Don't update to 5.0.0! https://github.com/chalk/chalk/issues/527

const pe = new PrettyError()

function errorWrite(str: string) {
	const preText = chalk.bgRed.bold('Error:')
	return `${preText} ${str}`
}

function logCLIError(error: any) {
	console.log(errorWrite(error.message || error))
}

// eslint-disable-next-line @typescript-eslint/require-await
async function start() {
	const program = new Command()
	program.version('1.5.0', '-v, --version', 'output the current version')

	program.addCommand(runCommand)

	try {
		// program.parse(process.argv)
		await program.parseAsync(process.argv)
	} catch (error: any) {
		if(error instanceof Errors.CLIError) {
			logCLIError(error)
		} else {
			console.log(pe.render(error))
		}
	}
}

start().catch(console.error)
