import { Constructor, IExternalService, IPlugin } from '@chalupajs/interface'
import { IntegrationTestArrangement } from '@chalupajs/test-framework'

export interface IServiceConfig {
	config: (arrangement: IntegrationTestArrangement) => void
	plugins: () => IPlugin[]
}

export interface ITestableServiceConfig extends IServiceConfig {
	service: Constructor
	externalService: Constructor<IExternalService>
}
