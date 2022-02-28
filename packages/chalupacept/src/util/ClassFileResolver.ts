import path from 'path'
import { readdir, stat } from 'fs/promises'

async function exists(filePath: string) {
	try {
		await stat(filePath)
		return true
	} catch (error: unknown) {
		return false
	}
}

export async function resolveClassFiles(
	dir: string,
	filterFunction: (f: string) => boolean
): Promise<Array<[string, string, Function]>> {
	const classFiles: Array<[string, string, Function]> = []
	const directory = path.resolve(dir)
	if (await exists(directory)) {
		const filesInDirectory = await readdir(directory)
		const filteredFiles = filesInDirectory.filter((element: string) => filterFunction(element))
		for (const file of filteredFiles) {
			const filePath = path.resolve(directory, file)
			// eslint-disable-next-line no-await-in-loop
			const importedClass: Record<string, Function> = (await import(filePath)) as Record<string, Function>
			classFiles.push([file, importedClass.default.name, importedClass.default])
		}
	}

return classFiles
}
