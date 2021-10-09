import { Logger } from 'tslog'
import { ILogger, AbstractLoggerAdapter } from '@catamaranjs/interface'

export class TSLogger extends AbstractLoggerAdapter {
	private readonly loggerInstance: Logger

	constructor(loggerInstance: Logger) {
		super(loggerInstance, loggerInstance.settings.minLevel)
		this.loggerInstance = loggerInstance
	}

	createChildLogger(name: string): ILogger {
		return new TSLogger(this.loggerInstance.getChildLogger({ name }))
	}
}
