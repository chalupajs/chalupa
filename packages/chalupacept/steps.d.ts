type ExternalServiceHelper = import('./src/test-runner/ExternalServiceHelper')

declare namespace CodeceptJS {
	interface Methods extends ExternalServiceHelper {}
	interface I extends WithTranslation<Methods> {}
	interface SupportObject {
		I: I
	}
	namespace Translation {
		interface Actions {}
	}
}
