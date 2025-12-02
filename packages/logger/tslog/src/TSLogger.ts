import { Logger } from 'tslog'
import { ILogger, AbstractLoggerAdapter, LogLevel } from '@chalupajs/interface'

const LOG_LEVEL_NUMBER_TO_MAP: Record<number, LogLevel> = {
	1: LogLevel.TRACE,
	2: LogLevel.DEBUG,
	3: LogLevel.INFO,
	4: LogLevel.WARN,
	5: LogLevel.ERROR,
	6: LogLevel.FATAL
}

export class TSLogger extends AbstractLoggerAdapter {
	private readonly loggerInstance: Logger<unknown>

	constructor(loggerInstance: Logger<unknown>) {
		super(loggerInstance, LOG_LEVEL_NUMBER_TO_MAP[loggerInstance.settings.minLevel])
		this.loggerInstance = loggerInstance
	}

	createChildLogger(name: string): ILogger {
		return new TSLogger(this.loggerInstance.getSubLogger({ name }))
	}
}
