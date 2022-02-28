// eslint-disable-next-line unicorn/import-style
import * as path from 'path'
import { Command } from 'commander'
import { ensureConfiguration, readConfig } from '../index'
import { TypeDefinitionResult, TypeMapper } from '../typeMapper/TypeMapper'
import { TypeDefinitionPersister } from '../typeMapper/TypeDefinitionPersister'

export const typesCommand = new Command('types')
typesCommand.description('generate a chalupacept.d.ts file')
typesCommand.action(types)
typesCommand.addArgument(typesCommand.createArgument('path', 'Chalupacept will run in the given path'))

async function types(_path: string) {
	const dir = path.join(process.cwd(), _path)
	const configPath = path.resolve(dir)
	await ensureConfiguration(configPath)
	const chalupaceptConfiguration = await readConfig(configPath)

	const typeMapper = new TypeMapper(dir, chalupaceptConfiguration)
	const definitionResult: TypeDefinitionResult = await typeMapper.generate()

	const typeDefinitionPersister = new TypeDefinitionPersister(dir)
	await typeDefinitionPersister.clean()
	await typeDefinitionPersister.write(definitionResult)

}
