import { IntegrationTestArrangement } from '@chalupajs/test-framework'
import { defineShared } from '../../src/index'

export default defineShared({
	config(arrangement: IntegrationTestArrangement) {
		arrangement.isBound('asd')
	},
	plugins() {
		return []
	},
})
