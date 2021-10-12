import * as konvenient from 'konvenient'

import {
	ServiceOptions,
	InversifyContainer,
	InversifyMetadata,
	ContainerConstant,
	Constructor,
	Injectable,
	ExternalServiceOptions,
	ModuleOptions,
	IIntermediateService,
	LogConfig,
	ILogProvider,
	LoggerFactory,
	Errors,
	Metadata, reconfigureToEnvPrefix
} from '@catamaranjs/interface'



import { ContextContainer, NO_PARENT } from '../../Container/ContextContainer'
import { ConsoleLoggerProvider } from "../../Log/console-logger/ConsoleLoggerProvider";
import { extractServiceOptions } from "../annotation_utils";
import { IntermediateService } from "./IntermediateService";
import { DependencyGraph } from "../../DependencyGraph";


export function buildIntermediateService<T = any>(
	constructor: Constructor<T>,
	logProvider?: Constructor<ILogProvider>
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
	container
		.bind<string>(ContainerConstant.SERVICE_DIRECTORY)
		.toConstantValue(serviceOptions.serviceDirectory)
	// Bind the service to the container
	container.bind<T>(constructor).toSelf()

	container.bind<LogConfig>(LogConfig).to(reconfigureToEnvPrefix(serviceOptions.envPrefix, LogConfig))

	// Bind config to container
	if (serviceOptions.config) {
		container.bind<any>(serviceOptions.config).to(reconfigureToEnvPrefix(serviceOptions.envPrefix, serviceOptions.config))
	}

	if (serviceOptions.configSources) {
		konvenient.configurator.withSources(serviceOptions.configSources)
	}

	if(logProvider) {
		// Bind logProvider
		const isLogProviderDecorated = Reflect.hasOwnMetadata(
			InversifyMetadata.PARAM_TYPES,
			logProvider
		)
		const injectableLogProvider = (
			isLogProviderDecorated ? logProvider : Injectable()(logProvider)
		) as Constructor<ILogProvider>
		container.bind<ILogProvider>(ContainerConstant.LOG_PROVIDER_INTERFACE).to(injectableLogProvider)
	} else {
		container.bind<ILogProvider>(ContainerConstant.LOG_PROVIDER_INTERFACE).to(ConsoleLoggerProvider)
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

	const moduleDependencyGraph = new DependencyGraph<Constructor>();

	const moduleBindingProcessor = function (current: Constructor, parent: Constructor | null) {
		if (!moduleDependencyGraph.hasNode(current.name)) {
			moduleDependencyGraph.addNode(current.name, current)
		}

		if (parent) {
			moduleDependencyGraph.addDependency(parent.name, current.name)
		}

		const moduleOptions: ModuleOptions = Reflect.getMetadata(Metadata.METADATA_MODULE_OPTIONS, module)
		if (moduleOptions.config) {
			container.bind(moduleOptions.config).to(reconfigureToEnvPrefix(serviceOptions.envPrefix, moduleOptions.config))
		}

		handleExternalServices(moduleOptions.externalServices)

		handleInject(moduleOptions, parent)

		handleConstants(moduleOptions.constants)

		container.bind(current).toSelf()
	}

	const handleInject = function (optionsObject: ServiceOptions | ModuleOptions, parent: Constructor | null) {
		if (optionsObject.inject) {
			if (Array.isArray(optionsObject.inject)) {
				for (const injectable of optionsObject.inject) container.bind(injectable).toSelf()
			} else {
				optionsObject.inject(
					new ContextContainer(
						container,
						moduleBindingProcessor,
						parent
					),
					optionsObject.config ? container.get<any>(optionsObject.config) : undefined
				)
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

	// Inject LoggerFactory
	container.bind<LoggerFactory>(LoggerFactory).toSelf()

	handleExternalServices(serviceOptions.externalServices)

	handleInject(serviceOptions, NO_PARENT)

	handleConstants(serviceOptions.constants)

	return new IntermediateService(container, constructor, moduleDependencyGraph)
}
