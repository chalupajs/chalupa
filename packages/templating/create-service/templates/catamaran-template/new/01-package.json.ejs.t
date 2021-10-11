---
to: package.json
sh: cd <%= cwd %> && git init
---
{
	"name": "<%= name %>",
	"version": "1.0.0",
	"description": "<%= description %>",
	"main": "./dist/src/<%= h.changeCase.camel(serviceName) %>.ts",
	"types": "./dist/src/<%= h.changeCase.camel(serviceName) %>.d.ts",
	"keywords": [],
	"author": "",
	"repository": {
		"type": "git",
		"url": "<%= remote %>"
	},
	"scripts": {
		"test": "jest --coverage",
		"test:watch": "jest --watch",
		"lint": "eslint",
		"lint:fix": "eslint --fix",
		"lint:staged": "lint-staged"
	},
	"dependencies": {
		"@catamaranjs/interface": "1.0.0",
		"@catamaranjs/service": "1.0.0",
	},
	"devDependencies": {
		"@types/jest": "^26.0.23",
		"ts-jest": "27.0.5",
		"jest": "27.2.5",
		"jest-junit": "12.0.0"
	}
}

