import {AbstractPlugin, Constructor, Metadata} from "@catamaranjs/interface"

export class ErrorHandlingPlugin extends AbstractPlugin {
	onBindClass<T>(constructor: Constructor<T>): Constructor<T> {
		if (Reflect.getMetadata(Metadata.SERVICE_OPTIONS, constructor.prototype)) {
			this.wrapFunctionsInScope(constructor)
		}

		return constructor
	}

	onBindModule(moduleConstructor: Constructor): Constructor {
		this.wrapFunctionsInScope(moduleConstructor)

		return moduleConstructor
	}

	private wrapFunctionsInScope(scope: Constructor) {
		const handlers: Map<string, Constructor<Error>[]> | null = Reflect.getMetadata(Metadata.METADATA_ERROR_HANDLER_MAP, scope.prototype)
		if (!handlers) {
			return
		}

		const events: Map<string, string> = Reflect.getMetadata(Metadata.METADATA_EVENT_MAP, scope.prototype) || new Map<string, string>()
		const methods: Map<string, string> = Reflect.getMetadata(Metadata.METADATA_SERVICE_MAP, scope.prototype) || new Map<string, string>()

		for (const propertyKey in [...events, ...methods]) {
			this.wrapFunctionWithErrorHandling(scope, propertyKey, handlers)
		}
	}

	private wrapFunctionWithErrorHandling(scope: Constructor, internalName: string, errorHandlers: Map<string, Constructor<Error>[]>) {
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
}
