import { Command } from 'commander'
import PrettyError from 'pretty-error'

import chalk from 'chalk' // Don't update to 5.0.0! https://github.com/chalk/chalk/issues/527
import { runCommand } from './commands/run'
import { typesCommand } from './commands/types'
import { Errors } from './Errors'

const pe = new PrettyError()

function errorWrite(string_: string) {
	const preText = chalk.bgRed.bold('Error:')
	return `${preText} ${string_}`
}

function logCLIError(error: any) {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	console.log(errorWrite(error.message || error))
}

export async function start() {
	const program = new Command()
	program.version('1.5.0', '-v, --version', 'output the current version')

	program.addCommand(runCommand)
	program.addCommand(typesCommand)

	try {
		await program.parseAsync(process.argv)
	} catch (error: any) {
		if (error instanceof Errors.CLIError) {
			logCLIError(error)
		} else {
			console.log(pe.render(error))
		}
	}
}

if (require.main === module) {
	// eslint-disable-next-line promise/prefer-await-to-then
	start().catch(console.error)
}
