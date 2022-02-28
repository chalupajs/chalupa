import { writeFile, unlink } from 'fs/promises'
import { TypeDefinitionResult } from './TypeMapper'
import path from 'path'

export class TypeDefinitionPersister {
	private _cwd: string
	private _definitionFilePath: string

	constructor(cwd: string) {
		this._cwd = cwd
		this._definitionFilePath = path.join(this._cwd, 'chalupacept.d.ts')
	}

	async clean() {
		try {
			await unlink(this._definitionFilePath)
		} catch (error: unknown) {}
	}

	async write(definition: TypeDefinitionResult) {
		await writeFile(this._definitionFilePath, definition, {encoding: 'utf8'})
	}

}
