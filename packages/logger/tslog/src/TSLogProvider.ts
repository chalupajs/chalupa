import { Logger, TLogLevelName } from 'tslog'
import { ILogger, ILogProvider, LogConfig, Inject, Injectable } from '@chalupajs/interface'
import { TSLogger } from './TSLogger'

@Injectable()
export class TSLogProvider implements ILogProvider {
	private readonly config: LogConfig

	constructor(@Inject(LogConfig) config: LogConfig) {
		this.config = config
	}

	createRootLogger(name: string): ILogger {
		const loggerInstance = new Logger({
			name,
			minLevel: this.config.level as TLogLevelName,
			type: this.config.pretty ? 'pretty' : 'json',
		})

		return new TSLogger(loggerInstance)
	}
}
