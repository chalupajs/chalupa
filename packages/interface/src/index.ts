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
export { ServiceAppeared, ServiceDisappeared } from './NetworkEvent/decorators'
// ----------- Public interfacing -----------//
export {
	ServiceMethod,
	ServiceMethodOptions,
	ServiceEvent,
	ServiceEventOptions,
	TermsObject,
} from './Interface/decorators'

export { Metadata } from './metadata/Metadata'

// ----------- Container -----------//
export { Inject, Injectable, MultiInject } from './Container/decorators'
export { IContainer } from './Container/IContainer'
export { IFacadeContainer } from './Container/IFacadeContainer'
export { IInjectContainer } from './Container/IInjectContainer'
export { IPluginContainer } from './Container/IPluginContainer'
export { IDynamicValueContext, DynamicValueProvider } from './Container/IDynamicValueContext'
// ----------- External service -----------//
export {
	IExternalService,
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
export { IServiceBridgeOrchestrator } from './Interpretation/IServiceBridgeOrchestrator'

export { AbstractLoggerAdapter, ILoggerCompatibleInstance } from './Log/AbstractLoggerAdapter'
export { LoggerFactory } from './Log/LoggerFactory'
export { ILogProvider } from './Log/ILogProvider'
export { LogFunction } from './Log/LogFunction'
export { ILogger } from './Log/ILogger'
export { LogConfig } from './Log/Configuration'

export { Errors } from './error'

export { reconfigureToEnvPrefix, ensureInjectable, isConfiguration, isExternalService } from './annotation_utils'

export { DependencyGraph, IDependencyGraph, DepGraphCycleError } from './DependencyGraph'

export { ErrorHandler } from './ErrorHandler/decorators'

export { ICommunicationFacade, MethodCallable, EventCallable } from './Communication/ICommunicationFacade'
export { AbstractCommunicationFacade } from './Communication/AbstractCommunicationFacade'
export { ServiceDisappearedCallback, ServiceAppearedCallback } from './Communication/NetworkEventCallbacks'

export { IPlugin } from './Plugin/IPlugin'
export { AbstractPlugin } from './Plugin/AbstractPlugin'
