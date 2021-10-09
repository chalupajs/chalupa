import { Configurable, Configuration } from '@catamaranjs/interface'

@Configuration()
export class MongoModuleConfig {
	@Configurable({
		type: String,
	})
	url = 'mongodb://localhost:27017'
}
