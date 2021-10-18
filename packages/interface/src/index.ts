import 'reflect-metadata'
// Types
export { Constructor } from './types'

export { Container as InversifyContainer, METADATA_KEY as InversifyMetadata } from 'inversify'

export { ContainerConstant } from './constants'

export { Service, ServiceOptions, PreDestroy, PostInit } from './Service/decorators'
// ----------- Module decoration -----------//
export {
	Module,
	ModuleOptions,
	PreServiceInit,
	PostServiceInit,
	PreServiceDestroy,
	PostServiceDestroy,
} from './Module/decorators'
// ----------- Network events -----------//
export { NetworkEvent, NetworkEventOptions } from './NetworkEvent/decorators'
// ----------- Public interfacing -----------//
export { ServiceMethod, ServiceMethodOptions, ServiceEvent, ServiceEventOptions } from './Interface/decorators'

export { Metadata } from './metadata/Metadata'

// ----------- Container -----------//
export { Inject, Injectable, MultiInject } from './Container/decorators'
export { IContextContainer } from './Container/IContextContainer'
// ----------- External service -----------//
export {
	ExternalServiceTemplate,
	serviceMethodPlaceholder,
	ExternalServiceCall,
	IExternalServiceCall,
	CallWithResult,
	IExternalServiceEmit,
	EmitWithResult,
	serviceEventPlaceholder,
} from './ExternalService/ExternalServiceTemplate'
export {
	ExternalService,
	ExternalServiceOptions,
	ExternalServiceMethod,
	ExternalServiceMethodOptions,
	ExternalServiceEvent,
	ExternalServiceEventOptions,
} from './ExternalService/decorators'
export { ICommunicationChannel } from './ExternalService/ICommunicationChannel'
// ----------- Configuration -----------//
export {
	Configuration,
	ConfigurationOptions,
	Configurable,
	ConfigurableSchema,
	PredefinedFormat,
	SchemaResult,
	Nested,
	configurator,
	CONFIGURATION_CLASS,
} from './Configuration/konvenient'

export { IIntermediateService } from './Interpretation/IIntermediateService'
export { IBuilderStrategy } from './Interpretation/IBuilderStrategy'
export { IServiceBridge } from './Interpretation/IServiceBridge'

export { AbstractLoggerAdapter, ILoggerCompatibleInstance } from './Log/AbstractLoggerAdapter'
export { LoggerFactory } from './Log/LoggerFactory'
export { ILogProvider } from './Log/ILogProvider'
export { LogFunction } from './Log/LogFunction'
export { ILogger } from './Log/ILogger'
export { LogConfig } from './Log/Configuration'

export { Errors } from './error'

export { reconfigureToEnvPrefix, ensureInjectable, isConfiguration } from './annotation_utils'

export { DependencyGraph, IDependencyGraph, DepGraphCycleError } from './DependencyGraph'

export { ErrorHandler } from './ErrorHandler/decorators'
