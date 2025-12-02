import 'reflect-metadata'

import { runMain, defineCommand } from 'citty'
import { join } from 'path'
import { readdir } from 'fs/promises'

import { select } from '@inquirer/prompts';

import { spawn } from 'child_process';

const __dirname = new URL('.', import.meta.url).pathname;
const __filename = import.meta.filename.split('/').pop();

const main = defineCommand({
  meta: {
    name: "try",
    version: "1.0.0",
    description: "Try Chalupa examples",
  },
  args: {
    exampleNumber: {
      type: "positional",
      description: "Example number",
      required: false,
    },
  },
  async run({ args }) {
  const files = await readdir(join(__dirname));
	  const examples = files.filter(file => file !== __filename);
	const exampleMap = new Map(examples.map(file => [parseInt(file.split('-')[0]), file]));
	const exampleNumbers = examples.map(file => parseInt(file.split('-')[0]));
  const exampleNumber = args.exampleNumber ? parseInt(args.exampleNumber) : await select({
      message: 'Select an example',
      choices: examples.map(file => ({
        name: file,
        value: parseInt(file.split('-')[0]),
      })),
    });


	if (!exampleNumbers.includes(exampleNumber)) {
		console.error(`Example ${exampleNumber} does not exist`);
		process.exit(1);
	}

	  const folderName = exampleMap.get(exampleNumber);

	console.log(`Running example ${folderName}`);

	const examplePath = join(__dirname, folderName, 'index.ts');

	const childProcess = spawn(`ts-node`, [examplePath], {
		stdio: 'inherit',
	});

	childProcess.on('exit', (code) => {
		process.exit(code);
	});

  },
});

runMain(main);
