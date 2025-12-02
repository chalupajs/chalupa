import { Logger } from 'tslog'
import { ILogger, ILogProvider, LogConfig, Inject, Injectable, LogLevel } from '@chalupajs/interface'
import { TSLogger } from './TSLogger'

const LOG_LEVEL_MAP: Record<LogLevel, number> = {
	'trace': 1,
	'debug': 2,
	'info': 3,
	'warn': 4,
	'error': 5,
	'fatal': 6
}

@Injectable()
export class TSLogProvider implements ILogProvider {
	private readonly config: LogConfig

	constructor(@Inject(LogConfig) config: LogConfig) {
		this.config = config
	}

	createRootLogger(name: string): ILogger {
		const loggerInstance = new Logger({
			name,
			minLevel: LOG_LEVEL_MAP[this.config.level],
			type: this.config.pretty ? 'pretty' : 'json',
		})

		return new TSLogger(loggerInstance)
	}
}
