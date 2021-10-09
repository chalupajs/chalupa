import { ILogger, AbstractLoggerAdapter } from '@catamaranjs/interface'
import { IConsoleLog } from "./ConsoleLog";

export class ConsoleLogger extends AbstractLoggerAdapter {
	private readonly loggerInstance: IConsoleLog

	constructor(loggerInstance: IConsoleLog) {
		super(loggerInstance, loggerInstance.level)
		this.loggerInstance = loggerInstance
	}

	createChildLogger(name: string): ILogger {
		return new ConsoleLogger(this.loggerInstance.child(name))
	}
}
