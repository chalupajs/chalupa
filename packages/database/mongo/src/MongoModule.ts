import { Db, MongoClient } from 'mongodb'
import { Inject, Module, PostServiceDestroy, PreServiceInit } from '@chalupajs/interface'
import { MongoModuleConfig } from './MongoModuleConfig'

@Module({
	inject: [MongoModuleConfig],
})
export class MongoModule {
	private readonly _connection: MongoClient
	private readonly _config: MongoModuleConfig
	constructor(@Inject(MongoModuleConfig) config: MongoModuleConfig) {
		this._config = config
		this._connection = new MongoClient(this._config.url)
	}

	@PreServiceInit()
	async connect() {
		await this._connection.connect()
	}

	@PostServiceDestroy()
	async closeConnection() {
		await this._connection.close()
	}

	getDB(name: string): Db {
		return this._connection.db(name)
	}
}
