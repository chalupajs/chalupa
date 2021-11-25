import { Injectable, ILogger, LoggerFactory, Module } from '@chalupajs/interface'
import { IFileStore, IFileStoreKey } from './file-store'

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

@Module({
    inject(context) {
        context.bindInterface(IFileStoreKey, S3FileStore)
    }
})
export class S3FileStoreModule {}
