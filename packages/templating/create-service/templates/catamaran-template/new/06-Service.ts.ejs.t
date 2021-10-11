---
to: src/<%= h.changeCase.camel(serviceName) %>.ts
---
import "reflect-metadata"

import { Service, PostInit, LoggerFactory, ILogger } from '@catamaranjs/interface'

@Service()
export class <%= h.changeCase.camel(serviceName) %> {
	private _logger: ILogger

	constructor(loggerFactory: LoggerFactory) {
		this._logger = loggerFactory.getLogger(<%= h.changeCase.camel(serviceName) %>.name)
	}

	@PostInit()
	init() {
		this._logger.info('<%= h.changeCase.camel(serviceName) %> service inited successfully')
	}

}
