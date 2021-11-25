import { Injectable, ILogger, LoggerFactory, Module } from '@chalupajs/interface'
import { IFileStore, IFileStoreKey } from './file-store'

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

@Module({
    inject(context) {
        context.bindInterface(IFileStoreKey, FsFileStore)
    }
})
export class FsFileStoreModule {}
