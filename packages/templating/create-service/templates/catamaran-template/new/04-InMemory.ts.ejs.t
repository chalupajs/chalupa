---
to: src/InMemory.ts
---
import {
	Catamaran,
	InMemoryStrategy
} from '@catamaranjs/service'

import { <%= h.changeCase.camel(serviceName) %> } from './<%= h.changeCase.camel(serviceName) %>'

async function start () {
	const serviceName = await Catamaran.createServiceWithStrategy(<%= h.changeCase.camel(serviceName) %>, InMemoryStrategy)
	await serviceName.start()
}

start().catch( console.error )
