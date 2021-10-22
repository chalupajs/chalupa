namespace Metadata {
	// Service metadata
	export const SERVICE_INJECTED = 'Catamaran_Symbol_MetadataServiceInjected'
	export const SERVICE_OPTIONS = 'Catamaran_Symbol_MetadataServiceOptions'

	// Service lifecycle
	export enum ServiceLifecycle {
		PostInit = 'Catamaran_Symbol_MetadataServiceLifecyclePostInit',
		PreDestroy = 'Catamaran_Symbol_MetadataServiceLifecyclePreDestroy',
	}

	export const METADATA_SERVICE_APPEARED = 'Catamaran_Symbol_ServiceAppeared'
	export const METADATA_SERVICE_DISAPPEARED = 'Catamaran_Symbol_ServiceDisappeared'

	// Module
	export const METADATA_MODULE_INJECTED = 'Catamaran_Symbol_MetadataModuleInjected'
	export const METADATA_MODULE_OPTIONS = 'Catamaran_Symbol_MetadataModuleOptions'

	export const METADATA_MODULE_LIFECYCLE_PRE_SERVICE_INIT = 'Catamaran_Symbol_MetadataModuleLifeCyclePreServiceInit'
	export const METADATA_MODULE_LIFECYCLE_POST_SERVICE_INIT = 'Catamaran_Symbol_MetadataModuleLifeCyclePostServiceInit'
	export const METADATA_MODULE_LIFECYCLE_PRE_SERVICE_DESTROY =
		'Catamaran_Symbol_MetadataModuleLifeCyclePreServiceDestroy'
	export const METADATA_MODULE_LIFECYCLE_POST_SERVICE_DESTROY =
		'Catamaran_Symbol_MetadataModuleLifeCyclePostServiceDestroy'

	export enum ModuleLifecycle {
		PreServiceInit = 'Catamaran_Symbol_MetadataModuleLifeCyclePreServiceInit',
		PostServiceInit = 'Catamaran_Symbol_MetadataModuleLifeCyclePostServiceInit',
		PreServiceDestroy = 'Catamaran_Symbol_MetadataModuleLifeCyclePreServiceDestroy',
		PostServiceDestroy = 'Catamaran_Symbol_MetadataModuleLifeCyclePostServiceDestroy',
	}

	// Interface
	export const METADATA_SERVICE_MAP = 'Catamaran_Symbol_MetadataServiceMap'
	export const METADATA_EVENT_MAP = 'Catamaran_Symbol_MetadataEventMap'

	// ExternalService
	export const METADATA_EXTERNAL_SERVICE_INJECTED = 'Catamaran_Symbol_MetadataExternalServiceInjected'
	export const METADATA_EXTERNAL_SERVICE_OPTIONS = 'Catamaran_Symbol_MetadataExternalServiceOptions'
	export const METADATA_EXTERNAL_SERVICE = 'Catamaran_Symbol_MetadataExternalService'

	// ErrorHandler
	export const METADATA_ERROR_HANDLER_MAP = 'Catamaran_Symbol_MetadataErrorHandlerMap'

	// Terms
	export const METADATA_TERMS_INDEX = 'Catamaran_Symbol_MetadataTermsIndex'
}

export { Metadata }
