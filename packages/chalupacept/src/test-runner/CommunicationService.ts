import {
	IntegrationTestArrangement,
	IntegrationTestBuilderStrategyFactory,
	SystemUnderTest,
} from '@chalupajs/test-framework'
import { Constructor, IBuilderStrategy, ICommunicationFacade, IExternalService, Service } from '@chalupajs/interface'
import { Chalupa } from '@chalupajs/service'
import { ISharedServiceConfig } from '../config/ISharedServiceConfig'
import { ManagedService } from './TestRunner'

class ChalupaceptService {}

class CommunicationService implements ManagedService {
	private service?: IntegrationTestArrangement
	private sut?: SystemUnderTest
	private facade?: Constructor<ICommunicationFacade>
	private externalServices: Constructor<IExternalService>[] = []
	private sharedConfig?: ISharedServiceConfig

	setFacade(facade: Constructor<ICommunicationFacade>) {
		this.facade = facade
	}

	setSharedConfig(sharedConfig: ISharedServiceConfig): void {
		this.sharedConfig = sharedConfig
	}

	addExternalService<T extends IExternalService>(constructor: Constructor<T>): void {
		this.externalServices.push(constructor)
	}

	async getExternalService<T extends IExternalService>(consturctor: Constructor<T>): Promise<T> {
		// eslint-disable-next-line @typescript-eslint/await-thenable
		const possibleModule = await this.sut?.getServiceOrModule(consturctor)
		if (!possibleModule) {
			throw new Error('External service not found!')
		}

		return possibleModule
	}

	async start() {
		if (!this.facade) {
			throw new Error('Communication facade is missing from CommunicationService')
		}

		const strategyFactory = new IntegrationTestBuilderStrategyFactory(this.facade)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
		const strategy: Constructor<IBuilderStrategy<IntegrationTestArrangement>> = strategyFactory.create()

		const builder = Chalupa.builder()

		builder.use(this.sharedConfig?.plugins() ?? [])

		this.service = await builder.createServiceWithStrategy(
			Service({
				inject: this.externalServices,
			})(ChalupaceptService),
			strategy
		)

		this.sharedConfig?.config(this.service)

		this.sut = await this.service.start()
	}

	async stop() {
		await this.sut?.close()
	}
}

export const communicationService = new CommunicationService()
