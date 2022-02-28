import { IntegrationTestArrangement } from '@chalupajs/test-framework'
import { defineTestable } from '../../src/index'
import { Pizza, PizzaExternalService } from './chalupaServices/Pizza.service'

export default defineTestable({
	service: Pizza,
	externalService: PizzaExternalService,
	plugins: () => [],
	config(_arrangement: IntegrationTestArrangement) {
		_arrangement.bindConstant('asd', 'kek')
	},
})
