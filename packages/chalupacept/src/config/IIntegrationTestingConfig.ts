import { Constructor, ICommunicationFacade } from '@chalupajs/interface'

export interface IIntegrationTestingConfig {
	communication: Constructor<ICommunicationFacade>
	testsFolder?: string
	outputFolder?: string
	servicesFolder?: string
	helpersFolder?: string
	pagesFolder?: string
}
