import path from 'path'
import fs from 'fs'
import { Errors } from '../Errors'
import { IIntegrationTestingConfig } from '../config/IIntegrationTestingConfig'
import { CHALUPACEPT_CONFIG_NAME } from '../constants'

// eslint-disable-next-line @typescript-eslint/require-await
export async function ensureConfiguration(pathName: string) {
	const configFile = path.resolve(pathName, CHALUPACEPT_CONFIG_NAME)
	if (!fs.existsSync(configFile)) {
		throw new Errors.ChalupaceptConfigNotFoundError()
	}
}

export async function readConfig(pathName: string): Promise<IIntegrationTestingConfig> {
	const configFile = path.resolve(pathName, CHALUPACEPT_CONFIG_NAME)
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const importedConfig: Record<string, IIntegrationTestingConfig> = await import(configFile)
	return importedConfig.default
}
