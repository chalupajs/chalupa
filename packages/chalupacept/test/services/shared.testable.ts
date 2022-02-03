import { IntegrationTestArrangement } from './../../../test-framework/src/Service/IntegrationTestArrangement';
import { defineShared } from "../../src/config/defineShared";

export default defineShared({
	config(arrangement: IntegrationTestArrangement) {
		arrangement.isBound('asd')
	},
	plugins() {
		return []
	}
})
