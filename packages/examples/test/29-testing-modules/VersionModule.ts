import {Inject, Module, ServiceMethod} from "@chalupajs/interface";

export const Constants = {
	Version: 'Version'
}

@Module()
export class VersionModule {
	private readonly _version: string

	constructor(@Inject(Constants.Version) version: string) {
		this._version = version
	}

	@ServiceMethod()
	async version(): Promise<string> {
		return this._version
	}
}
