#!/usr/bin/env node

import * as path from 'path'


import * as prompts from 'prompts'

import { runner } from 'hygen'
import {Logger} from 'hygen'

// import { green, bold, red } from 'chalk'
//
// function logSuccess(msg: string) {
// 	console.log(green('✔'), bold(msg))
// }
// function logFail(msg: string) {
// 	console.log(red('✖'), bold(msg))
// }

(async () => {
	const questions: prompts.PromptObject[] = [
		{
			type: 'select',
			name: 'newFolder',
			message: 'Where to put the final result?',
			choices: [
				{ title: 'In this folder', description: 'This option initiate the template in the current directory', value: 'cwd' },
				{ title: 'In a new folder', description: 'This option initiate in a new folder in the current directory', value: 'new' },
			]
		},
		{
			type: (prev: string) => prev == 'new' ? 'text' : null,
			name: 'folderName',
			message: 'What will be the name of the subfolder?'
		}
	];

	const response = await prompts(questions)

	const defaultTemplates = path.join(__dirname, '..', 'templates')

	await runner(['catamaran-template', 'new'], {
		templates: defaultTemplates,
		cwd: response.newFolder === 'cwd' ? process.cwd() : path.join(process.cwd(), response.folderName),
		logger: new Logger(console.log.bind(console)),
		createPrompter: () => require('enquirer'),
		exec: (action, body) => {
			const opts = body && body.length > 0 ? { input: body } : {}
			return require('execa').command(action, { ...opts, shell: true })
		},
		debug: !!process.env.DEBUG
	})

})();
