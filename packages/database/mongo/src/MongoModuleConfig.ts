import { Configurable, Configuration } from '@chalupajs/interface'

@Configuration()
export class MongoModuleConfig {
	@Configurable({
		type: String,
	})
	url = 'mongodb://localhost:27017'
}
