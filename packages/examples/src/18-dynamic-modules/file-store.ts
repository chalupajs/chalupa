export interface IFileStore {
    store(path: string): void
}

export const IFileStoreKey = 'IFileStore'
