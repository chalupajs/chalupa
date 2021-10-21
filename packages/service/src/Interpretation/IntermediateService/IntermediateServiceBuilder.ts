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
} from '@catamaranjs/interface'

import { ConsoleLoggerProvider } from '../../Log/Console/ConsoleLoggerProvider'
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
	plugins: IPlugin[]
): Promise<IIntermediateService> {
	guardServiceDecorator(constructor)

	const serviceOptions = extractServiceOptions(constructor)

	// Create the container for the future
	const inversifyContainer = new InversifyContainer({
		defaultScope: 'Singleton',
	})
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

	// Bind the service to the container
	container.bindClass<T>(constructor)

	container.bindClass<LogConfig>(LogConfig)

	// Default logProvider
	container.bindInterface<ILogProvider>(ContainerConstant.LOG_PROVIDER_INTERFACE, ConsoleLoggerProvider)

	/// Plugin event: preCreation
	await Promise.all(plugins.map(plugin => plugin.preCreation(container)))

	const moduleDependencyGraph = new DependencyGraph<Constructor>()

	const handleErrorHandlers = function (scope: Constructor) {
		const errorHandlers: Map<string, Constructor<Error>[]> | null = Reflect.getMetadata(
			Metadata.METADATA_ERROR_HANDLER_MAP,
			scope.prototype
		) as Map<string, Constructor<Error>[]> | null

		if (!errorHandlers) {
			return
		}

		const serviceMethods: Map<string, string> | null = Reflect.getMetadata(
			Metadata.METADATA_SERVICE_MAP,
			scope.prototype
		) as Map<string, string> | null
		serviceMethods?.forEach(internalName => wrapWithErrorHandling(scope, internalName, errorHandlers))

		const serviceEvents: Map<string, string> | null = Reflect.getMetadata(
			Metadata.METADATA_EVENT_MAP,
			scope.prototype
		) as Map<string, string> | null
		serviceEvents?.forEach(internalName => wrapWithErrorHandling(scope, internalName, errorHandlers))
	}

	const wrapWithErrorHandling = function (
		scope: Constructor,
		internalName: string,
		errorHandlers: Map<string, Constructor<Error>[]>
	) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
		const originalFunction = scope.prototype[internalName]

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		scope.prototype[internalName] = async function (...args: unknown[]) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
				return await originalFunction(...args)
			} catch (thrownError) {
				for (const [errorHandler, handledErrors] of errorHandlers.entries()) {
					if (handledErrors.some(handledType => thrownError instanceof handledType)) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-return,no-await-in-loop,@typescript-eslint/no-unsafe-call,no-return-await,@typescript-eslint/no-unsafe-member-access
						return await scope.prototype[errorHandler](thrownError, args)
					}
				}

				throw thrownError
			}
		}
	}

	const moduleBindingProcessor = function (current: Constructor, parent: Constructor | null) {
		if (!moduleDependencyGraph.hasNode(current.name)) {
			moduleDependencyGraph.addNode(current.name, current)
		}

		if (parent) {
			moduleDependencyGraph.addDependency(parent.name, current.name)
		}

		const moduleOptions: ModuleOptions = Reflect.getMetadata(
			Metadata.METADATA_MODULE_OPTIONS,
			current
		) as ModuleOptions

		handleInject(moduleOptions, current)

		handleModules(moduleOptions.modules, current)

		handleErrorHandlers(current)

		handleConstants(moduleOptions.constants)

		container.bindClass(current)
	}

	const handleInject = function (optionsObject: ServiceOptions | ModuleOptions, parent: Constructor | null) {
		if (optionsObject.inject) {
			if (Array.isArray(optionsObject.inject)) {
				for (const constructor of optionsObject.inject) {
					container.bindClass<T>(constructor)
				}
			} else {
				optionsObject.inject(contextFactory(parent))
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

	const handleModules = function (modules: Constructor[] | undefined, parent: Constructor | null) {
		modules?.forEach(current => moduleBindingProcessor(current, parent))
	}

	// Inject LoggerFactory
	container.bindClass<LoggerFactory>(LoggerFactory)

	handleModules(serviceOptions.modules, NO_PARENT)

	handleErrorHandlers(constructor)

	handleInject(serviceOptions, NO_PARENT)

	handleConstants(serviceOptions.constants)

	return new IntermediateService(inversifyContainer, constructor, moduleDependencyGraph, plugins)
}
