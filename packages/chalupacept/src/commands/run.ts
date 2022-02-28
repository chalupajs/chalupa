// eslint-disable-next-line unicorn/import-style
import * as path from 'path'
import { Command } from 'commander'
import { TestRunner, ensureConfiguration, readConfig } from '../index'

export const runCommand = new Command('run')
runCommand.description('run a Chalupacept configuration')
runCommand.action(run)
runCommand.addArgument(runCommand.createArgument('path', 'Chalupacept will run in the given path'))

async function run(_path: string) {
	const dir = path.join(process.cwd(), _path)
	const configPath = path.resolve(dir)
	await ensureConfiguration(configPath)
	const chalupaceptConfiguration = await readConfig(configPath)
	const testRunner: TestRunner = new TestRunner(dir, chalupaceptConfiguration)
	await testRunner.run()
}
