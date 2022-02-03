import { InMemoryFacade } from '@chalupajs/service'
import { defineConfig } from '../src/config/defineConfig'

export default defineConfig({
	communication: InMemoryFacade
})
