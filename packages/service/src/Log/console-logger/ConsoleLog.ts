export interface IConsoleLog {
	name: string
	level: string

	info (...args: any[]): void
	debug (...args: any[]): void
	warn (...args: any[]): void
	error (...args: any[]): void
	fatal (...args: any[]): void
	trace (...args: any[]): void

	child(name: string): IConsoleLog
}

export class ConsoleLog implements IConsoleLog {
	name: string;
	level: string

	constructor(name: string, level: string) {
		this.name = name;
		this.level = level;
	}

	private _getCurrentTime(): string {
		return (new Date()).toUTCString()
	}


	info (...args: any[]) {
		console.info(`[INFO][${this._getCurrentTime()}][${this.name}]`, ...args);
	}

	debug (...args: any[]) {
		console.debug(`[DEBUG][${this._getCurrentTime()}][${this.name}]`, ...args);
	}

	warn (...args: any[]) {
		console.warn(`[WARN][${this._getCurrentTime()}][${this.name}]`, ...args);
	}

	error (...args: any[]) {
		console.error(`[ERROR][${this._getCurrentTime()}][${this.name}]`, ...args);
	}
	fatal (...args: any[]) {
		console.error(`[FATAL][${this._getCurrentTime()}][${this.name}]`, ...args);
	}
	trace (...args: any[]) {
		console.trace(`[TRACE][${this._getCurrentTime()}][${this.name}]`, ...args);
	}

	child(name: string): IConsoleLog {
		return new ConsoleLog(name, this.level);
	}

}
