import {
	ServiceOptions,
	InversifyContainer,
	ContainerConstant,
	Constructor,
	ExternalServiceOptions,
	ModuleOptions,
	IIntermediateService,
	LogConfig,
	ILogProvider,
	LoggerFactory,
	Errors,
	Metadata,
	reconfigureToEnvPrefix,
	configurator,
	DependencyGraph,
	IContextContainer,
} from '@catamaranjs/interface'

import { ensureInjectable } from '@catamaranjs/interface/src/annotation_utils'
import { ContextContainer, NO_PARENT } from '../../Container/ContextContainer'
import { ConsoleLoggerProvider } from '../../Log/Console/ConsoleLoggerProvider'
import { extractServiceOptions } from '../annotation_utils'
import { IPlugin } from '../../Plugin/IPlugin'
import { IntermediateService } from './IntermediateService'

export function buildIntermediateService<T = any>(
	constructor: Constructor<T>,
	plugins: IPlugin[]
): IIntermediateService {
	if (!Reflect.hasOwnMetadata(Metadata.SERVICE_OPTIONS, constructor)) {
		throw new Errors.MissingServiceDecoratorError(constructor.name)
	}

	const serviceOptions = extractServiceOptions(constructor)

	// Create the container for the future
	const container = new InversifyContainer({
		defaultScope: 'Singleton',
	})

	// Bind the rootClass name to the container
	container.bind<string>(ContainerConstant.ROOT_CLASS).toConstantValue(constructor.name)
	// Bind the service name to the container
	container.bind<string>(ContainerConstant.SERVICE_NAME).toConstantValue(serviceOptions.name)
	// Bind the service directory to the container
	container.bind<string>(ContainerConstant.SERVICE_DIRECTORY).toConstantValue(serviceOptions.serviceDirectory)

	// Bind the service to the container
	container.bind<T>(constructor).toSelf()

	container.bind<LogConfig>(LogConfig).to(reconfigureToEnvPrefix(serviceOptions.envPrefix, LogConfig))

	// Bind config to container
	if (serviceOptions.config) {
		container
			.bind<any>(serviceOptions.config)
			.to(reconfigureToEnvPrefix(serviceOptions.envPrefix, ensureInjectable(serviceOptions.config)))
	}

	// Default logProvider
	container.bind<ILogProvider>(ContainerConstant.LOG_PROVIDER_INTERFACE).to(ConsoleLoggerProvider)

	plugins.forEach((plugin: IPlugin) => plugin.configure(container))

	const hasConfigSources: boolean = container.isBound(ContainerConstant.CONFIG_SOURCES)
	if (hasConfigSources) {
		const configSources = container.get<string[]>(ContainerConstant.CONFIG_SOURCES)
		configurator.withSources(configSources)
	}

	const handleExternalServices = function (externalServices?: Constructor[]) {
		externalServices?.forEach(externalService => {
			container.bind(externalService).toSelf()
			const externalServiceOptions = Reflect.getMetadata(
				Metadata.METADATA_EXTERNAL_SERVICE_OPTIONS,
				externalService
			) as Required<ExternalServiceOptions>
			if (!serviceOptions.dependsOn) {
				serviceOptions.dependsOn = []
			}

			serviceOptions.dependsOn.push(externalServiceOptions.name)
		})
	}

	const moduleDependencyGraph = new DependencyGraph<Constructor>()

	const handleErrorHandlers = function (scope: Constructor) {
		const errorHandlers: Map<string, Constructor<Error>[]> | null = Reflect.getMetadata(
			Metadata.METADATA_ERROR_HANDLER_MAP,
			scope.prototype
		)

		if (!errorHandlers) {
			return
		}

		const serviceMethods: Map<string, string> | null = Reflect.getMetadata(
			Metadata.METADATA_SERVICE_MAP,
			scope.prototype
		)
		serviceMethods?.forEach(internalName => wrapWithErrorHandling(scope, internalName, errorHandlers))

		const serviceEvents: Map<string, string> | null = Reflect.getMetadata(
			Metadata.METADATA_EVENT_MAP,
			scope.prototype
		)
		serviceEvents?.forEach(internalName => wrapWithErrorHandling(scope, internalName, errorHandlers))
	}

	const wrapWithErrorHandling = function (
		scope: Constructor,
		internalName: string,
		errorHandlers: Map<string, Constructor<Error>[]>
	) {
		const originalFunction = scope.prototype[internalName]

		scope.prototype[internalName] = async function (...args: unknown[]) {
			try {
				return await originalFunction(...args)
			} catch (thrownError) {
				for (const [errorHandler, handledErrors] of errorHandlers.entries()) {
					if (handledErrors.find(handledType => thrownError instanceof handledType)) {
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

		const moduleOptions: ModuleOptions = Reflect.getMetadata(Metadata.METADATA_MODULE_OPTIONS, current)
		if (moduleOptions.config) {
			container
				.bind(moduleOptions.config)
				.to(reconfigureToEnvPrefix(serviceOptions.envPrefix, ensureInjectable(moduleOptions.config)))
		}

		handleExternalServices(moduleOptions.externalServices)

		handleInject(moduleOptions, current)

		handleModules(moduleOptions.modules, current)

		handleErrorHandlers(current)

		handleConstants(moduleOptions.constants)

		container.bind(current).toSelf()
	}

	const handleInject = function (optionsObject: ServiceOptions | ModuleOptions, parent: Constructor | null) {
		if (optionsObject.inject) {
			if (Array.isArray(optionsObject.inject)) {
				for (const injectable of optionsObject.inject) {
					container.bind(injectable).toSelf()
				}
			} else {
				optionsObject.inject(contextFactory(container, parent))
			}
		}
	}

	const handleConstants = function (constants?: Array<[string, any]>) {
		constants?.forEach(([accessor, constant]) => {
			if (container.isBound(accessor)) {
				container.rebind(accessor).toConstantValue(constant)
			} else {
				container.bind(accessor).toConstantValue(constant)
			}
		})
	}

	const handleModules = function (modules: Constructor[] | undefined, parent: Constructor | null) {
		modules?.forEach(current => moduleBindingProcessor(current, parent))
	}

	const contextFactory = function (container: InversifyContainer, parent: Constructor | null): IContextContainer {
		return {
			bindClass<T>(constructor: Constructor<T>) {
				container.bind<T>(constructor).toSelf().inSingletonScope()

				return this
			},
			bindConstant<T>(accessor: string, constant: T) {
				container.bind<T>(accessor).toConstantValue(constant)

				return this
			},
			bindInterface<T>(accessor: string, constructor: Constructor<T>) {
				container.bind<T>(accessor).to(constructor).inSingletonScope()

				return this
			},
			bindModule<T>(moduleConstructor: Constructor<T>) {
				container.bind(moduleConstructor).toSelf()

				moduleBindingProcessor(moduleConstructor, parent)

				return this
			},
			immediate<T>(constructor: Constructor<T>) {
				container.bind<T>(constructor).toSelf()

				return container.get<T>(constructor)
			},
		}
	}

	// Inject LoggerFactory
	container.bind<LoggerFactory>(LoggerFactory).toSelf()

	handleModules(serviceOptions.modules, NO_PARENT)

	handleExternalServices(serviceOptions.externalServices)

	handleErrorHandlers(constructor)

	handleInject(serviceOptions, NO_PARENT)

	handleConstants(serviceOptions.constants)

	return new IntermediateService(container, constructor, moduleDependencyGraph)
}
