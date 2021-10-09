import { Logger as IPinoLogger } from 'pino'
import { ILogger, AbstractLoggerAdapter } from '@catamaranjs/interface'

export class PinoLogger extends AbstractLoggerAdapter {
	private readonly loggerInstance: IPinoLogger

	constructor(loggerInstance: IPinoLogger) {
		super(loggerInstance, loggerInstance.level)
		this.loggerInstance = loggerInstance
	}

	createChildLogger(name: string): ILogger {
		return new PinoLogger(this.loggerInstance.child({ module: name }))
	}
}
