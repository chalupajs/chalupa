import { IIntegrationTestingConfig } from '@chalupajs/chalupacept'
import * as dom from 'dts-dom'
import { resolveClassFiles } from '../util/ClassFileResolver'
import path from 'path'

export type TypeDefinitionResult = string

export class TypeMapper {
	private _config: IIntegrationTestingConfig
	private _cwd: string

	constructor(cwd: string, config: IIntegrationTestingConfig) {
		this._config = config
		this._cwd = cwd
	}

	async generate(): Promise<TypeDefinitionResult> {

		const helpersDir = this._config.helpersFolder ?? path.join(this._cwd, 'helpers')
		const pagesDir = this._config.pagesFolder ?? path.join(this._cwd, 'pages')

		const helpers = await resolveClassFiles(helpersDir, (f: string) => f.endsWith('.helper.ts'))
		const pages = await resolveClassFiles(pagesDir, (f: string) => f.endsWith('.page.ts'))

		const ns = dom.create.namespace('Chalupacept')
		const actorInterface = dom.create.interface('Actor')
		actorInterface.baseTypes = [{name: 'BaseActor', kind: 'interface', members: []}]

		const testContext = dom.create.interface('TestContext')
		testContext.baseTypes = [{name: 'BaseContext', kind: 'interface', members: []}]

		ns.members.push(actorInterface)
		ns.members.push(testContext)

		const emits = ['/// <reference path="@chalupajs/chalupacept" />\r\n']

		function createTypeImport(name: string, from: string) {
			return `type ${name} = typeof import('${from.replace('.ts', '')}')\r\n`
		}


		for(const helper of helpers) {
			emits.push(createTypeImport(helper[1], `./helpers/${helper[0]}`))
		}

		for(const page of pages) {
			emits.push(createTypeImport(page[1], `./pages/${page[0]}`))
		}

		emits.push(dom.emit(ns))

		return Promise.resolve(emits.join(''))
	}
}
