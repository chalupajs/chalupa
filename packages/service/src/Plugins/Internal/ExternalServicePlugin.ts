import {
	AbstractPlugin,
	Constructor,
	ExternalServiceOptions,
	IPluginContainer,
	isExternalService,
	Metadata,
} from '@chalupajs/interface'
import { timeout } from '../../util'

export class ExternalServicePlugin extends AbstractPlugin {
	private dependsOn: Map<string | Constructor, string[]> = new Map<string | Constructor, string[]>()

	private depends: Set<string> = new Set<string>()

	private interrupt: boolean = false

	constructor() {
		super()
		process.on('SIGTERM', () => {
			this.interrupt = true
		})
		process.on('SIGINT', () => {
			this.interrupt = true
		})
	}

	onBindInterface<T>(accessor: string, constructor: Constructor<T>): Constructor<T> {
		if (isExternalService(constructor)) {
			const externalServiceOptions = Reflect.getMetadata(
				Metadata.METADATA_EXTERNAL_SERVICE_OPTIONS,
				constructor
			) as Required<ExternalServiceOptions>

			if (this.dependsOn.has(accessor)) {
				this.dependsOn.get(accessor)!.push(externalServiceOptions.name)
			} else {
				this.dependsOn.set(accessor, [externalServiceOptions.name])
			}
		}

		return constructor
	}

	onRebindInterface<T>(accessor: string, constructor: Constructor<T>): Constructor<T> {
		if (isExternalService(constructor)) {
			const externalServiceOptions = Reflect.getMetadata(
				Metadata.METADATA_EXTERNAL_SERVICE_OPTIONS,
				constructor
			) as Required<ExternalServiceOptions>
			this.dependsOn.set(accessor, [externalServiceOptions.name])
		}

		return constructor
	}

	onUnbind(_accessor: string | Constructor): boolean {
		this.dependsOn.delete(_accessor)
		return true
	}

	onBindClass<T>(constructor: Constructor<T>): Constructor<T> {
		if (isExternalService(constructor)) {
			const externalServiceOptions = Reflect.getMetadata(
				Metadata.METADATA_EXTERNAL_SERVICE_OPTIONS,
				constructor
			) as Required<ExternalServiceOptions>

			if (this.dependsOn.has(constructor)) {
				this.dependsOn.get(constructor)!.push(externalServiceOptions.name)
			} else {
				this.dependsOn.set(constructor, [externalServiceOptions.name])
			}
		}

		return constructor
	}

	onRebindClass<T>(constructor: Constructor<T>): Constructor<T> {
		if (isExternalService(constructor)) {
			const externalServiceOptions = Reflect.getMetadata(
				Metadata.METADATA_EXTERNAL_SERVICE_OPTIONS,
				constructor
			) as Required<ExternalServiceOptions>

			this.dependsOn.set(constructor, [externalServiceOptions.name])
		}

		return constructor
	}

	onServiceAppeared(serviceName: string): Promise<void> {
		console.log('External service plugin service appeared...')
		this.depends.delete(serviceName)
		return Promise.resolve()
	}

	async preStart(container: IPluginContainer): Promise<boolean> {
		const logger = container.getLogger('ExternalServicePlugin')
		for (const dependsArray of this.dependsOn.values()) {
			dependsArray.forEach(depends => this.depends.add(depends))
		}

		while (this.depends.size > 0) {
			if (this.interrupt) {
				return Promise.resolve(false)
			}

			logger.info(`Waiting for ${[...this.depends].join(', ')} to be present!`)
			// eslint-disable-next-line no-await-in-loop
			await timeout(2000)
		}

		return Promise.resolve(true)
	}
}
