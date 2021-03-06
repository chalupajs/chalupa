import {
	ServiceOptions,
	InversifyContainer,
	ContainerConstant,
	Constructor,
	ModuleOptions,
	IIntermediateService,
	LogConfig,
	ILogProvider,
	LoggerFactory,
	Errors,
	Metadata,
	DependencyGraph,
	IPlugin,
} from '@chalupajs/interface'

import { extractServiceOptions } from '../annotation_utils'
import { Container } from '../Container'
import { IntermediateService } from './IntermediateService'

const NO_PARENT = null

function guardServiceDecorator<T>(constructor: Constructor<T>) {
	if (!Reflect.hasOwnMetadata(Metadata.SERVICE_OPTIONS, constructor)) {
		throw new Errors.MissingServiceDecoratorError(constructor.name)
	}
}

export async function buildIntermediateService<T = any>(
	constructor: Constructor<T>,
	plugins: IPlugin[],
	_logProvider: Constructor<ILogProvider>
): Promise<IIntermediateService> {
	guardServiceDecorator(constructor)

	const serviceOptions = extractServiceOptions(constructor)

	// Create the container for the future
	const inversifyContainer = new InversifyContainer({
		defaultScope: 'Singleton',
	})

	const moduleDependencyGraph = new DependencyGraph<Constructor>()

	async function moduleBindingProcessor(current: Constructor, parent: Constructor | null) {
		if (moduleDependencyGraph.hasNode(current.name)) {
			if (parent) {
				moduleDependencyGraph.addDependency(parent.name, current.name)
			}

			return
		}

		moduleDependencyGraph.addNode(current.name, current)

		if (parent) {
			moduleDependencyGraph.addDependency(parent.name, current.name)
		}

		const moduleOptions: ModuleOptions = Reflect.getMetadata(
			Metadata.METADATA_MODULE_OPTIONS,
			current
		) as ModuleOptions

		await handleInject(moduleOptions, current)

		await handleModules(moduleOptions.modules, current)

		handleConstants(moduleOptions.constants)

		container.bindClass(current)
	}

	const contextFactory = function (parent: Constructor | null): Container {
		return new Container(plugins, inversifyContainer, moduleBindingProcessor, parent)
	}

	const container = contextFactory(NO_PARENT)

	// Bind the rootClass name to the container
	container.bindConstant<string>(ContainerConstant.ROOT_CLASS, constructor.name)
	// Bind the service name to the container
	container.bindConstant<string>(ContainerConstant.SERVICE_NAME, serviceOptions.name)
	// Bind the service directory to the container
	container.bindConstant<string>(ContainerConstant.SERVICE_DIRECTORY, serviceOptions.serviceDirectory)

	container.bindClass<LogConfig>(LogConfig)
	// Default logProvider
	container.bindInterface<ILogProvider>(ContainerConstant.LOG_PROVIDER_INTERFACE, _logProvider)
	// Inject LoggerFactory
	container.bindClass<LoggerFactory>(LoggerFactory)

	/// Plugin event: preCreation
	await Promise.all(plugins.map(plugin => plugin.preCreation(container)))

	// Bind the service to the container
	container.bindClass<T>(constructor)

	const handleInject = async function (optionsObject: ServiceOptions | ModuleOptions, parent: Constructor | null) {
		if (optionsObject.inject) {
			if (Array.isArray(optionsObject.inject)) {
				for (const constructor of optionsObject.inject) {
					container.bindClass<T>(constructor)
				}
			} else {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				await optionsObject.inject(contextFactory(parent))
			}
		}
	}

	const handleConstants = function (constants?: Array<[string, any]>) {
		constants?.forEach(([accessor, constant]) => {
			if (container.isBound(accessor)) {
				container.rebindConstant(accessor, constant)
			} else {
				container.bindConstant(accessor, constant)
			}
		})
	}

	const handleModules = async function (modules: Constructor[] | undefined, parent: Constructor | null) {
		const processors = []
		for (const current of modules ?? []) {
			processors.push(moduleBindingProcessor(current, parent))
		}

		await Promise.all(processors)
	}

	await handleModules(serviceOptions.modules, NO_PARENT)

	await handleInject(serviceOptions, NO_PARENT)

	handleConstants(serviceOptions.constants)

	return new IntermediateService(inversifyContainer, container, constructor, moduleDependencyGraph, plugins)
}
