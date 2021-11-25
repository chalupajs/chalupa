/*
 * 19. Dynamic Modules
 *
 * 
 * This example builds on the foundation of the 12. Configuration-dependent Bindings
 * example. However, in this case, we extracted the two IFileStore implementations,
 * S3FileStore and FsFileStore into their own modules, S3FileStoreModule and FsFileStoreModule,
 * respectively. Then, we decide at runtime which module to bind, based on the value of
 * the FILE_STORE_ENV environment variable.
 * 
 * Topic: Modules
 * Showcased features:
 *   * @Configuration and @Configurable.
 *   * @Module and modules.
 *   * immediate.
 */
import 'reflect-metadata'


import { Service, Inject, Configurable, Configuration, Constructor } from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'
import { FsFileStoreModule } from './fs-module'
import { S3FileStoreModule } from './s3-module'
import { IFileStore, IFileStoreKey } from './file-store'

@Configuration()
class FileStoreConfig {
  @Configurable({
    doc: 'The environment the application is executing in.',
    format: ['local', 'staging', 'production'],
  })
  env = 'production'

  isLocalEnv() {
    return this.env === 'local'
  }
}

@Service({
	inject(context) {
    const fileStoreConfig = context.immediate(FileStoreConfig)

    const fileStoreModule: Constructor = fileStoreConfig.isLocalEnv()
        ? FsFileStoreModule
        : S3FileStoreModule

    context.bindModule(fileStoreModule)
	}
})
class FileStoreService {
	constructor(@Inject(IFileStoreKey) fileStore: IFileStore) {
    fileStore.store('/data/pizza/hawaii.txt')
	}
}

async function start() {
	const service = await Chalupa
		.builder()
		.createServiceWithStrategy(FileStoreService, InMemoryStrategy)

	await service.start()
}

start().catch(console.error)
