import { IBuilderStrategy, Constructor } from '@chalupajs/interface'
import 'reflect-metadata'

import path from 'path'
import fs from 'fs'

import * as Codecept from 'codeceptjs'

import { Chalupa } from '@chalupajs/service'
import {
	IntegrationTestArrangement,
	IntegrationTestBuilderStrategyFactory,
	SystemUnderTest,
} from '@chalupajs/test-framework'
import { ITestableServiceConfig } from '../config/ITestableServiceConfig'
import { defineShared } from '../config/defineShared'
import { ISharedServiceConfig } from '../config/ISharedServiceConfig'
import { IIntegrationTestingConfig } from '../config/IIntegrationTestingConfig'
import { communicationService } from './CommunicationService'

interface ImportedTestableService {
	default: ITestableServiceConfig
}

function mapPageObjects(pageObjects: Array<[string, string]>): Record<string, string> {
	return pageObjects
		.map(([pageObjectName, pageObjectPath]) => ({ [pageObjectName]: pageObjectPath }))
		.reduce(
			(previousValue: Record<string, string>, currentValue: Record<string, string>) => ({
				...previousValue,
				...currentValue,
			}),
			{}
		)
}

function mapHelpers(helpers: Array<[string, string]>): Record<string, Record<string, string>> {
	return helpers
		.map(([helperName, helperPath]) => ({ [helperName]: { require: helperPath } }))
		.reduce(
			(previousValue: Record<string, any>, currentValue: Record<string, any>) => ({
				...previousValue,
				...currentValue,
			}),
			{}
		)
}

export interface ManagedService {
	start(): Promise<void>

	stop(): Promise<void>
}

class ServiceLaunchWrapper implements ManagedService {
	private service: IntegrationTestArrangement
	private sut?: SystemUnderTest

	constructor(service: IntegrationTestArrangement) {
		this.service = service
	}

	async start() {
		this.sut = await this.service.start()
	}

	async stop() {
		await this.sut?.close()
	}
}

export class Chalupacept {
	config: IIntegrationTestingConfig
	cwd: string

	constructor(cwd: string, config: IIntegrationTestingConfig) {
		this.cwd = cwd
		this.config = config
	}

	async getChalupaFiles(
		dir: string,
		filterFunction: (f: string) => boolean,
		tupleMaker: (imported: any, filePath: string) => [string, string]
	): Promise<Array<[string, string]>> {
		const classFiles: Array<[string, string]> = []
		const directory = path.resolve(dir)
		if (fs.existsSync(directory)) {
			const filesInDirectory = fs.readdirSync(directory)
			const filteredFiles = filesInDirectory.filter(filterFunction)
			for (const file of filteredFiles) {
				const filePath = path.resolve(directory, file)
				const importedClass: Record<string, Function> = await import(filePath)
				classFiles.push(tupleMaker(importedClass.default, filePath))
			}
		}

		return classFiles
	}

	async getHelpers(): Promise<Array<[string, string]>> {
		const helpers = await this.getChalupaFiles(
			this.config?.helpersFolder ?? path.join(this.cwd, 'helpers'),
			f => f.endsWith('.helper.ts'),
			(imported: any, filePath: string) => [imported.name, filePath]
		)

		helpers.push(['ExternalServiceHelper', path.resolve(__dirname, 'ExternalServiceHelper.ts')])

		return helpers
	}

	async getPageObjects(): Promise<Array<[string, string]>> {
		return this.getChalupaFiles(
			this.config?.pagesFolder ?? path.join(this.cwd, 'pages'),
			f => f.endsWith('.page.ts'),
			(imported: any, filePath: string) => [imported.constructor.name, filePath]
		)
	}

	async getSharedConfig(): Promise<ISharedServiceConfig> {
		const servicesFolderPath = path.resolve(this.cwd, this.config?.servicesFolder ?? 'services')
		const sharedTestableFilePath = path.join(servicesFolderPath, 'shared.testable.ts')
		if (fs.existsSync(sharedTestableFilePath)) {
			const sharedTestableImport = await import(sharedTestableFilePath)
			return sharedTestableImport.default
		}

		return defineShared({
			plugins: () => [],
			config: () => {},
		})
	}

	async getTestableServices(): Promise<ITestableServiceConfig[]> {
		const servicesFolderPath = path.resolve(this.cwd, this.config?.servicesFolder ?? 'services')
		const services: ITestableServiceConfig[] = []
		if (fs.existsSync(servicesFolderPath)) {
			const testableServiceFiles = fs
				.readdirSync(servicesFolderPath)
				.filter(f => f !== 'shared.testable.ts' && f.endsWith('.testable.ts'))
			for (const testableServiceFile of testableServiceFiles) {
				const testableService: ImportedTestableService = await import(
					path.join(servicesFolderPath, testableServiceFile)
				)
				services.push(testableService.default)
			}
		}

		return services
	}

	async configureServicesFromTestables(
		testables: ITestableServiceConfig[],
		sharedConfig: ISharedServiceConfig
	): Promise<Array<ManagedService>> {
		const services: Array<ServiceLaunchWrapper> = []
		const strategyFactory = new IntegrationTestBuilderStrategyFactory(this.config.communication)
		const strategy: Constructor<IBuilderStrategy<IntegrationTestArrangement>> = strategyFactory.create()

		for (const testable of testables) {
			communicationService.addExternalService(testable.externalService)
			const builder = Chalupa.builder()
			builder.use(sharedConfig.plugins())
			builder.use(testable.plugins())

			// eslint-disable-next-line no-await-in-loop
			const service = await builder.createServiceWithStrategy(testable.service, strategy)

			sharedConfig.config(service)
			testable.config(service)

			services.push(new ServiceLaunchWrapper(service))
		}

		return services
	}

	async run() {
		communicationService.setFacade(this.config.communication)

		const helpers = await this.getHelpers()
		const pageObjects = await this.getPageObjects()

		const testsFolderPath = path.resolve(this.cwd, this.config?.testsFolder ?? 'tests')
		const outputFolderPath = path.resolve(this.cwd, this.config?.outputFolder ?? 'output')

		// @ts-ignore
		const sharedConfig = await this.getSharedConfig()

		communicationService.setSharedConfig(sharedConfig)

		const testables = await this.getTestableServices()

		const services = await this.configureServicesFromTestables(testables, sharedConfig)

		const codeceptJSConfig: Record<string, any> = {
			tests: path.join(testsFolderPath, '**', '*.test.ts'),
			output: outputFolderPath,
			include: mapPageObjects(pageObjects),
			helpers: mapHelpers(helpers),
			async bootstrap() {
				await Promise.all([communicationService.start()].concat(services.map(s => s.start())))
			},
			async teardown() {
				await Promise.all([communicationService.stop()].concat(services.map(s => s.stop())))
			},
		}

		const config = Codecept.config.create(codeceptJSConfig)
		const options = {}
		const codecept = new Codecept.Codecept(config, options)

		try {
			// @ts-ignore
			codecept.init(path.join(__dirname, '..'))
			await codecept.bootstrap()
			codecept.loadTests()
			await codecept.run()
		} catch (error) {
			console.log(error)
		} finally {
			await codecept.teardown()
		}
	}
}
