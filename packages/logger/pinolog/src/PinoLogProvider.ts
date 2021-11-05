import pino from 'pino'
import { ILogger, ILogProvider, LogConfig, Inject, Injectable } from '@chalupajs/interface'
import { PinoLogger } from './PinoLogger'

@Injectable()
export class PinoLogProvider implements ILogProvider {
	private readonly config: LogConfig

	constructor(@Inject(LogConfig) config: LogConfig) {
		this.config = config
	}

	createRootLogger(name: string): ILogger {
		const loggerInstance = pino({
			name,
			level: this.config.level,
			prettyPrint: this.config.pretty,
		})

		return new PinoLogger(loggerInstance)
	}
}
