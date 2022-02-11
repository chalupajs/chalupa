import 'reflect-metadata'

// ----------- Main -----------//
export { Chalupa, IChalupaBuilder } from './Interpretation/Chalupa'

// ----------- InMemoryStrategy -----------//
export { InMemoryStrategy } from './Communication/InMemory/InMemoryStrategy'
export { ConstructedService } from './Communication/InMemory/ConstructedService'
export { InMemoryCommunicationChannel } from './Communication/InMemory/InMemoryCommunicationChannel'
export { InMemoryFacade } from './Communication/InMemory/InMemoryFacade'

// ----------- Logging -----------//
export { ConsoleLoggerProvider } from './Log/Console/ConsoleLoggerProvider'
export { ConsoleLogger } from './Log/Console/ConsoleLogger'
export { IConsoleLog, ConsoleLog } from './Log/Console/ConsoleLog'

// ----------- Plugin -----------//
export { ConfigSources } from './Plugins/ConfigSources'
export { EnvPrefix } from './Plugins/EnvPrefix'
export { ExternalServicePlugin } from './Plugins/Internal/ExternalServicePlugin'

export * from './Plugins/Internal/MethodAspectPlugin'
