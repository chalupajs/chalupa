namespace Metadata {
	// Service metadata
	export const SERVICE_INJECTED = 'Catamaran_Symbol_MetadataServiceInjected'
	export const SERVICE_OPTIONS = 'Catamaran_Symbol_MetadataServiceOptions'

	// Service lifecycle
	export enum ServiceLifecycle {
		PostInit = 'Catamaran_Symbol_MetadataServiceLifecyclePostInit',
		PreDestroy = 'Catamaran_Symbol_MetadataServiceLifecyclePreDestroy'
	}

	// Network event
	export enum NetworkEvent {
		EntityAppeared = 'Catamaran_Symbol_MetadataNetworkEventEntityAppeared',
		EntityDisappeared = 'Catamaran_Symbol_MetadataNetworkEventEntityDisappeared',
		EntityUpdated = 'Catamaran_Symbol_MetadataNetworkEventEntityUpdated'
	}

	// Module
	export const METADATA_MODULE_INJECTED = 'Catamaran_Symbol_MetadataModuleInjected'
	export const METADATA_MODULE_OPTIONS = 'Catamaran_Symbol_MetadataModuleOptions'

	export const METADATA_MODULE_LIFECYCLE_PRE_SERVICE_INIT = 'Catamaran_Symbol_MetadataModuleLifeCyclePreServiceInit'
	export const METADATA_MODULE_LIFECYCLE_POST_SERVICE_INIT = 'Catamaran_Symbol_MetadataModuleLifeCyclePostServiceInit'
	export const METADATA_MODULE_LIFECYCLE_PRE_SERVICE_DESTROY = 'Catamaran_Symbol_MetadataModuleLifeCyclePreServiceDestroy'
	export const METADATA_MODULE_LIFECYCLE_POST_SERVICE_DESTROY = 'Catamaran_Symbol_MetadataModuleLifeCyclePostServiceDestroy'

	export enum ModuleLifecycle {
		PreServiceInit = 'Catamaran_Symbol_MetadataModuleLifeCyclePreServiceInit',
		PostServiceInit = 'Catamaran_Symbol_MetadataModuleLifeCyclePostServiceInit',
		PreServiceDestroy = 'Catamaran_Symbol_MetadataModuleLifeCyclePreServiceDestroy',
		PostServiceDestroy = 'Catamaran_Symbol_MetadataModuleLifeCyclePostServiceDestroy'
	}

	// Interface
	export const METADATA_SERVICE_MAP = 'Catamaran_Symbol_MetadataServiceMap'
	export const METADATA_EVENT_MAP = 'Catamaran_Symbol_MetadataEventMap'

	// ExternalService
	export const METADATA_EXTERNAL_SERVICE_INJECTED = 'Catamaran_Symbol_MetadataExternalServiceInjected'
	export const METADATA_EXTERNAL_SERVICE_OPTIONS = 'Catamaran_Symbol_MetadataExternalServiceOptions'

	// ErrorHandler
	export const METADATA_ERROR_HANDLER_MAP = 'Catamaran_Symbol_MetadataErrorHandlerMap'
}

export { Metadata }
