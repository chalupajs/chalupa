import { IntegrationTestArrangement } from '@chalupajs/test-framework';
import { Pizza, PizzaExternalService } from './chalupaServices/Pizza.service';
import { defineTestable } from "../../src/config/defineTestable"

export default defineTestable({
	service: Pizza,
	externalService: PizzaExternalService,
	plugins: () => [],
	config (_arrangement: IntegrationTestArrangement) {
		_arrangement.bindConstant('asd', 'kek')
	}
})
