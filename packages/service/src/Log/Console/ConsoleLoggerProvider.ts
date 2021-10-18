import { ILogger, ILogProvider, LogConfig, Injectable } from '@catamaranjs/interface'
import { ConsoleLog } from './ConsoleLog'
import { ConsoleLogger } from './ConsoleLogger'

@Injectable()
export class ConsoleLoggerProvider implements ILogProvider {
	private readonly config: LogConfig

	constructor(config: LogConfig) {
		this.config = config
	}

	createRootLogger(name: string): ILogger {
		return new ConsoleLogger(new ConsoleLog(name, this.config.level))
	}
}
