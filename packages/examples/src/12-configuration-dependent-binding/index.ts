/*
 * 12. Configuration-dependent Binding
 *
 * 
 * Previously, we only created bindings statically: our inject() function had linear
 * control flow in it, and no runtime decisions were made on what to bind to the different
 * type keys. In this example, we explore configuration-dependent dynamic bindings: we
 * are going to decide which implementation to use, based on a configuration property.
 * 
 * Topic: Dependency Injection
 * Showcased features:
 *   * immediate.
 *   * @Configurable, @Configuration.
 *   * Injecting dependencies.
 */
import 'reflect-metadata'

import { LoggerFactory, Service, Inject, Injectable, ILogger, Configurable, Configuration, Constructor } from '@chalupajs/interface'
import { Chalupa, InMemoryStrategy } from '@chalupajs/service'

interface IFileStore {
    store(path: string): void
}

// In non-local environments, we are going to use this
// implementation.
@Injectable()
class S3FileStore implements IFileStore {
    private logger: ILogger

    constructor(loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.getLogger(S3FileStore)
    }

    store(path: string) {
        this.logger.info(`Storing in S3: ${path}`)
    }
}

// Locally, we are going to use this implementation.
@Injectable()
class FsFileStore implements IFileStore {
    private logger: ILogger

    constructor(loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.getLogger(FsFileStore)
    }

    store(path: string) {
        this.logger.info(`Storing on the file system: ${path}`)
    }
}

@Configuration()
class FileStoreConfig {
  // Whether we are in a local or non-local environment, is
  // decided by this configuration parameter.
  @Configurable({
    doc: 'The environment the application is executing in.',
    format: ['local', 'staging', 'production'],
  })
  env = 'production'

  // This method is a shorthand to check if the above property
  // is equal to local or not.
  isLocalEnv() {
    return this.env === 'local'
  }
}

const Types = {
    IFileStore: 'IFileStore'
}

@Service({
    // Generally, the inject function is a description of the
    // bindings in the context with no instantiations. However,
    // since we want to decide what implementation to bind, based
    // on a configuration property, we somehow have to obtain an
    // instance of FileStoreConfig.
    // 
    // We do so with the immediate() method. This method, when called,
    // creates a class binding to the specified class (FileStoreConfig,
    // in our case) and immediately instantiates it (hence the name).
    // Therefore, this class will be available for others in the form of
    // a binding, but we can use it right now to base our decision on its
    // property values.
    //
    // Having obtained an instance of FileStoreConfig, we use it to select
    // whether FsFileStore or S3FileStore should be bound to the Types.IFileStore
    // type key. You can change the return value of the isLocalEnv() method
    // by setting the
    //
    //   FILE_STORE_ENV
    //
    // environment variable to 'local' for example.
    //
    // Once the implementation is selected, the now well-known bindInterface
    // method is used to bind it to the Types.IFileStore key.
	inject(context) {
        const fileStoreConfig = context.immediate(FileStoreConfig)

        const fileStoreImpl: Constructor<IFileStore> = fileStoreConfig.isLocalEnv()
            ? FsFileStore
            : S3FileStore
    
        context.bindInterface(Types.IFileStore, fileStoreImpl)
	}
})
class FileStoreService {
    // Since we created the bindings based on constant/type keys, we
    // have to use the @Inject annotation for the actual injection
    // as well.
    // Observe, that in the case of Types.IDateTimeSource, even though
    // we used a constant binding, we specified the interface as the
    // parameter type instead of the BuiltInDateTimeSource implementation.
	constructor(@Inject(Types.IFileStore) fileStore: IFileStore) {
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
