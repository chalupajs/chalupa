import * as konvenient from 'konvenient'

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
	Metadata, reconfigureToEnvPrefix
} from '@catamaranjs/interface'



import { ContextContainer } from '../../Container/ContextContainer'
import { ConsoleLoggerProvider } from "../../Log/console-logger/ConsoleLoggerProvider";
import { extractServiceOptions } from "../annotation_utils";
import { IntermediateService } from "./IntermediateService";
import { IConfigurator } from "../../Configurator/IConfigurator";


export function buildIntermediateService<T = any>(
	constructor: Constructor<T>,
	configurators: IConfigurator[]
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

	// Default logProvider
	container.bind<ILogProvider>(ContainerConstant.LOG_PROVIDER_INTERFACE).to(ConsoleLoggerProvider)

	configurators.forEach((configurator: IConfigurator) => configurator.configure(container))


	const hasConfigSources: boolean = container.isBound(ContainerConstant.CONFIG_SOURCES)
	console.log('Has config source?', hasConfigSources)
	if (hasConfigSources) {
		const configSources = container.get<string[]>(ContainerConstant.CONFIG_SOURCES)
		console.log(configSources)
		konvenient.configurator.withSources(configSources)
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

	const handleInject = function (optionsObject: ServiceOptions | ModuleOptions) {
		if (optionsObject.inject) {
			if (Array.isArray(optionsObject.inject)) {
				for (const injectable of optionsObject.inject) container.bind(injectable).toSelf()
			} else {
				optionsObject.inject(
					new ContextContainer(container),
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

	// Bind Modules
	if (serviceOptions.modules) {
		serviceOptions.modules.forEach((module: Constructor) => {
			const moduleOptions: ModuleOptions = Reflect.getMetadata(Metadata.METADATA_MODULE_OPTIONS, module)
			if (moduleOptions.config) {
				container.bind(moduleOptions.config).to(reconfigureToEnvPrefix(serviceOptions.envPrefix, moduleOptions.config))
			}

			handleExternalServices(moduleOptions.externalServices)

			handleInject(moduleOptions)

			handleConstants(moduleOptions.constants)

			container.bind(module).toSelf()
		})
	}

	handleInject(serviceOptions)

	handleConstants(serviceOptions.constants)

	return new IntermediateService(container, constructor)
}
